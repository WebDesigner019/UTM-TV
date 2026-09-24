import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { getMaxFileSizeBytes, getUploadDir } from "@/lib/env";

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png"
]);

const allowedExtensions = new Set([".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]);

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

  if (options.pdfOnly) {
    if (extension !== ".pdf" && (file.type !== "application/pdf" && !file.type.includes("pdf"))) {
      throw new Error("Format file harus PDF.");
    }
  } else if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.type)) {
    throw new Error("Format file harus PDF, DOC, DOCX, JPG, atau PNG.");
  }

  const uploadDir = getUploadDir();
  await fs.mkdir(uploadDir, { recursive: true });

  const safeName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
  const absolutePath = path.join(uploadDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absolutePath, buffer);

  return {
    relativePath: safeName,
    originalName,
    mimeType: file.type,
    sizeBytes: file.size
  };
}

export function resolveUploadPath(relativePath: string) {
  const uploadDir = getUploadDir();
  const absolute = path.resolve(uploadDir, relativePath);
  if (!absolute.startsWith(path.resolve(uploadDir))) {
    throw new Error("Path file tidak valid.");
  }
  return absolute;
}
