import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/env";
import { getAppUrl } from "@/lib/env";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createResetToken, hashResetToken } from "@/lib/password-reset";
import { sendAdminPasswordResetEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email("Email tidak valid.")
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-forgot:${ip}`, 5, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const body = schema.parse(await request.json());
    const email = normalizeEmail(body.email);
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (admin) {
      const token = createResetToken();
      const tokenHash = hashResetToken(token);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      await prisma.adminPasswordResetToken.create({
        data: {
          adminId: admin.id,
          tokenHash,
          expiresAt
        }
      });

      const resetUrl = `${getAppUrl()}/admin/reset-password?token=${encodeURIComponent(token)}`;
      await sendAdminPasswordResetEmail({
        email: admin.email,
        nama: admin.nama,
        resetUrl
      }).catch((error) => console.error("Gagal mengirim email reset password:", error));
    }

    return NextResponse.json({
      message: "Jika email terdaftar sebagai admin, tautan reset password akan dikirim."
    });
  } catch {
    return NextResponse.json({ message: "Jika email terdaftar sebagai admin, tautan reset password akan dikirim." });
  }
}
