import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { corsOrigins, env } from './config/env';
import { pingDatabase } from './config/db';
import { errorHandler, notFound } from './middleware/error';
import { apiLimiter, collectMetrics, sanitizeBody } from './middleware/security';
import { initValid } from './middleware/validate';
import { api } from './routes';
import { logger } from './utils/logger';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);
  app.set('query parser', 'simple'); // flat query strings only; no ?a[$ne]= objects

  app.use(
    helmet({
      contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || corsOrigins.includes(origin)),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      maxAge: 600,
    }),
  );
  app.use(collectMetrics);
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));
  app.use(express.json({ limit: '200kb' }));
  app.use(express.urlencoded({ extended: false, limit: '50kb' }));
  app.use(cookieParser());
  app.use(sanitizeBody);
  app.use(initValid);

  app.get('/health', async (_req, res) => {
    const db = await pingDatabase();
    res.status(db.ok ? 200 : 503).json({ status: db.ok ? 'ok' : 'degraded', database: db.ok ? 'up' : 'down', uptime: Math.round(process.uptime()) });
  });

  app.use('/api/v1', apiLimiter, api);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
