import { z } from 'zod';
import { JOB_TYPES, COMPANY_SIZES, THEMES } from '../constants/enums';
import { password } from './auth.validators';

const text = (max: number) => z.string().trim().max(max);

// http(s) only: z.string().url() would accept "javascript:..."
const link = z
  .string()
  .trim()
  .max(300)
  .refine((v) => {
    if (v === '') return true; // empty string clears the field
    try {
      return ['http:', 'https:'].includes(new URL(v).protocol);
    } catch {
      return false;
    }
  }, 'Must be a valid http(s) URL');

const phone = z.string().trim().max(20).regex(/^[+\d\s()-]*$/, 'Invalid phone number');

// ---------- candidate ----------
export const updateCandidateSchema = z.object({
  headline: text(120).optional(),
  summary: text(2000).optional(),
  phone: phone.optional(),
  location: text(100).optional(),
  links: z
    .object({ linkedin: link.optional(), github: link.optional(), portfolio: link.optional() })
    .optional(),
  preferredJobTypes: z.array(z.enum(JOB_TYPES)).max(4).optional(),
});

export const skillsSchema = z.object({
  skills: z.array(z.string().trim().min(1).max(50)).max(50),
});

// No .default() in the base: a default would overwrite values on PATCH
const experienceBase = z.object({
  company: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(100),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  current: z.boolean().optional(),
  description: text(1500).optional(),
});
const datesOk = (d: { startDate?: Date; endDate?: Date }) =>
  !(d.startDate && d.endDate) || d.endDate >= d.startDate;
const datesMsg = { message: 'End date must be after start date', path: ['endDate'] };

// Zod 4 refuses .partial() on a refined schema, so refine AFTER partial()
export const experienceCreate = experienceBase.refine(datesOk, datesMsg);
export const experiencePatch = experienceBase.partial().refine(datesOk, datesMsg);

const educationBase = z.object({
  institution: z.string().trim().min(1).max(150),
  degree: text(100).optional(),
  fieldOfStudy: text(100).optional(),
  startYear: z.number().int().min(1950).max(2100).optional(),
  endYear: z.number().int().min(1950).max(2100).optional(),
});
const yearsOk = (d: { startYear?: number; endYear?: number }) =>
  !(d.startYear && d.endYear) || d.endYear >= d.startYear;
const yearsMsg = { message: 'End year must be after start year', path: ['endYear'] };

export const educationCreate = educationBase.refine(yearsOk, yearsMsg);
export const educationPatch = educationBase.partial().refine(yearsOk, yearsMsg);

// ---------- recruiter ----------
export const updateRecruiterSchema = z.object({
  jobTitle: text(100).optional(),
  phone: phone.optional(),
  companyName: z.string().trim().min(1).max(150).optional(),
  industry: text(100).optional(),
  companySize: z.enum(COMPANY_SIZES).optional(),
  website: link.optional(),
  description: text(2000).optional(),
  location: text(100).optional(),
});

// ---------- account ----------
export const updateAccountSchema = z.object({ fullName: z.string().trim().min(2).max(100) });

export const preferencesSchema = z.object({
  theme: z.enum(THEMES).optional(),
  notifications: z
    .object({
      applicationUpdates: z.boolean().optional(),
      jobRecommendations: z.boolean().optional(),
      interviewReminders: z.boolean().optional(),
    })
    .optional(),
});

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1), newPassword: password })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: 'New password must be different',
    path: ['newPassword'],
  });

export const deleteAccountSchema = z.object({ password: z.string().min(1) });
