import { z } from 'zod';
import { JOB_TYPES } from '../constants/enums';

const experienceItemSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(150),
  title: z.string().trim().min(1, 'Title is required').max(150),
  startDate: z.string().or(z.date()).optional().nullable(),
  endDate: z.string().or(z.date()).optional().nullable(),
  current: z.boolean().default(false).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
});

const educationItemSchema = z.object({
  institution: z.string().trim().min(1, 'Institution is required').max(150),
  degree: z.string().trim().max(150).optional().nullable(),
  fieldOfStudy: z.string().trim().max(150).optional().nullable(),
  startYear: z.number().int().min(1950).max(2100).optional().nullable(),
  endYear: z.number().int().min(1950).max(2100).optional().nullable(),
});

const linksSchema = z.object({
  linkedin: z.string().trim().max(300).optional().nullable(),
  github: z.string().trim().max(300).optional().nullable(),
  portfolio: z.string().trim().max(300).optional().nullable(),
});

export const updateCandidateProfileSchema = z.object({
  headline: z.string().trim().max(200).optional().nullable(),
  summary: z.string().trim().max(2000).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  location: z.string().trim().max(150).optional().nullable(),
  avatarUrl: z.string().trim().max(500).optional().nullable(),
  skills: z.array(z.string().trim().min(1).max(100)).max(100).optional(),
  experience: z.array(experienceItemSchema).max(50).optional(),
  education: z.array(educationItemSchema).max(50).optional(),
  links: linksSchema.optional(),
  preferredJobTypes: z.array(z.enum(JOB_TYPES)).optional(),
});

export const patchCandidateProfileSchema = updateCandidateProfileSchema.partial();

export type UpdateCandidateProfileInput = z.infer<typeof updateCandidateProfileSchema>;
export type PatchCandidateProfileInput = z.infer<typeof patchCandidateProfileSchema>;
