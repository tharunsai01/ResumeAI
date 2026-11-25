import { z } from 'zod';
import { JOB_STATUS } from '../constants/enums';

export const adminUserQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  role: z.enum(['candidate', 'recruiter', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'inactive']).optional(),
  search: z.string().trim().max(200).optional(),
});

export const adminJobQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.enum([...JOB_STATUS]).optional(),
  search: z.string().trim().max(200).optional(),
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

export const adminAuditQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  action: z.string().max(100).optional(),
  actorEmail: z.string().trim().max(254).optional(),
  status: z.enum(['success', 'failure']).optional(),
});

export const adminListQuerySchema = z.object({
  category: z.string().trim().max(100).optional(),
  status: z.string().trim().max(100).optional(),
  search: z.string().trim().max(200).optional(),
  isUnknown: z.enum(['true', 'false']).optional(),
});
