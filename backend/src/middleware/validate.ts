import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

export const validate =
  (schema: ZodType, target: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[target]);
    if (target === 'query') {
      // In Express 5, req.query is a getter property and cannot be reassigned directly
      for (const key of Object.keys(req.query)) {
        delete (req.query as any)[key];
      }
      Object.assign(req.query, parsed);
    } else {
      req[target] = parsed;
    }
    next();
  };
