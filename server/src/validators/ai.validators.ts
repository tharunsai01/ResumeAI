import { z } from 'zod';

export const resumeIdParamSchema = z.object({
  resumeId: z.string().trim().min(1, 'resumeId parameter is required'),
});

export const jobMatchParamSchema = z.object({
  resumeId: z.string().trim().min(1, 'resumeId parameter is required'),
  jobId: z.string().trim().min(1, 'jobId parameter is required'),
});

export const applicationIdParamSchema = z.object({
  applicationId: z.string().trim().min(1, 'applicationId parameter is required'),
});

export const jobIdParamSchema = z.object({
  jobId: z.string().trim().min(1, 'jobId parameter is required'),
});

export const bulkScreenBodySchema = z.object({
  batchSize: z.coerce.number().int().min(1).max(20).default(10).optional(),
});
