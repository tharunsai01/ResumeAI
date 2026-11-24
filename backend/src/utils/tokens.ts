import crypto from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { Role } from '../constants';

export interface AccessPayload {
  sub: string;
  role: Role;
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL as SignOptions['expiresIn'],
    issuer: 'hiresmart-api',
    audience: 'hiresmart-web',
    algorithm: 'HS256',
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'hiresmart-api',
    audience: 'hiresmart-web',
    algorithms: ['HS256'],
  });
  if (typeof decoded === 'string' || !decoded.sub || !decoded.role) throw new Error('Malformed token');
  return { sub: String(decoded.sub), role: decoded.role as Role };
}

/** Refresh tokens are opaque random strings; only their SHA-256 hash is stored. */
export function generateRefreshToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(48).toString('base64url');
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return crypto.createHmac('sha256', env.JWT_REFRESH_SECRET).update(token).digest('hex');
}

export function signState(data: Record<string, string>): string {
  return jwt.sign(data, env.JWT_REFRESH_SECRET, { expiresIn: '10m', algorithm: 'HS256' });
}

export function verifyState(token: string): Record<string, string> {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] }) as Record<string, string>;
}
