import type { Request, Response } from 'express';
import * as recruiterService from '../services/recruiter.service';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

export async function getProfile(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const profile = await recruiterService.getRecruiterProfile(req.user.id);
  sendSuccess(res, profile);
}

export async function updateProfile(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const profile = await recruiterService.updateRecruiterProfile(req.user.id, req.body);
  sendSuccess(res, profile);
}

export async function getDashboard(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const dashboard = await recruiterService.getRecruiterDashboard(req.user.id);
  sendSuccess(res, dashboard);
}

export async function searchCandidates(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const candidates = await recruiterService.searchCandidates(req.user.id, req.query as any);
  sendSuccess(res, candidates);
}

export async function getCandidateDetails(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const candidate = await recruiterService.getCandidateDetailsForRecruiter(
    req.user.id,
    req.params.id as string,
  );
  sendSuccess(res, candidate);
}

export async function getScreeningSettings(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const settings = await recruiterService.getScreeningSettings(req.user.id);
  sendSuccess(res, settings);
}

export async function updateScreeningSettings(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const settings = await recruiterService.updateScreeningSettings(req.user.id, req.body);
  sendSuccess(res, settings);
}

export async function getPipeline(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const pipeline = await recruiterService.getHiringPipeline(
    req.user.id,
    req.query.jobId as string | undefined,
    req.query.includeApplied === "true",
  );
  sendSuccess(res, pipeline);
}

export async function updatePipelineStage(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await recruiterService.updatePipelineStage(
    req.user.id,
    req.params.applicationId as string,
    req.body.stage as string,
  );
  sendSuccess(res, result);
}
