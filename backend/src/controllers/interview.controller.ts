import type { Request, Response } from 'express';
import * as interviewService from '../services/interview.service';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

export async function getInterviews(req: Request, res: Response) {
  if (!req.user?.id || !req.user?.role) throw ApiError.unauthorized('Authentication required');
  const interviews = await interviewService.listUserInterviews(req.user.id, req.user.role);
  sendSuccess(res, interviews);
}

export async function getInterviewById(req: Request, res: Response) {
  if (!req.user?.id || !req.user?.role) throw ApiError.unauthorized('Authentication required');
  const interview = await interviewService.getInterviewById(
    req.user.id,
    req.user.role,
    req.params.id as string,
  );
  sendSuccess(res, interview);
}

export async function scheduleInterview(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const interview = await interviewService.scheduleInterview(req.user.id, req.body);
  sendSuccess(res, interview, 201);
}

export async function updateInterview(req: Request, res: Response) {
  if (!req.user?.id || !req.user?.role) throw ApiError.unauthorized('Authentication required');
  const interview = await interviewService.updateInterview(
    req.user.id,
    req.user.role,
    req.params.id as string,
    req.body,
  );
  sendSuccess(res, interview);
}

export async function cancelInterview(req: Request, res: Response) {
  if (!req.user?.id || !req.user?.role) throw ApiError.unauthorized('Authentication required');
  const interview = await interviewService.cancelInterview(
    req.user.id,
    req.user.role,
    req.params.id as string,
  );
  sendSuccess(res, interview);
}
