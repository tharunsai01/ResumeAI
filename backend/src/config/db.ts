import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

// NoSQL-injection defence is layered: Express 5's "simple" query parser never builds
// nested objects, every input is parsed by a Zod schema into primitive types, and
// sanitizeBody() strips $-prefixed and dotted keys from JSON bodies. Global
// sanitizeFilter is not used because it would also neutralise server-built operators.
mongoose.set('strictQuery', true);

export async function connectDatabase(uri = env.MONGO_URI): Promise<typeof mongoose> {
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, maxPoolSize: 20 });
  logger.info({ host: conn.connection.host, db: conn.connection.name }, 'MongoDB connected');
  return conn;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

export async function pingDatabase(): Promise<{ ok: boolean; latencyMs: number | null }> {
  const started = Date.now();
  try {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) return { ok: false, latencyMs: null };
    await mongoose.connection.db.admin().ping();
    return { ok: true, latencyMs: Date.now() - started };
  } catch {
    return { ok: false, latencyMs: null };
  }
}
