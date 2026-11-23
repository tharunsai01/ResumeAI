import { z } from 'zod';
import { JOB_STATUS } from '../constants/enums';

export const adminUserQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  role: z.enum(['candidate', 'recruiter', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'inactive']).optional(),
  search: z.string().trim().optional(),
});

export const adminJobQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.enum([...JOB_STATUS]).optional(),
  search: z.string().trim().optional(),
});

export const adminUpdateUserStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'inactive']),
});

export const adminUpdateJobStatusSchema = z.object({
  status: z.enum([...JOB_STATUS]),
});

export const adminIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID'),
});
