import { z } from 'zod';
import { APPLICATION_STATUS } from '../constants/enums';

export const createApplicationSchema = z.object({
  jobId: z.string().trim().min(1, 'jobId is required'),
  resumeId: z.string().trim().min(1).optional(),
  coverLetter: z.string().trim().max(3000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUS),
  note: z.string().trim().max(500).optional(),
});

export const withdrawApplicationSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type WithdrawApplicationInput = z.infer<typeof withdrawApplicationSchema>;
