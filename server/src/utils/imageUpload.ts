import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { ApiError } from './ApiError';

export const UPLOAD_ROOT = path.resolve(env.UPLOAD_DIR);
const AVATAR_DIR = path.join(UPLOAD_ROOT, 'avatars');
fs.mkdirSync(AVATAR_DIR, { recursive: true });

// Memory storage: nothing touches the disk until the content has been checked
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});

// Identify the real type from the first bytes
function detectImage(buf: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  return null;
}

export async function saveAvatar(file: Express.Multer.File | undefined): Promise<string> {
  if (!file) throw ApiError.badRequest('No file uploaded (the field must be named "avatar")');
  const ext = detectImage(file.buffer);
  if (!ext) throw ApiError.badRequest('Only JPEG, PNG or WebP images are allowed');

  const name = `${crypto.randomUUID()}.${ext}`; // the client's file name is never used
  await fs.promises.writeFile(path.join(AVATAR_DIR, name), file.buffer);
  return `/uploads/avatars/${name}`;
}

export async function deleteAvatar(url?: string | null) {
  if (!url?.startsWith('/uploads/avatars/')) return;
  // basename() strips any "../" so a stored value can never point outside the folder
  await fs.promises.unlink(path.join(AVATAR_DIR, path.basename(url))).catch(() => {});
}
