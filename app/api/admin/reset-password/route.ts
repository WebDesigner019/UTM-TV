import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { hashResetToken } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(20, "Token tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter.")
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limited = rateLimit(`admin-reset:${ip}`, 8, 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ message: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  try {
    const body = schema.parse(await request.json());
    const tokenHash = hashResetToken(body.token);
    const resetToken = await prisma.adminPasswordResetToken.findUnique({
      where: { tokenHash },
      include: { admin: true }
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ message: "Tautan reset password tidak valid atau sudah kedaluwarsa." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    await prisma.$transaction([
      prisma.admin.update({
        where: { id: resetToken.adminId },
        data: { passwordHash }
      }),
      prisma.adminPasswordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() }
      }),
      prisma.adminPasswordResetToken.updateMany({
        where: {
          adminId: resetToken.adminId,
          usedAt: null,
          id: { not: resetToken.id }
        },
        data: { usedAt: new Date() }
      })
    ]);

    return NextResponse.json({ message: "Password baru berhasil disimpan." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0]?.message || "Data tidak valid." }, { status: 400 });
    }
    return NextResponse.json({ message: "Password gagal diperbarui." }, { status: 400 });
  }
}
