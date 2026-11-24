import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { isTest } from '../config/env';

const skip = () => isTest;

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, slow down' } },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Try again later.' } },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Upload limit reached. Try again later.' } },
});

/**
 * Remove MongoDB operator keys ($gt, $where...) and dotted keys from JSON bodies.
 * Mongoose's sanitizeFilter is the second layer of defence.
 */
export function stripOperators(value: unknown, depth = 0): unknown {
  if (depth > 10) return undefined;
  if (Array.isArray(value)) return value.map((v) => stripOperators(v, depth + 1));
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith('$') || key.includes('.') || key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      out[key] = stripOperators(v, depth + 1);
    }
    return out;
  }
  return value;
}

export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') req.body = stripOperators(req.body);
  next();
}

// --- lightweight in-memory metrics for the admin health page -------------------
const durations: number[] = [];
export const metrics = { started: Date.now(), requests: 0, errors5xx: 0, errors4xx: 0 };

export function collectMetrics(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    metrics.requests += 1;
    if (res.statusCode >= 500) metrics.errors5xx += 1;
    else if (res.statusCode >= 400) metrics.errors4xx += 1;
    durations.push(Number(process.hrtime.bigint() - start) / 1e6);
    if (durations.length > 1000) durations.shift();
  });
  next();
}

export function metricsSnapshot() {
  const sorted = [...durations].sort((a, b) => a - b);
  const pct = (p: number) => (sorted.length ? Math.round(sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] * 10) / 10 : null);
  return {
    uptimeSeconds: Math.round((Date.now() - metrics.started) / 1000),
    requests: metrics.requests,
    errorRate: metrics.requests ? Math.round((metrics.errors5xx / metrics.requests) * 10000) / 100 : 0,
    clientErrorRate: metrics.requests ? Math.round((metrics.errors4xx / metrics.requests) * 10000) / 100 : 0,
    avgResponseMs: sorted.length ? Math.round((sorted.reduce((a, b) => a + b, 0) / sorted.length) * 10) / 10 : null,
    p95ResponseMs: pct(0.95),
    memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
  };
}
