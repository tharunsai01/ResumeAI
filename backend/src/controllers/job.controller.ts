import type { Request, Response } from 'express';
import * as jobService from '../services/job.service';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

export async function createJob(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const job = await jobService.createJob(req.user.id, req.body);
  sendSuccess(res, job, 201);
}

export async function searchJobs(req: Request, res: Response) {
  const result = await jobService.searchJobs(req.query as any);
  sendSuccess(res, result);
}

export async function getRecruiterJobs(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const jobs = await jobService.getRecruiterJobs(req.user.id);
  sendSuccess(res, jobs);
}

export async function getJob(req: Request, res: Response) {
  const job = await jobService.getJobById(req.params.id as string);
  sendSuccess(res, job);
}

export async function updateJob(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const job = await jobService.updateJob(req.user.id, req.params.id as string, req.body);
  sendSuccess(res, job);
}

export async function updateJobStatus(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const job = await jobService.updateJobStatus(
    req.user.id,
    req.params.id as string,
    req.body.status,
  );
  sendSuccess(res, job);
}

export async function deleteJob(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await jobService.deleteJob(req.user.id, req.params.id as string);
  sendSuccess(res, result);
}

export async function getJobStats(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const stats = await jobService.getJobStats(req.user.id, req.params.id as string);
  sendSuccess(res, stats);
}
