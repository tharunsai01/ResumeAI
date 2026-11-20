export const ROLES = ['candidate', 'recruiter', 'admin'] as const;

export const JOB_STATUS = ['draft', 'open', 'closed'] as const;
export const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship'] as const;
export const WORK_MODES = ['onsite', 'remote', 'hybrid'] as const;
export const EDUCATION_LEVELS = ['any', 'bachelors', 'masters', 'phd'] as const;

export const APPLICATION_STATUS = [
  'applied',
  'screened',
  'shortlisted',
  'interview',
  'hired',
  'rejected',
  'withdrawn',
] as const;

export const PARSE_STATUS = ['pending', 'processing', 'done', 'failed'] as const;

export const INTERVIEW_MODES = ['video', 'phone', 'onsite'] as const;
export const INTERVIEW_STATUS = ['scheduled', 'completed', 'cancelled'] as const;

export const NOTIFICATION_TYPES = [
  'application_received',
  'status_changed',
  'shortlisted',
  'interview_scheduled',
  'system',
  'screening_completed',
  'application_withdrawn',
] as const;

export const COMPLAINT_CATEGORIES = [
  'account',
  'resume',
  'job_posting',
  'ai_screening',
  'safety',
  'technical',
  'other',
] as const;
export const COMPLAINT_STATUS = ['open', 'in_review', 'resolved'] as const;
