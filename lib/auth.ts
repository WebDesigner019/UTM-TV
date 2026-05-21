import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "utm_tv_admin";

type AdminToken = {
  sub: string;
  email: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET atau SESSION_SECRET belum dikonfigurasi.");
  }
  return secret;
}

export function createAdminToken(admin: { id: number; email: string }) {
  return jwt.sign({ sub: String(admin.id), email: admin.email }, getJwtSecret(), {
    expiresIn: "8h"
  });
}

export function setAdminCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

export function clearAdminCookie() {
  cookies().delete(COOKIE_NAME);
}

export async function getCurrentAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, getJwtSecret()) as AdminToken;
    const id = Number(payload.sub);
    if (!Number.isInteger(id)) return null;

    return prisma.admin.findUnique({
      where: { id },
      select: { id: true, nama: true, email: true }
    });
  } catch {
    return null;
  }
}
