import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { getMaxFileSizeBytes, getUploadDir } from "@/lib/env";

/**
 * MIME type yang sah untuk tiap ekstensi.
 *
 * Dipakai sebagai satu peta, bukan dua set terpisah. Kalau ekstensi dan MIME
 * dicek secara terpisah, kombinasi seperti ".png" + "application/pdf" lolos
 * karena keduanya ada di daftar, padahal tidak pernah ada berkas PDF bernama
 * .png. Pasangan satu-ke-satu juga lebih mudah dibaca saat menambah format.
 */
const MIME_PER_EXTENSI: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png"
};

/**
 * Tanda tangan biner (magic bytes) per ekstensi yang diizinkan.
 *
 * Ekstensi dan MIME type berasal dari klien dan bisa dipalsukan sesuka hati,
 * sedangkan bytes pertama berkas tidak. Berkas ini dibaca balik lewat endpoint
 * preview milik admin dan ikut masuk ke container sebagai volume, jadi
 * pemeriksaan di sini yang menolak berkas .pdf yang sebenarnya berisi HTML
 * atau .jpg yang sebenarnya berisi script.
 *
 * Setiap entri adalah daftar [offset, byte yang harus ada di offset itu], jadi
 * PNG bisa dicek dengan dua potongan signature-nya sekaligus.
 */
const MAGIC_BYTES: Record<string, [number, number[]][]> = {
  ".pdf": [[0, [0x25, 0x50, 0x44, 0x46]]],
  ".jpg": [[0, [0xff, 0xd8, 0xff]]],
  ".jpeg": [[0, [0xff, 0xd8, 0xff]]],
  // Signature PNG 8 byte: 0x89 "PNG" CRLF, lalu 0x1A 0x0A.
  ".png": [
    [0, [0x89, 0x50, 0x4e, 0x47]],
    [4, [0x0d, 0x0a, 0x1a, 0x0a]]
  ],
  // .doc adalah OLE2 compound file, sama seperti .xls lama.
  ".doc": [[0, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]]],
  // .docx adalah ZIP, jadi yang dicek hanya magic number ZIP-nya. Isi ZIP tidak
  // diperiksa lebih jauh karena membutuhkan pustaka tambahan.
  ".docx": [[0, [0x50, 0x4b, 0x03, 0x04]]]
};

/**
 * Cocokkan bytes pertama berkas dengan format yang diklaim ekstensinya.
 *
 * Dicocokkan ke ekstensi, bukan ke "format apa pun yang diizinkan", supaya
 * berkas .doc yang isinya PDF ikut ditolak. Kalau hanya dicek "cocok salah satu
 * format", isi apa pun yang sah untuk format lain akan lolos.
 */
function cocokMagicBytes(buffer: Buffer, extension: string) {
  const offsets = MAGIC_BYTES[extension];
  if (!offsets) return false;

  return offsets.every(([offset, expected]) =>
    expected.every((byte, index) => buffer[offset + index] === byte)
  );
}

export type UploadOptions = {
  pdfOnly?: boolean;
  maxSizeBytes?: number;
};

export async function saveUploadedFile(file: File, options: UploadOptions = {}) {
  if (!file || file.size === 0) {
    throw new Error("Surat pengajuan wajib diunggah.");
  }

  const maxSizeBytes = options.maxSizeBytes ?? getMaxFileSizeBytes();
  if (file.size > maxSizeBytes) {
    const mb = Math.round(maxSizeBytes / (1024 * 1024));
    throw new Error(`Ukuran file maksimal ${mb} MB.`);
  }

  const originalName = file.name || "surat-pengajuan";
  const extension = path.extname(originalName).toLowerCase();

  // Ekstensi dan MIME type harus saling cocok, bukan hanya masing-masing ada
  // di daftar. Ini yang menolak ".png" yang diklaim sebagai PDF.
  const mimeHarus = MIME_PER_EXTENSI[extension];
  const formatSesuai = mimeHarus !== undefined && file.type === mimeHarus;

  if (options.pdfOnly) {
    if (extension !== ".pdf" || !formatSesuai) {
      throw new Error("Format file harus PDF.");
    }
  } else if (!formatSesuai) {
    throw new Error("Format file harus PDF, DOC, DOCX, JPG, atau PNG.");
  }

  // Buffer dibaca sebelum direktori upload disentuh, supaya berkas yang
  // MAGIC_BYTES-nya tidak cocok tidak pernah sampai ke disk.
  const buffer = Buffer.from(await file.arrayBuffer());

  // Pemeriksaan magic bytes menolak berkas yang dibubuhi MIME/ekstensi palsu.
  if (!cocokMagicBytes(buffer, extension)) {
    throw new Error("Isi file tidak sesuai dengan format yang dipilih. Harap unggah berkas asli.");
  }

  const uploadDir = getUploadDir();
  await fs.mkdir(uploadDir, { recursive: true });

  const safeName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
  const absolutePath = path.join(uploadDir, safeName);
  await fs.writeFile(absolutePath, buffer);

  return {
    relativePath: safeName,
    originalName,
    mimeType: file.type,
    sizeBytes: file.size
  };
}

/**
 * Ubah nama berkas tersimpan menjadi path absolut yang pasti berada di dalam
 * direktori upload.
 *
 * Pengecekan pakai path.relative, bukan startsWith. String "/app/uploads2/x"
 * tetap startsWith "/app/uploads", sehingga direktori lain yang namanya diawali
 * "uploads" bisa lolos. path.relative mengembalikan bentuk "..\..." untuk
 * apa pun yang berada di luar direktori upload, dan tidak bisa dikelabui seperti
 * itu.
 */
export function resolveUploadPath(relativePath: string) {
  const uploadDir = path.resolve(getUploadDir());
  const absolute = path.resolve(uploadDir, relativePath);
  const relatif = path.relative(uploadDir, absolute);

  if (relatif === "" || relatif.startsWith("..") || path.isAbsolute(relatif)) {
    throw new Error("Path file tidak valid.");
  }
  return absolute;
}

/**
 * Hapus berkas unggahan, mis. setelah admin mengganti lampiran.
 *
 * Kegagalan sengaja ditelan: pemanggil memanggilnya setelah transaksi
 * database selesai, jadi berkas yang sudah tidak terpakai tidak boleh
 * membuat permintaan gagal. ENOENT berarti berkas sudah hilang di luar
 * aplikasi, juga bukan error.
 */
export async function deleteUploadedFile(relativePath: string | null | undefined) {
  if (!relativePath) return;

  try {
    await fs.unlink(resolveUploadPath(relativePath));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    console.error(`[HAPUS BERKAS GAGAL] ${relativePath}:`, error);
  }
}
