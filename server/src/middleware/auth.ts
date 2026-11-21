import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../utils/tokens';
import { User } from '../models';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing access token'));
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired access token'));
  }
}

export async function requireVerified(req: Request, _res: Response, next: NextFunction) {
  const user = await User.findById(req.user!.id).select('isVerified');
  if (!user?.isVerified) return next(ApiError.forbidden('Please verify your email first'));
  next();
}

export const authorize =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have access to this resource'));
    }
    next();
  };

export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  // Check the DB, not the token: roles and status can change after a token was issued
  const user = await User.findById(req.user!.id).select('role status');
  if (!user || user.role !== 'admin' || user.status !== 'active') {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
}
