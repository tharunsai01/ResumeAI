import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(5000),
  MONGO_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/hiresmart'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().positive().default(7),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  PUBLIC_API_URL: z.string().default('http://localhost:5000'),
  AI_SERVICE_URL: z.string().default('http://127.0.0.1:8000'),
  AI_SERVICE_TOKEN: z.string().min(16, 'AI_SERVICE_TOKEN must be at least 16 characters'),
  AI_TIMEOUT_MS: z.coerce.number().int().default(60000),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(5),
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),
  LINKEDIN_CLIENT_ID: z.string().default(''),
  LINKEDIN_CLIENT_SECRET: z.string().default(''),
  LOG_LEVEL: z.string().default('info'),
  TRUST_PROXY: z.coerce.number().int().default(0),
  AUDIT_RETENTION_DAYS: z.coerce.number().int().default(365),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:\n' + parsed.error.issues.map((i) => ` - ${i.path.join('.')}: ${i.message}`).join('\n'));
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const corsOrigins = env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
