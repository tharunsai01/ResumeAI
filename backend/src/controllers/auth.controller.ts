import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';
import { env, isProd } from '../config/env';
import { User } from '../models';
import { ApiError } from '../utils/ApiError';

const COOKIE_NAME = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/api/v1/auth', // the browser sends this cookie only to the auth routes
  maxAge: env.JWT_REFRESH_DAYS * 24 * 60 * 60 * 1000,
};

const meta = (req: Request) => ({ ip: req.ip, userAgent: req.get('user-agent') });

export async function register(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await authService.register(req.body, meta(req));
  res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
  sendSuccess(res, { user, accessToken }, 201);
}

export async function login(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await authService.login(req.body, meta(req));
  res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
  sendSuccess(res, { user, accessToken });
}

export async function refresh(req: Request, res: Response) {
  try {
    const { user, accessToken, refreshToken } = await authService.refresh(req.cookies?.[COOKIE_NAME], meta(req));
    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
    sendSuccess(res, { user, accessToken });
  } catch (err) {
    res.clearCookie(COOKIE_NAME, { path: cookieOptions.path });
    throw err;
  }
}

export async function logout(req: Request, res: Response) {
  await authService.logout(req.cookies?.[COOKIE_NAME]);
  res.clearCookie(COOKIE_NAME, { path: cookieOptions.path });
  sendSuccess(res, { message: 'Logged out' });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.unauthorized('User no longer exists');
  sendSuccess(res, { user: authService.publicUser(user) });
}

export async function updateMe(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const user = await authService.updateUserProfile(req.user.id, req.body);
  sendSuccess(res, { user });
}

export async function changePassword(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await authService.changePassword(
    req.user.id,
    req.body.currentPassword,
    req.body.newPassword,
  );
  sendSuccess(res, result);
}

export async function verifyEmail(req: Request, res: Response) {
  await authService.verifyEmail(req.body.token);
  sendSuccess(res, { message: 'Email verified' });
}

export async function resendVerification(req: Request, res: Response) {
  await authService.resendVerification(req.user!.id);
  sendSuccess(res, { message: 'If your email is not yet verified, a new link has been sent' });
}

export async function forgotPassword(req: Request, res: Response) {
  authService.forgotPassword(req.body.email);
  sendSuccess(res, { message: 'If an account exists for that email, a reset link has been sent' });
}

export async function resetPassword(req: Request, res: Response) {
  await authService.resetPassword(req.body.token, req.body.password);
  res.clearCookie(COOKIE_NAME, { path: cookieOptions.path });
  sendSuccess(res, { message: 'Password updated. Please log in.' });
}

export async function google(req: Request, res: Response) {
  const { user, accessToken, refreshToken } = await authService.googleAuth(req.body, meta(req));
  res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
  sendSuccess(res, { user, accessToken });
}
