import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAdminToken, setAdminCookie } from "@/lib/auth";
import { normalizeEmail } from "@/lib/env";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(1, "Password wajib diisi.")
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-login:${ip}`, 8, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  let body: z.infer<typeof schema>;

  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ message: "Data login tidak valid." }, { status: 400 });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { email: normalizeEmail(body.email) }
    });

    if (!admin || !(await bcrypt.compare(body.password, admin.passwordHash))) {
      return NextResponse.json({ message: "Email atau password salah." }, { status: 401 });
    }

    setAdminCookie(createAdminToken(admin));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login admin gagal:", error);
    return NextResponse.json(
      { message: "Koneksi database gagal. Periksa konfigurasi MySQL dan jalankan migrasi." },
      { status: 500 }
    );
  }
}
