import fs from "fs/promises";
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveUploadPath } from "@/lib/upload";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Tidak berwenang." }, { status: 401 });

  const id = Number(params.id);
  const url = new URL(request.url);
  const jenis = url.searchParams.get("jenis") || "liputan";

  let permohonan: any = null;
  if (jenis === "liputan") {
    permohonan = await prisma.permohonanLiputan.findUnique({ where: { id } });
  } else if (jenis === "media_partner") {
    permohonan = await prisma.permohonanMediaPartner.findUnique({ where: { id } });
  } else if (jenis === "kerjasama") {
    permohonan = await prisma.permohonanKerjasama.findUnique({ where: { id } });
  }
  if (!permohonan) return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });

  const file = await fs.readFile(resolveUploadPath(permohonan.filePath));
  return new NextResponse(file, {
    headers: {
      "Content-Type": permohonan.fileMimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(permohonan.fileOriginalName)}"`
    }
  });
}