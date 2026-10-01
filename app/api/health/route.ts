import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMaxFileSizeBytes, getUploadDir } from "@/lib/env";
import fs from "node:fs/promises";

export const dynamic = "force-dynamic";

/**
 * Health check untuk orkestrator (Docker healthcheck, load balancer, monitor).
 *
 * Yang dicek hanya hal yang bikin aplikasi tidak bisa melayani permintaan:
 * koneksi database, JWT_SECRET, dan direktori upload yang bisa ditulisi.
 *
 * Rincian kegagalan sengaja tidak dikembalikan ke klien. Endpoint ini tidak
 * butuh autentikasi, jadi pesan error dari driver database atau path absolut
 * direktori upload akan jadi peta gratis bagi siapa saja yang memindai port.
 * Rinciannya ditulis ke log container, yang hanya bisa dibaca operator.
 */
export async function GET() {
  const masalah: string[] = [];

  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) masalah.push("JWT_SECRET/SESSION_SECRET belum diisi");

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    masalah.push("database tidak dapat dijangkau");
    console.error("[HEALTH] Cek database gagal:", error);
  }

  const uploadDir = getUploadDir();
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.access(uploadDir, fs.constants.W_OK);
  } catch (error) {
    masalah.push(`direktori upload tidak bisa ditulisi (${uploadDir})`);
    console.error(`[HEALTH] Cek direktori upload ${uploadDir} gagal:`, error);
  }

  if (masalah.length > 0) {
    console.error(`[HEALTH] unhealthy: ${masalah.join("; ")}`);
    return NextResponse.json(
      { status: "unhealthy" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      status: "ok",
      waktu: new Date().toISOString(),
      maksUploadMb: Math.round(getMaxFileSizeBytes() / (1024 * 1024))
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
