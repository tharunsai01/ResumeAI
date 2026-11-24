import type { Request, Response } from 'express';
import * as resumeService from '../services/resume.service';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { Resume, Application } from '../models';

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

export async function getActiveResume(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const resume = await Resume.findOne({ candidate: req.user.id, isActive: true });
  if (!resume) throw ApiError.notFound('No active resume found');
  sendSuccess(res, resume);
}

export async function getResume(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const resumeId = req.params.id as string;

  // If candidate, must be their own. If recruiter, must be applicant's. If admin, allowed.
  if (req.user.role === 'candidate') {
    const resume = await resumeService.getCandidateResumeById(req.user.id, resumeId);
    return sendSuccess(res, resume);
  }

  if (req.user.role === 'recruiter') {
    const app = await Application.findOne({ resume: resumeId }).populate('job');
    const jobRecruiter = (app?.job as any)?.recruiter?.toString();
    if (jobRecruiter !== req.user.id) {
      throw ApiError.forbidden('You do not have permission to view this resume');
    }
  }

  const resume = await Resume.findById(resumeId);
  if (!resume) throw ApiError.notFound('Resume not found');
  sendSuccess(res, resume);
}

export async function getResumeStatus(req: Request, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized('Authentication required');
  const resume = await resumeService.getCandidateResumeById(req.user.id, req.params.id as string);
  sendSuccess(res, {
    id: resume._id,
    parseStatus: resume.parseStatus,
    analysisStatus: resume.analysisStatus,
    parseError: resume.parseError,
    parsedData: resume.parsedData,
    securityResult: resume.securityResult,
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
  const fileInfo = await resumeService.getResumeFilePath(req.user.id, req.user.role, req.params.id as string);
  res.download(fileInfo.filePath, fileInfo.fileName);
}
