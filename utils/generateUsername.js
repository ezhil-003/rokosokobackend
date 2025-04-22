// utils/generateUsername.js
import crypto from "crypto";

export function generateUsername(base) {
  const cleaned = base.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  const suffix = crypto.randomBytes(2).toString("hex"); // 4 chars
  return `${cleaned}_${suffix}`;
}