import type { NextFunction, Request, Response } from 'express';
import { User } from '../models';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken } from '../utils/tokens';
import type { Role } from '../constants';

function bearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = bearer(req);
  if (!token) throw ApiError.unauthorized();
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, 'Session expired or invalid', 'TOKEN_INVALID');
  }
  // Re-check the account on every request so suspensions take effect immediately.
  const user = await User.findById(payload.sub).select('name email role status').lean();
  if (!user) throw ApiError.unauthorized('Account no longer exists');
  if (user.status !== 'active') throw new ApiError(403, 'Account suspended', 'ACCOUNT_SUSPENDED');
  req.user = { id: String(user._id), role: user.role as Role, email: user.email, name: user.name };
  next();
}

/** Attach the user when a valid token is present; continue anonymously otherwise. */
export async function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  if (!bearer(req)) return next();
  try {
    await authenticate(req, res, () => undefined);
  } catch {
    req.user = undefined;
  }
  next();
}

/** Role-based access control. */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  };
}
