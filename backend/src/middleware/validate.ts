import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '../utils/ApiError';

type Source = 'body' | 'query' | 'params';

export function validate(schema: ZodType, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const details = result.error.issues.slice(0, 20).map((i) => ({ path: i.path.join('.'), message: i.message }));
      throw ApiError.badRequest('Validation failed', details);
    }
    req.valid = req.valid || {};
    req.valid[source] = result.data;
    if (source === 'body') req.body = result.data;
    next();
  };
}

/** Initialise req.valid so handlers can always read it. */
export function initValid(req: Request, _res: Response, next: NextFunction) {
  req.valid = {};
  next();
}
