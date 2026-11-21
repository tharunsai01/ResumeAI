import type { Request, Response } from 'express';
import * as account from '../services/account.service';
import * as profile from '../services/profile.service';
import { sendSuccess } from '../utils/apiResponse';

const COOKIE_PATH = '/api/v1/auth'; // must match the path the cookie was set with

export const getSettings = async (req: Request, res: Response) =>
  sendSuccess(res, { preferences: await account.getPreferences(req.user!.id) });

export const updatePreferences = async (req: Request, res: Response) =>
  sendSuccess(res, { preferences: await account.updatePreferences(req.user!.id, req.body) });

export const updateName = async (req: Request, res: Response) =>
  sendSuccess(res, { user: await account.updateName(req.user!.id, req.body.fullName) });

export async function changePassword(req: Request, res: Response) {
  await account.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  res.clearCookie('refreshToken', { path: COOKIE_PATH });
  sendSuccess(res, { message: 'Password updated. Please log in again.' });
}

export async function deleteAccount(req: Request, res: Response) {
  await account.deleteAccount(req.user!.id, req.user!.role, req.body.password);
  res.clearCookie('refreshToken', { path: COOKIE_PATH });
  sendSuccess(res, { message: 'Account deleted' });
}

export async function uploadAvatar(req: Request, res: Response) {
  const avatarUrl = await profile.setAvatar(req.user!.id, req.user!.role, req.file);
  sendSuccess(res, { avatarUrl });
}

export async function removeAvatar(req: Request, res: Response) {
  await profile.removeAvatar(req.user!.id, req.user!.role);
  sendSuccess(res, { message: 'Image removed' });
}
