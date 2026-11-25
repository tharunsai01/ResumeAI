import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

export const validate =
  (schema: ZodType, target: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse(req[target]);
    if (target === 'query') {
      // Express 5 exposes query through a getter. Controllers must receive the parsed object.
      Object.defineProperty(req, 'query', { value: parsed, configurable: true });
    } else {
      req[target] = parsed;
    }
    next();
  };
