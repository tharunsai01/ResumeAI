import crypto from 'node:crypto';
import path from 'node:path';

export type AllowedFileType = 'pdf' | 'docx';

/** Identify a file by its first bytes, never by its name or the client's MIME type. */
export function detectFileType(buffer: Buffer): AllowedFileType | null {
  if (buffer.length < 8) return null;
  if (buffer.subarray(0, 5).toString('latin1') === '%PDF-') return 'pdf';
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    // DOCX is a ZIP whose central directory lists word/document.xml
    if (buffer.includes(Buffer.from('word/document.xml'))) return 'docx';
  }
  return null;
}

export function extensionOf(name: string): string {
  return path.extname(name || '').toLowerCase().replace('.', '');
}

/** Keep a display-safe version of the original file name (never used as a path). */
export function sanitizeDisplayName(name: string): string {
  const base = path.basename(name || 'resume').normalize('NFKC');
  const clean = base.replace(/[^\w.\- ()]/g, '_').replace(/\.{2,}/g, '.').trim();
  return clean.slice(-120) || 'resume';
}

export function storedFileName(type: AllowedFileType): string {
  return `${crypto.randomUUID()}.${type}`;
}

/** Resolve a stored path and guarantee it stays inside the upload root. */
export function safeJoin(root: string, ...parts: string[]): string {
  const resolvedRoot = path.resolve(root);
  const target = path.resolve(resolvedRoot, ...parts);
  if (target !== resolvedRoot && !target.startsWith(resolvedRoot + path.sep)) {
    throw new Error('Path traversal attempt blocked');
  }
  return target;
}

export function sha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
