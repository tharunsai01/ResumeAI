import type { Request, Response } from 'express';
import * as applicationService from '../services/application.service';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

export async function apply(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const application = await applicationService.applyToJob(req.user.id, req.body);
  sendSuccess(res, application, 201);
}

export async function getCandidateApplications(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const applications = await applicationService.getCandidateApplications(req.user.id);
  sendSuccess(res, applications);
}

export async function getApplication(req: Request, res: Response) {
  if (!req.user?.id || !req.user?.role) throw ApiError.unauthorized('Authentication required');
  const application = await applicationService.getApplicationById(
    req.user.id,
    req.user.role,
    req.params.id as string,
  );
  sendSuccess(res, application);
}

export async function withdraw(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const application = await applicationService.withdrawApplication(
    req.user.id,
    req.params.id as string,
    req.body,
  );
  sendSuccess(res, application);
}

export async function getJobApplications(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const applications = await applicationService.getJobApplications(
    req.user.id,
    req.params.jobId as string,
  );
  sendSuccess(res, applications);
}

export async function updateStatus(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const application = await applicationService.updateApplicationStatus(
    req.user.id,
    req.params.id as string,
    req.body,
  );
  sendSuccess(res, application);
}

export async function addNote(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const application = await applicationService.addRecruiterNote(
    req.user.id,
    req.params.id as string,
    req.body.note,
  );
  sendSuccess(res, application);
}
