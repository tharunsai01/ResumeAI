import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Resume } from '../models';
import { ApiError } from '../utils/ApiError';
import { detectMimeFromBuffer } from '../utils/fileValidation';
import { extractRawText, parseResumeDeterministic } from './resumeParser.service';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads/resumes');

function ensureUploadDirExists() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function uploadResumeFile(
  candidateId: string,
  file: Express.Multer.File | undefined,
) {
  if (!file || !file.buffer) {
    throw ApiError.badRequest('No resume file provided');
  }

  // 1. Size check: 10MB limit
  const MAX_SIZE = 10 * 1024 * 1024;
  if (file.buffer.length > MAX_SIZE) {
    throw ApiError.badRequest('File size exceeds maximum limit of 10 MB');
  }

  // 2. Validate real file signature (magic bytes)
  const detectedMime = detectMimeFromBuffer(file.buffer);
  if (!detectedMime) {
    throw ApiError.badRequest(
      'Invalid file format. Only valid PDF and DOCX files are accepted.',
    );
  }

  ensureUploadDirExists();

  // 3. Generate safe unguessable storage filename
  const ext = detectedMime === 'application/pdf' ? '.pdf' : '.docx';
  const storedFileName = `${crypto.randomUUID()}-${Date.now()}${ext}`;
  const diskPath = path.join(UPLOAD_DIR, storedFileName);

  try {
    // 4. Save file to isolated disk storage
    await fs.promises.writeFile(diskPath, file.buffer);

    // 5. Extract text
    let rawText = '';
    let parseStatus: 'done' | 'failed' = 'done';
    let parseError: string | undefined;

    try {
      rawText = await extractRawText(file.buffer, detectedMime);
      if (!rawText || rawText.trim().length === 0) {
        parseStatus = 'failed';
        parseError = 'No extractable text found (document may be scanned or image-only)';
      }
    } catch (err: any) {
      parseStatus = 'failed';
      parseError = err?.message || 'Text extraction failed';
    }

    // 6. Deterministic parsing
    const parsedData = parseResumeDeterministic(rawText);

    // 7. Deactivate previous active resumes for this candidate
    await Resume.updateMany({ candidate: candidateId }, { isActive: false });

    // 8. Create Resume document
    const resume = await Resume.create({
      candidate: candidateId,
      fileUrl: `/api/v1/resumes/download-placeholder`, // updated below with actual id
      fileName: path.basename(file.originalname).slice(0, 150),
      storedFileName,
      mimeType: detectedMime,
      sizeBytes: file.buffer.length,
      rawText,
      parsedData,
      parseStatus,
      parseError,
      isActive: true,
    });

    resume.fileUrl = `/api/v1/resumes/${resume._id}/download`;
    await resume.save();

    return resume;
  } catch (err) {
    // Clean up uploaded file if database creation or parsing crashed
    if (fs.existsSync(diskPath)) {
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

  // Deactivate all others
  await Resume.updateMany({ candidate: candidateId, _id: { $ne: resumeId } }, { isActive: false });

  target.isActive = true;
  await target.save();
  return target;
}

export async function deleteCandidateResume(candidateId: string, resumeId: string) {
  const resume = await Resume.findOne({ _id: resumeId, candidate: candidateId });
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }

  // Safe file cleanup from disk
  if (resume.storedFileName) {
    const diskPath = path.join(UPLOAD_DIR, resume.storedFileName);
    if (fs.existsSync(diskPath)) {
      try {
        await fs.promises.unlink(diskPath);
      } catch (err) {
        console.error('Failed to unlink resume file on delete:', err);
      }
    }
  }

  await Resume.deleteOne({ _id: resumeId });
  return { message: 'Resume deleted successfully' };
}

export async function getResumeFilePath(candidateId: string, resumeId: string) {
  const resume = await Resume.findOne({ _id: resumeId, candidate: candidateId });
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }

  if (!resume.storedFileName) {
    throw ApiError.notFound('Physical file not available');
  }

  const diskPath = path.join(UPLOAD_DIR, resume.storedFileName);
  if (!fs.existsSync(diskPath)) {
    throw ApiError.notFound('Resume file missing on storage server');
  }

  return {
    filePath: diskPath,
    fileName: resume.fileName || 'resume.pdf',
    mimeType: resume.mimeType || 'application/pdf',
  };
}
