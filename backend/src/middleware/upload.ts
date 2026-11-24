import multer from 'multer';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { extensionOf } from '../utils/fileSecurity';

const ALLOWED_EXT = new Set(['pdf', 'docx']);
const ALLOWED_MIME = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream', // some browsers send this for .docx
]);

/** Files stay in memory until their magic bytes are verified; nothing unverified touches disk. */
export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024, files: 1, fields: 5 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_EXT.has(extensionOf(file.originalname)) || !ALLOWED_MIME.has(file.mimetype)) {
      cb(ApiError.badRequest('Only PDF and DOCX files are accepted'));
      return;
    }
    cb(null, true);
  },
}).single('file');
