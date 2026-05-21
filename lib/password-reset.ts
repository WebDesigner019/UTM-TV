import crypto from "crypto";

export function createResetToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
