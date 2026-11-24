import fs from 'node:fs/promises';
import type { Request, Response } from 'express';
import { env } from '../config/env';
import { Application, CandidateProfile, Resume } from '../models';
import { audit } from '../services/audit';
import { processResume } from '../services/resumePipeline';
import { ApiError } from '../utils/ApiError';
import { detectFileType, extensionOf, safeJoin, sanitizeDisplayName, sha256, storedFileName } from '../utils/fileSecurity';
import { ok } from '../utils/response';
import { profileCompleteness } from './profile.controller';

const MAX_RESUMES = 10;

export async function uploadResume(req: Request, res: Response) {
  const file = req.file;
  if (!file) throw ApiError.badRequest('Attach a PDF or DOCX file in the "file" field');
  const type = detectFileType(file.buffer);
  if (!type) {
    await audit(req, { action: 'resume.rejected_magic_bytes', category: 'resume', severity: 'warning', metadata: { name: sanitizeDisplayName(file.originalname), mime: file.mimetype } });
    throw ApiError.badRequest('File content is not a valid PDF or DOCX document');
  }
  if (extensionOf(file.originalname) !== type) throw ApiError.badRequest('File extension does not match its contents');

  const count = await Resume.countDocuments({ candidate: req.user!.id, deletedAt: null });
  if (count >= MAX_RESUMES) throw ApiError.badRequest(`You can keep up to ${MAX_RESUMES} resumes. Delete one first.`);

  const hash = sha256(file.buffer);
  const duplicate = await Resume.findOne({ candidate: req.user!.id, sha256: hash, deletedAt: null }).lean();
  if (duplicate) throw ApiError.conflict('You have already uploaded this exact file');

  const storedName = storedFileName(type);
  const dir = safeJoin(env.UPLOAD_DIR, req.user!.id);
  await fs.mkdir(dir, { recursive: true, mode: 0o750 });
  await fs.writeFile(safeJoin(dir, storedName), file.buffer, { mode: 0o640, flag: 'wx' });

  const resume = await Resume.create({
    candidate: req.user!.id,
    originalName: sanitizeDisplayName(file.originalname),
    storedName,
    fileType: type,
    size: file.size,
    sha256: hash,
    status: 'uploaded',
    stageHistory: [{ stage: 'uploaded', at: new Date() }],
  });
  await audit(req, { action: 'resume.uploaded', category: 'resume', targetType: 'Resume', targetId: String(resume._id) });

  // Process in the background; the client polls GET /resumes/:id for real stage updates.
  setImmediate(() => void processResume(String(resume._id)));
  return res.status(202).json({ success: true, data: { _id: resume._id, status: resume.status, originalName: resume.originalName } });
}

export async function listResumes(req: Request, res: Response) {
  const resumes = await Resume.find({ candidate: req.user!.id, deletedAt: null })
    .select('-analysis.profile.contact')
    .sort({ createdAt: -1 })
    .lean();
  return ok(res, resumes);
}

export async function getResume(req: Request, res: Response) {
  const resume = await Resume.findOne({ _id: req.valid.params.id, deletedAt: null }).lean();
  if (!resume) throw ApiError.notFound('Resume');
  await assertCanRead(req, resume);
  return ok(res, resume);
}

async function assertCanRead(req: Request, resume: { _id: any; candidate: any }) {
  const { id, role } = req.user!;
  if (role === 'admin' || String(resume.candidate) === id) return;
  if (role === 'recruiter') {
    // A recruiter may read a resume only when it was submitted to one of their jobs.
    const allowed = await Application.exists({ recruiter: id, candidate: resume.candidate, resume: resume._id });
    if (allowed) return;
  }
  throw ApiError.forbidden('You cannot access this resume');
}

export async function downloadResume(req: Request, res: Response) {
  const resume = await Resume.findOne({ _id: req.valid.params.id, deletedAt: null }).select('+storedName');
  if (!resume) throw ApiError.notFound('Resume');
  await assertCanRead(req, resume);
  const filePath = safeJoin(env.UPLOAD_DIR, String(resume.candidate), resume.storedName);
  try {
    await fs.access(filePath);
  } catch {
    throw ApiError.notFound('Resume file');
  }
  if (req.user!.role !== 'candidate') await audit(req, { action: 'resume.downloaded', category: 'resume', targetType: 'Resume', targetId: String(resume._id) });
  res.setHeader('Content-Type', resume.fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${resume.originalName.replace(/"/g, '')}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');
  return res.sendFile(filePath);
}

export async function setActiveResume(req: Request, res: Response) {
  const resume = await Resume.findOne({ _id: req.valid.params.id, candidate: req.user!.id, deletedAt: null });
  if (!resume) throw ApiError.notFound('Resume');
  if (resume.status !== 'completed') throw ApiError.badRequest('Only fully analysed resumes can be made active');
  await Resume.updateMany({ candidate: req.user!.id }, { isActive: false });
  resume.isActive = true;
  await resume.save();
  const profile = await CandidateProfile.findOne({ user: req.user!.id });
  if (profile) {
    profile.activeResume = resume._id;
    profile.completeness = profileCompleteness(profile, req.user!.name);
    await profile.save();
  }
  return ok(res, resume);
}

export async function deleteResume(req: Request, res: Response) {
  const resume = await Resume.findOne({ _id: req.valid.params.id, candidate: req.user!.id, deletedAt: null }).select('+storedName');
  if (!resume) throw ApiError.notFound('Resume');
  // Applications keep their reference; we only remove the file and the extracted text.
  resume.deletedAt = new Date();
  resume.isActive = false;
  resume.text = undefined;
  await resume.save();
  await fs.rm(safeJoin(env.UPLOAD_DIR, req.user!.id, resume.storedName), { force: true });
  await CandidateProfile.updateOne({ user: req.user!.id, activeResume: resume._id }, { $unset: { activeResume: 1 } });
  await audit(req, { action: 'resume.deleted', category: 'resume', targetType: 'Resume', targetId: String(resume._id) });
  return ok(res, { deleted: true });
}

export async function reprocessResume(req: Request, res: Response) {
  const resume = await Resume.findOne({ _id: req.valid.params.id, candidate: req.user!.id, deletedAt: null });
  if (!resume) throw ApiError.notFound('Resume');
  if (!['failed', 'completed'].includes(resume.status)) throw ApiError.conflict('Resume is still processing');
  resume.status = 'uploaded';
  resume.stageHistory = [{ stage: 'uploaded', at: new Date() }] as any;
  await resume.save();
  setImmediate(() => void processResume(String(resume._id)));
  return res.status(202).json({ success: true, data: { _id: resume._id, status: 'uploaded' } });
}
