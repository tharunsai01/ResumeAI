import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../utils/tokens';
import { User } from '../models';

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing access token'));
  }

  try {
    const payload = verifyAccessToken(header.slice(7));
    const user = await User.findById(payload.sub).select('status role');
    if (!user) {
      return next(ApiError.unauthorized('User account no longer exists'));
    }

    if (user.status === 'suspended') {
      return next(ApiError.forbidden('Your account has been suspended'));
    }

    if (user.status === 'inactive') {
      return next(ApiError.forbidden('Your account is inactive'));
    }

    req.user = { id: payload.sub, role: user.role };
    next();
  } catch (err: any) {
    if (err instanceof ApiError) return next(err);
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
