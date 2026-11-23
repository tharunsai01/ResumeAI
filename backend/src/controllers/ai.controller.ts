import type { Request, Response } from 'express';
import * as aiService from '../services/ai/ai.service';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

export async function analyzeResume(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await aiService.analyzeResume(req.user.id, req.params.resumeId as string);
  sendSuccess(res, result);
}

export async function matchResume(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await aiService.matchResumeToJob(
    req.user.id,
    req.params.resumeId as string,
    req.params.jobId as string,
  );
  sendSuccess(res, result);
}

export async function screenApplication(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await aiService.screenCandidateApplication(
    req.user.id,
    req.params.applicationId as string,
  );
  sendSuccess(res, result);
}

export async function bulkScreen(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await aiService.bulkScreenJobApplications(
    req.user.id,
    req.params.jobId as string,
    req.body.batchSize,
  );
  sendSuccess(res, result);
}

export async function getJobInsights(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await aiService.getJobRecruiterInsights(
    req.user.id,
    req.params.jobId as string,
  );
  sendSuccess(res, result);
}

export async function getScreeningResult(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await aiService.getApplicationScreeningResult(
    req.user.id,
    req.params.applicationId as string,
  );
  sendSuccess(res, result);
}
