import { createHash } from "node:crypto";

/** SHA-256 of a file, as hex. Used to recognise the same resume again and in audit logs. */
export function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}