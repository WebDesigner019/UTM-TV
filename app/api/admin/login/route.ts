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

/**
 * Hash bcrypt milik aplikasi untuk email yang tidak terdaftar.
 *
 * Nilai acak dengan cost 12 yang tidak pernah cocok dengan apa pun. Hanya
 * dipakai supaya jalur "email tidak ada" tetap menjalankan bcrypt.compare,
 * yang mahal, sama lamanya dengan jalur "password salah". Tanpa ini waktu
 * respons jadi pembeda yang membuka daftar email admin.
 */
const DUMMY_PASSWORD_HASH = "$2a$12$UwEwQsTB.iDcV5utAZVZ4e4DLJyz5RuLWiOEDVVBKfpRzsF39H7my";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-login:ip:${ip}`, 8, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  let body: z.infer<typeof schema>;

  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ message: "Data login tidak valid." }, { status: 400 });
  }

// Limit kedua, per akun, dengan jendela yang lebih longgar. Limit per IP saja
  // tidak menahan serangan tebak password yang dilanjutkan dari banyak IP,
// sedangkan ini menahan percobaan terhadap satu akun dari mana pun.
  //
  // Email dinormalisasi supaya "TV@x.id" dan "tv@x.id" berbagi bucket yang sama.
  const email = normalizeEmail(body.email);
  const limitedEmail = rateLimit(`admin-login:email:${email}`, 20, 15 * 60 * 1000);
  if (!limitedEmail.ok) {
    return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    // Password tetap dibandingkan walau admin tidak ada, dengan hash bcrypt
    // tetap, supaya waktu respons tidak membocorkan email mana yang terdaftar.
    const passwordHash = admin?.passwordHash || DUMMY_PASSWORD_HASH;
    const passwordOk = await bcrypt.compare(body.password, passwordHash);

    if (!admin || !passwordOk) {
      console.warn(`[LOGIN GAGAL] email=${email} ip=${ip}`);
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
