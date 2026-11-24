import fs from 'node:fs';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';
import { Resume } from './models';
import { logger } from './utils/logger';

async function main() {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true, mode: 0o750 });
  await connectDatabase();

  // Resumes interrupted by a restart are marked failed so candidates can retry them.
  const stuck = await Resume.updateMany(
    { status: { $in: ['uploaded', 'validating', 'extracting', 'detecting_skills', 'analysing_experience', 'generating_report'] } },
    { status: 'failed', error: 'Processing was interrupted. Please retry.' },
  );
  if (stuck.modifiedCount) logger.warn({ count: stuck.modifiedCount }, 'Marked interrupted resumes as failed');

  const server = createApp().listen(env.PORT, () => logger.info({ port: env.PORT, env: env.NODE_ENV }, 'HireSmart API listening'));

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Shutting down');
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start');
  process.exit(1);
});
