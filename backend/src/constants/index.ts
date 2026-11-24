export const ROLES = ['candidate', 'recruiter', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const APPLICATION_STATUSES = ['applied', 'screened', 'shortlisted', 'interview', 'hired', 'rejected', 'withdrawn'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/** Allowed recruiter-driven pipeline moves. AI screening may only move applied -> screened. */
export const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  applied: ['screened', 'shortlisted', 'rejected'],
  screened: ['applied', 'shortlisted', 'rejected'],
  shortlisted: ['screened', 'interview', 'rejected'],
  interview: ['shortlisted', 'hired', 'rejected'],
  hired: [],
  rejected: ['applied', 'screened', 'shortlisted'],
  withdrawn: [],
};

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return from !== to && STATUS_TRANSITIONS[from].includes(to);
}

export const RESUME_STAGES = [
  'uploaded',
  'validating',
  'extracting',
  'detecting_skills',
  'analysing_experience',
  'generating_report',
  'completed',
  'failed',
] as const;
export type ResumeStage = (typeof RESUME_STAGES)[number];

export const EDUCATION_LEVELS: Record<number, string> = {
  0: 'Not specified',
  1: 'High School',
  2: 'Associate/Diploma',
  3: "Bachelor's",
  4: "Master's",
  5: 'Doctorate',
};

/** The official matching weights. Exposed read-only; nothing in the API can change them. */
export const MATCH_WEIGHTS = Object.freeze({ skills: 0.5, experience: 0.2, education: 0.1, role: 0.2 });

export const WORK_MODES = ['remote', 'hybrid', 'onsite'] as const;
export const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'internship'] as const;
export const JOB_STATUSES = ['draft', 'published', 'closed'] as const;
export const INTERVIEW_TYPES = ['phone', 'video', 'onsite', 'technical', 'hr'] as const;
export const INTERVIEW_STATUSES = ['scheduled', 'completed', 'cancelled', 'no_show'] as const;
export const COMPLAINT_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const AUDIT_CATEGORIES = ['auth', 'admin', 'resume', 'ai_security', 'application', 'job', 'interview', 'system'] as const;
