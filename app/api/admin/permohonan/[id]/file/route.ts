import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { ambilBerkasPermohonan } from "@/lib/permohonan-file";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ message: "Tidak berwenang." }, { status: 401 });

  const url = new URL(request.url);
  const hasil = await ambilBerkasPermohonan(
    url.searchParams.get("jenis") || "liputan",
    Number(params.id),
    url.searchParams.get("file")
  );

  if (hasil === "permohonan") {
    return NextResponse.json({ message: "Data tidak ditemukan." }, { status: 404 });
  }
  if (hasil === "file") {
    return NextResponse.json({ message: "Tidak ada lampiran untuk data ini." }, { status: 404 });
  }
  if (hasil === "hilang") {
    return NextResponse.json(
      { message: "Berkas lampiran tidak ditemukan di server. Hubungi administrator." },
      { status: 410 }
    );
  }

  return new NextResponse(hasil.body, {
    headers: {
      "Content-Type": hasil.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(hasil.originalName)}"`
    }
  });
}
