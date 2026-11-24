import type { Role } from '../constants';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: Role; email: string; name: string };
      /** Zod-validated input. Express 5 makes req.query read-only, so parsed values live here. */
      valid: { body?: any; query?: any; params?: any };
    }
  }
}

export {};
