/**
 * Validates file buffer magic bytes to ensure file type authenticity.
 * Protects against extension spoofing and malicious executable uploads.
 */

export type AllowedMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function detectMimeFromBuffer(buffer: Buffer): AllowedMimeType | null {
  if (!buffer || buffer.length < 4) {
    return null;
  }

  // PDF signature: %PDF (0x25 0x50 0x44 0x46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return 'application/pdf';
  }

  // DOCX (ZIP package) signature: PK\x03\x04 (0x50 0x4B 0x03 0x04)
  if (
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  ) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  return null;
}
