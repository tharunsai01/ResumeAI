import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { isProd } from '../config/env';

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `Route ${req.method} ${req.path} not found`, 'ROUTE_NOT_FOUND'));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let error: ApiError;
  if (err instanceof ApiError) error = err;
  else if (err instanceof multer.MulterError) {
    error = new ApiError(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400, err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message, err.code);
  } else if (err instanceof mongoose.Error.ValidationError) {
    error = ApiError.badRequest('Invalid data', Object.values(err.errors).map((e) => ({ path: e.path, message: e.message })));
  } else if (err instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Invalid ${err.path}`);
  } else if (typeof err === 'object' && err && (err as { code?: number }).code === 11000) {
    error = ApiError.conflict('A record with these details already exists');
  } else if (typeof err === 'object' && err && (err as { type?: string }).type === 'entity.parse.failed') {
    error = ApiError.badRequest('Malformed JSON body');
  } else if (typeof err === 'object' && err && (err as { type?: string }).type === 'entity.too.large') {
    error = new ApiError(413, 'Request body too large', 'PAYLOAD_TOO_LARGE');
  } else {
    logger.error({ err, path: req.path }, 'Unhandled error');
    error = new ApiError(500, isProd ? 'Something went wrong' : String((err as Error)?.message || err), 'INTERNAL_ERROR');
  }
  if (error.status >= 500) logger.error({ code: error.code, path: req.path }, error.message);
  res.status(error.status).json({
    success: false,
    error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) },
  });
}
