import fs from "fs/promises";
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Tidak berwenang." }, { status: 401 });

  const id = Number(params.id);
  const permohonan = await prisma.permohonan.findUnique({ where: { id } });
  if (!permohonan) return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });

  const file = await fs.readFile(resolveUploadPath(permohonan.filePath));
  return new NextResponse(file, {
    headers: {
      "Content-Type": permohonan.fileMimeType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(permohonan.fileOriginalName)}"`
    }
  });
}
