import path from "path";

export function getAllowedDomains() {
  return (process.env.ALLOWED_EMAIL_DOMAINS || "student.trunojoyo.ac.id,trunojoyo.ac.id")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isAllowedCampusEmail(email: string) {
  const normalized = normalizeEmail(email);
  return getAllowedDomains().some((domain) => normalized.endsWith(`@${domain}`));
}

export function getMaxFileSizeBytes() {
  const mb = Number(process.env.MAX_FILE_SIZE_MB || "10");
  return mb * 1024 * 1024;
}

export function getUploadDir() {
  const configured = process.env.UPLOAD_DIR || "./uploads";
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
}

export function getAppUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
