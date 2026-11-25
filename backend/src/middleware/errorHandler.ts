import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { recordAuditLog } from '../services/audit.service';
import { isProd } from '../config/env';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let status = 500;
  let message = 'Internal server error';
  let details: unknown;

  const parserError = err as { type?: string; status?: number } | null;
  if (parserError?.type === 'entity.parse.failed' && parserError.status === 400) {
    status = 400;
    message = 'Malformed request body';
  } else if (parserError?.type === 'entity.too.large' && parserError.status === 413) {
    status = 413;
    message = 'Request body exceeds the maximum size';
  } else if (err instanceof ApiError) {
    status = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    status = 400;
    message = 'Validation failed';
    details = err.flatten().fieldErrors;
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Validation failed';
    details = Object.fromEntries(
      Object.entries(err.errors).map(([field, e]) => [field, e.message]),
    );
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if ((err as { code?: number })?.code === 11000) {
    status = 409;
    message = 'Duplicate value';
    details = (err as { keyValue?: unknown }).keyValue;
  }

  if ((status === 401 || status === 403) && req.route?.path !== '/login') {
    void recordAuditLog({
      action: 'SECURITY_ACCESS_DENIED',
      actorId: req.user?.id,
      actorRole: req.user?.role,
      status: 'failure',
      details: { method: req.method, statusCode: status },
    });
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    success: false,
    error: {
      message,
      ...(details ? { details } : {}),
      ...(!isProd && status >= 500 && err instanceof Error ? { stack: err.stack } : {}),
    },
  });
}
