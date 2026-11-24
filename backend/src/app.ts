import express from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env, isProd } from './config/env';
import routes from './routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

import healthRoutes from './routes/health.routes';

const app = express();

app.disable('x-powered-by');
app.use(helmet());

const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(isProd ? 'combined' : 'dev'));

// Direct root and health endpoints
app.get('/', (_req, res) => {
  res.redirect('/api/v1');
});
app.use('/health', healthRoutes);

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: isProd ? 300 : 50000,
    skip: () => !isProd,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, error: { message: 'Too many requests, please try again later' } },
  }),
);


const docs = path.resolve(__dirname, '../docs');
app.get(/^\/api\/docs$/, (_req, res) => res.redirect('/api/docs/'));
app.use('/api/docs', (_req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self'; connect-src 'self'; frame-ancestors 'none'");
  next();
});
app.use('/api/docs', express.static(docs));
app.use('/api/docs/assets', express.static(path.dirname(require.resolve('swagger-ui-dist/package.json'))));

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

export { app };
export default app;
