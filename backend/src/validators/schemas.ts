import { z } from 'zod';
import {
  APPLICATION_STATUSES,
  COMPLAINT_STATUSES,
  EMPLOYMENT_TYPES,
  INTERVIEW_STATUSES,
  INTERVIEW_TYPES,
  PRIORITIES,
  WORK_MODES,
} from '../constants';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const text = (max: number) => z.string().trim().max(max);
const url = z.union([z.literal(''), z.url({ protocol: /^https?$/ }).max(300)]);
const skillList = z.array(text(80).min(1)).max(60).transform((arr) => [...new Set(arr)]);

export const idParam = z.object({ id: objectId });
export const jobIdParam = z.object({ jobId: objectId });

const password = z
  .string()
  .min(8, 'At least 8 characters')
  .max(128)
  .regex(/[a-z]/, 'Needs a lowercase letter')
  .regex(/[A-Z]/, 'Needs an uppercase letter')
  .regex(/\d/, 'Needs a number');

// --- auth ------------------------------------------------------------------
export const registerSchema = z.object({
  name: text(80).min(2),
  email: z.email().max(254).transform((e) => e.toLowerCase()),
  password,
  role: z.enum(['candidate', 'recruiter']),
  company: text(120).optional(),
});
export const loginSchema = z.object({ email: z.email().transform((e) => e.toLowerCase()), password: z.string().min(1).max(128) });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: password });
export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
});

// --- profiles -----------------------------------------------------------------
const year = z.number().int().min(1950).max(2100);
export const candidateProfileSchema = z
  .object({
    name: text(80).min(2),
    headline: text(150),
    summary: text(3000),
    phone: text(30),
    location: text(120),
    education: z
      .array(z.object({ institution: text(150), degree: text(150), field: text(120), level: z.number().int().min(0).max(5), startYear: year.optional(), endYear: year.optional() }))
      .max(10),
    experience: z
      .array(
        z.object({
          title: text(150).min(1),
          company: text(150),
          location: text(120).optional(),
          startDate: z.coerce.date().optional(),
          endDate: z.coerce.date().optional().nullable(),
          current: z.boolean().default(false),
          description: text(2000),
        }),
      )
      .max(20),
    skills: z.array(z.object({ name: text(80).min(1), level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'), years: z.number().min(0).max(50).optional() })).max(100),
    projects: z.array(z.object({ name: text(120).min(1), description: text(1000), url, technologies: z.array(text(60)).max(20) })).max(20),
    certifications: z.array(z.object({ name: text(150).min(1), issuer: text(120), year: year.optional() })).max(30),
    socialLinks: z.object({ linkedin: url, github: url, portfolio: url }),
    totalExperienceYears: z.number().min(0).max(60),
    openToRecruiters: z.boolean(),
  })
  .partial();

export const recruiterProfileSchema = z
  .object({
    name: text(80).min(2),
    company: text(120),
    title: text(120),
    companyWebsite: url,
    companySize: z.enum(['', '1-10', '11-50', '51-200', '201-1000', '1000+']),
    industry: text(120),
    location: text(120),
    about: text(2000),
  })
  .partial();

// --- jobs ------------------------------------------------------------------------
// Field definitions carry no defaults so that partial updates never overwrite
// fields the client did not send. Defaults are applied only on create.
const salarySchema = z
  .object({ min: z.number().min(0).optional(), max: z.number().min(0).optional(), currency: z.string().length(3).default('USD'), period: z.enum(['year', 'month', 'hour']).default('year') })
  .refine((s) => s.min === undefined || s.max === undefined || s.max >= s.min, 'Maximum salary must be at least the minimum');
const jobFields = {
  title: text(150).min(3),
  description: text(20000).min(30, 'Description should be at least 30 characters'),
  company: text(120),
  requiredSkills: skillList,
  preferredSkills: skillList,
  minExperienceYears: z.number().min(0).max(40),
  educationLevel: z.number().int().min(0).max(5),
  educationRequired: z.boolean(),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  workMode: z.enum(WORK_MODES),
  location: text(120),
  salary: salarySchema,
  deadline: z.coerce.date().nullable(),
};
export const createJobSchema = z.object({
  ...jobFields,
  company: jobFields.company.optional(),
  requiredSkills: skillList.default([]),
  preferredSkills: skillList.default([]),
  minExperienceYears: jobFields.minExperienceYears.default(0),
  educationLevel: jobFields.educationLevel.default(0),
  educationRequired: jobFields.educationRequired.default(false),
  employmentType: jobFields.employmentType.default('full-time'),
  workMode: jobFields.workMode.default('onsite'),
  location: jobFields.location.default(''),
  salary: salarySchema.optional(),
  deadline: jobFields.deadline.optional(),
  publish: z.boolean().default(false),
});
export const updateJobSchema = z.object(jobFields).partial();
export const extractJobSchema = z.object({ title: text(150).min(2), description: text(20000).min(20) });

export const jobQuerySchema = z.object({
  q: text(100).optional(),
  workMode: z.enum(WORK_MODES).optional(),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  location: text(100).optional(),
  skills: text(500).optional(),
  minSalary: z.coerce.number().min(0).optional(),
  maxExperience: z.coerce.number().min(0).max(40).optional(),
  sort: z.enum(['newest', 'salary', 'relevance']).default('newest'),
  status: z.enum(['draft', 'published', 'closed']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

// --- applications ---------------------------------------------------------------
export const applySchema = z.object({ jobId: objectId, coverLetter: text(5000).default(''), resumeId: objectId.optional() });
export const statusSchema = z.object({ status: z.enum(APPLICATION_STATUSES).exclude(['withdrawn']), note: text(500).optional() });
export const notesSchema = z.object({ recruiterNotes: text(3000) });
export const applicationQuerySchema = z.object({
  jobId: objectId.optional(),
  status: z.enum(APPLICATION_STATUSES).optional(),
  q: text(100).optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// --- interviews -------------------------------------------------------------------
export const interviewSchema = z.object({
  applicationId: objectId,
  scheduledAt: z.coerce.date().refine((d) => d.getTime() > Date.now() - 60_000, 'Interview must be in the future'),
  durationMinutes: z.number().int().min(15).max(480).default(45),
  type: z.enum(INTERVIEW_TYPES).default('video'),
  meetingUrl: url.default(''),
  location: text(200).default(''),
  notes: text(2000).default(''),
});
export const updateInterviewSchema = z
  .object({
    scheduledAt: z.coerce.date(),
    durationMinutes: z.number().int().min(15).max(480),
    type: z.enum(INTERVIEW_TYPES),
    meetingUrl: url,
    location: text(200),
    notes: text(2000),
    status: z.enum(INTERVIEW_STATUSES),
  })
  .partial();
export const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  strengths: text(2000).default(''),
  concerns: text(2000).default(''),
  recommendation: z.enum(['advance', 'hold', 'decline']),
  notes: text(3000).default(''),
});
export const rangeQuery = z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional(), status: z.enum(INTERVIEW_STATUSES).optional() });

// --- complaints -----------------------------------------------------------------------
export const complaintSchema = z.object({
  subject: text(150).min(3),
  description: text(5000).min(10),
  category: z.enum(['technical', 'account', 'job', 'ai', 'other']).default('other'),
  priority: z.enum(PRIORITIES).default('medium'),
});
export const complaintResponseSchema = z.object({ message: text(5000).min(1) });
export const complaintUpdateSchema = z.object({ status: z.enum(COMPLAINT_STATUSES).optional(), priority: z.enum(PRIORITIES).optional() });

// --- skills ------------------------------------------------------------------------------
const skillFields = {
  name: text(80).min(1),
  category: text(60),
  aliases: z.array(text(80).min(1)).max(20),
  related: z.array(text(80).min(1)).max(20),
  status: z.enum(['approved', 'pending', 'rejected']),
};
export const skillSchema = z.object({
  ...skillFields,
  category: skillFields.category.default('Other'),
  aliases: skillFields.aliases.default([]),
  related: skillFields.related.default([]),
  status: skillFields.status.default('approved'),
});
export const updateSkillSchema = z.object(skillFields).partial();

// --- admin ---------------------------------------------------------------------------
export const listQuery = z.object({
  q: text(100).optional(),
  role: z.enum(['candidate', 'recruiter', 'admin']).optional(),
  status: text(30).optional(),
  category: text(40).optional(),
  severity: z.enum(['info', 'warning', 'critical']).optional(),
  priority: z.enum(PRIORITIES).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const suspendSchema = z.object({ reason: text(500).min(3) });
export const reviewResumeSchema = z.object({ decision: z.enum(['cleared', 'rejected']), note: text(500).optional() });
export const evaluationSchema = z.object({ mode: z.enum(['job', 'benchmark']), jobId: objectId.optional() }).refine((v) => v.mode === 'benchmark' || !!v.jobId, 'jobId is required for job mode');
export const screeningSettingsSchema = z.object({ autoScreenOnApply: z.boolean(), highlightThreshold: z.number().min(0).max(100), blindReview: z.boolean() }).partial();
export const talentQuery = z.object({
  q: text(100).optional(),
  skills: text(500).optional(),
  minYears: z.coerce.number().min(0).max(60).optional(),
  education: z.coerce.number().int().min(0).max(5).optional(),
  jobId: objectId.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});
