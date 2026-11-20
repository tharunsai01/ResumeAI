import { z } from 'zod';
import {
  JOB_STATUS,
  JOB_TYPES,
  WORK_MODES,
  EDUCATION_LEVELS,
} from '../constants/enums';

const jobBaseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
  companyName: z.string().trim().max(150).optional(),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  location: z.string().trim().max(150).optional(),
  workMode: z.enum(WORK_MODES).optional(),
  jobType: z.enum(JOB_TYPES).optional(),
  requiredSkills: z
    .array(z.string().trim().min(1))
    .min(1, 'At least one required skill must be specified'),
  niceToHaveSkills: z.array(z.string().trim().min(1)).optional(),
  minExperienceYears: z.coerce.number().min(0).optional(),
  maxExperienceYears: z.coerce.number().min(0).optional(),
  educationLevel: z.enum(EDUCATION_LEVELS).optional(),
  salary: z
    .object({
      min: z.coerce.number().min(0).optional(),
      max: z.coerce.number().min(0).optional(),
      currency: z.string().default('INR').optional(),
    })
    .optional(),
  openings: z.coerce.number().int().min(1).optional(),
  deadline: z.string().or(z.date()).optional().nullable(),
  status: z.enum(JOB_STATUS).optional(),
});

export const createJobSchema = jobBaseSchema.extend({
  workMode: z.enum(WORK_MODES).default('onsite'),
  jobType: z.enum(JOB_TYPES).default('full-time'),
  minExperienceYears: z.coerce.number().min(0).default(0),
  educationLevel: z.enum(EDUCATION_LEVELS).default('any'),
  openings: z.coerce.number().int().min(1).default(1),
  status: z.enum(JOB_STATUS).default('draft'),
});

export const updateJobSchema = jobBaseSchema.partial();

export const updateJobStatusSchema = z.object({
  status: z.enum(JOB_STATUS),
});

export const jobQuerySchema = z.object({
  search: z.string().trim().optional(),
  location: z.string().trim().optional(),
  workMode: z.enum(WORK_MODES).optional(),
  jobType: z.enum(JOB_TYPES).optional(),
  educationLevel: z.enum(EDUCATION_LEVELS).optional(),
  minExperience: z.coerce.number().min(0).optional(),
  status: z.enum(JOB_STATUS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobQueryInput = z.infer<typeof jobQuerySchema>;
