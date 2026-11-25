import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import JSZip from 'jszip';
import { Resume, CandidateProfile, Application, Job } from '../models';
import { ApiError } from '../utils/ApiError';
import { detectMimeFromBuffer } from '../utils/fileValidation';
import { extractRawText, parseResumeDeterministic } from './resumeParser.service';
import { recordAuditLog } from './audit.service';
import { calculateProfileCompletion } from './candidate.service';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads/resumes');

function ensureUploadDirExists() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export function scanResumeContent(text: string): { isSafe: boolean; flags: string[] } {
  const flags: string[] = [];
  const suspiciousPatterns = [
    /ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions/i,
    /system\s+prompt/i,
    /reveal\s+(?:the\s+)?(?:api\s+key|password|secret)/i,
    /<script[\s>]/i,
    /javascript:/i,
    /eval\s*\(/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) {
      flags.push(`Suspicious injection pattern detected: ${pattern}`);
    }
  }

  return { isSafe: flags.length === 0, flags };
}

function storedResumePath(fileName: string): string {
  if (!/^[a-zA-Z0-9_-]+\.(pdf|docx)$/.test(fileName)) {
    throw ApiError.notFound('Resume file unavailable');
  }
  return path.join(UPLOAD_DIR, fileName);
}

export async function uploadResumeFile(
  candidateId: string,
  file: Express.Multer.File | undefined,
) {
  if (!file || !file.buffer) {
    throw ApiError.badRequest('No resume file provided');
  }

  // 1. Size check: 10MB maximum limit (strict 5MB standard guidance with 10MB upper limit)
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.buffer.length > MAX_SIZE) {
    throw ApiError.badRequest('File size exceeds maximum limit of 10 MB');
  }

  // 2. Validate real file signature (magic bytes)
  const detectedMime = detectMimeFromBuffer(file.buffer);
  const expectedExtension = detectedMime === 'application/pdf' ? '.pdf' : '.docx';
  if (!detectedMime || path.extname(file.originalname).toLowerCase() !== expectedExtension) {
    throw ApiError.badRequest(
      'Invalid file format. Only authentic PDF and DOCX files are accepted.',
    );
  }

  if (expectedExtension === '.docx') {
    const archive = await JSZip.loadAsync(file.buffer).catch(() => null);
    if (!archive?.file('[Content_Types].xml') || !archive.file('word/document.xml')) {
      throw ApiError.badRequest('The upload is not a valid DOCX document');
    }
  }

  // 3. Compute SHA-256 hash for duplicate detection and caching
  const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

  ensureUploadDirExists();

  // 4. Generate safe unguessable storage filename
  const ext = detectedMime === 'application/pdf' ? '.pdf' : '.docx';
  const storedFileName = `${crypto.randomUUID()}-${Date.now()}${ext}`;
  const diskPath = storedResumePath(storedFileName);

  let fileWritten = false;
  try {
    // 5. Save file to disk
    await fs.promises.writeFile(diskPath, file.buffer, { mode: 0o600, flag: 'wx' });
    fileWritten = true;

    // 6. Extract text
    let rawText = '';
    let parseStatus: 'done' | 'failed' = 'done';
    let parseError: string | undefined;

    try {
      rawText = await extractRawText(file.buffer, detectedMime);
      if (!rawText || rawText.trim().length === 0) {
        parseStatus = 'failed';
        parseError = 'No extractable text found (document may be scanned, image-only, or password protected)';
      }
    } catch (err: any) {
      parseStatus = 'failed';
      parseError = err?.message || 'Text extraction failed';
    }

    // 7. Security scan
    const securityResult = scanResumeContent(rawText);

    // 8. Deterministic parsing
    const parsedData = parseResumeDeterministic(rawText);

    // 9. Deactivate previous active resumes for this candidate
    await Resume.updateMany({ candidate: candidateId }, { isActive: false });

    // 10. Create Resume document
    const originalName = path.basename(file.originalname).slice(0, 150);
    const resume = await Resume.create({
      candidate: candidateId,
      fileUrl: `/api/v1/resumes/download-placeholder`,
      fileName: originalName,
      originalFilename: originalName,
      storedFileName,
      filePath: diskPath,
      mimeType: detectedMime,
      fileType: detectedMime,
      sizeBytes: file.buffer.length,
      fileSize: file.buffer.length,
      fileHash,
      rawText,
      parsedData,
      securityResult: {
        isSafe: securityResult.isSafe,
        flags: securityResult.flags,
        scannedAt: new Date(),
      },
      aiModelInfo: {
        model: 'openai/gpt-oss-20b',
        provider: 'Groq',
        version: '1.0.0',
      },
      parseStatus,
      analysisStatus: parseStatus === 'done' && securityResult.isSafe ? 'pending' : 'failed',
      parseError,
      isActive: true,
    });

    resume.fileUrl = `/api/v1/resumes/${resume._id}/download`;
    await resume.save();

    // 11. Sync candidate profile with resume
    const profile = await CandidateProfile.findOne({ user: candidateId });
    if (profile) {
      profile.resume = resume._id as any;
      if (parsedData.skills && parsedData.skills.length > 0) {
        const mergedSkills = Array.from(new Set([...(profile.skills || []), ...parsedData.skills]));
        profile.skills = mergedSkills;
      }
      profile.profileCompletion = calculateProfileCompletion(profile);
      await profile.save();
    }

    void recordAuditLog({
      action: 'RESUME_UPLOAD',
      actorId: candidateId,
      actorRole: 'candidate',
      targetType: 'Resume',
      targetId: resume._id.toString(),
      status: 'success',
      details: {
        fileName: originalName,
        fileSize: file.buffer.length,
        isSafe: securityResult.isSafe,
      },
    });

    return resume;
  } catch (err) {
    if (fileWritten) {
      try {
        await fs.promises.unlink(diskPath);
      } catch {}
    }
    throw err;
  }
}

export async function listCandidateResumes(candidateId: string) {
  return Resume.find({ candidate: candidateId }).sort({ createdAt: -1 });
}

export async function getCandidateResumeById(candidateId: string, resumeId: string) {
  const resume = await Resume.findOne({ _id: resumeId, candidate: candidateId });
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }
  return resume;
}

export async function setActiveResume(candidateId: string, resumeId: string) {
  const target = await Resume.findOne({ _id: resumeId, candidate: candidateId });
  if (!target) {
    throw ApiError.notFound('Resume not found');
  }

  await Resume.updateMany({ candidate: candidateId, _id: { $ne: resumeId } }, { isActive: false });

  target.isActive = true;
  await target.save();

  // Update profile reference
  await CandidateProfile.updateOne({ user: candidateId }, { resume: target._id });

  return target;
}

export async function deleteCandidateResume(candidateId: string, resumeId: string) {
  const resume = await Resume.findOne({ _id: resumeId, candidate: candidateId });
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }

  if (resume.storedFileName) {
    const diskPath = storedResumePath(resume.storedFileName);
    if (fs.existsSync(diskPath)) {
      try {
        await fs.promises.unlink(diskPath);
      } catch (err) {
        console.error('Failed to unlink resume file on delete:', err);
      }
    }
  }

  await Resume.deleteOne({ _id: resumeId });

  // Update candidate profile if this was the linked resume
  const profile = await CandidateProfile.findOne({ user: candidateId });
  if (profile && profile.resume?.toString() === resumeId) {
    const nextActive = await Resume.findOne({ candidate: candidateId }).sort({ createdAt: -1 });
    profile.resume = nextActive ? (nextActive._id as any) : undefined;
    if (nextActive) {
      nextActive.isActive = true;
      await nextActive.save();
    }
    profile.profileCompletion = calculateProfileCompletion(profile);
    await profile.save();
  }

  void recordAuditLog({
    action: 'RESUME_DELETE',
    actorId: candidateId,
    actorRole: 'candidate',
    targetType: 'Resume',
    targetId: resumeId,
    status: 'success',
  });

  return { message: 'Resume deleted successfully' };
}

// A résumé may be attached to applications owned by more than one recruiter.
export async function recruiterCanAccessResume(recruiterId: string, resumeId: string) {
  const jobs = await Job.find({ recruiter: recruiterId }).select('_id').lean();
  return Boolean(await Application.exists({ resume: resumeId, job: { $in: jobs.map(job => job._id) } }));
}

export async function getResumeFilePath(
  userId: string,
  userRole: string,
  resumeId: string,
) {
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }

  // Permission check: Candidate owner OR Recruiter who has an application with this resume OR Admin
  if (userRole === 'candidate') {
    if (resume.candidate.toString() !== userId) {
      throw ApiError.forbidden('You do not have access to view this resume');
    }
  } else if (userRole === 'recruiter') {
    if (!(await recruiterCanAccessResume(userId, resumeId))) {
      throw ApiError.forbidden('You do not have permission to view resumes outside your job applicants');
    }
  } else if (userRole !== 'admin') {
    throw ApiError.forbidden('Unauthorized access to resume file');
  }

  if (!resume.storedFileName) {
    throw ApiError.notFound('Physical file not available');
  }

  const diskPath = storedResumePath(resume.storedFileName);
  const storedFile = await fs.promises.lstat(diskPath).catch(() => null);
  if (!storedFile?.isFile()) {
    throw ApiError.notFound('Resume file missing on storage server');
  }

  return {
    filePath: diskPath,
    fileName: resume.fileName || resume.originalFilename || 'resume.pdf',
    mimeType: resume.mimeType || 'application/pdf',
  };
}
