import type { Request, Response } from 'express';
import * as resumeService from '../services/resume.service';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';

export async function uploadResume(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const resume = await resumeService.uploadResumeFile(req.user.id, req.file);
  sendSuccess(res, resume, 201);
}

export async function listResumes(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const resumes = await resumeService.listCandidateResumes(req.user.id);
  sendSuccess(res, resumes);
}

export async function getResume(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const resume = await resumeService.getCandidateResumeById(req.user.id, req.params.id as string);
  sendSuccess(res, resume);
}

export async function getResumeStatus(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const resume = await resumeService.getCandidateResumeById(req.user.id, req.params.id as string);
  sendSuccess(res, {
    id: resume._id,
    parseStatus: resume.parseStatus,
    parseError: resume.parseError,
    parsedData: resume.parsedData,
  });
}

export async function setActiveResume(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const resume = await resumeService.setActiveResume(req.user.id, req.params.id as string);
  sendSuccess(res, resume);
}

export async function deleteResume(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const result = await resumeService.deleteCandidateResume(req.user.id, req.params.id as string);
  sendSuccess(res, result);
}

export async function downloadResume(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const fileInfo = await resumeService.getResumeFilePath(req.user.id, req.params.id as string);
  res.download(fileInfo.filePath, fileInfo.fileName);
}
