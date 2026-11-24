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

export async function addSkill(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const profile = await candidateService.addSkill(req.user.id, req.body.name);
  sendSuccess(res, profile);
}

export async function removeSkill(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const skillName = (req.params.skillName as string) || (req.body.name as string);
  const profile = await candidateService.removeSkill(req.user.id, skillName);
  sendSuccess(res, profile);
}

export async function bookmarkJob(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const jobId = req.params.jobId as string;
  const result = await candidateService.bookmarkJob(req.user.id, jobId);
  sendSuccess(res, result);
}

export async function removeBookmark(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const jobId = req.params.jobId as string;
  const result = await candidateService.removeBookmark(req.user.id, jobId);
  sendSuccess(res, result);
}

export async function getBookmarks(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const bookmarks = await candidateService.getBookmarkedJobs(req.user.id);
  sendSuccess(res, bookmarks);
}

export async function getRecommendedJobs(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const recommended = await candidateService.getRecommendedJobs(req.user.id);
  sendSuccess(res, recommended);
}

export async function getDashboard(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const dashboard = await candidateService.getCandidateDashboard(req.user.id);
  sendSuccess(res, dashboard);
}
