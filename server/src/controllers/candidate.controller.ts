import type { Request, Response } from 'express';
import * as candidateService from '../services/candidate.service';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

export async function getProfile(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const profile = await candidateService.getProfileByUserId(req.user.id);
  sendSuccess(res, profile);
}

export async function updateProfile(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const profile = await candidateService.updateProfile(req.user.id, req.body);
  sendSuccess(res, profile);
}

export async function patchProfile(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const profile = await candidateService.patchProfile(req.user.id, req.body);
  sendSuccess(res, profile);
}
