/** Typed wrappers for every backend endpoint used by the UI. */
import type { AxiosProgressEvent } from 'axios';
import { api, unwrap, unwrapPage } from './api';
import type {
  AiEvaluationRun,
  Application,
  ApplicationStatus,
  AuditLog,
  CandidateProfile,
  Complaint,
  Interview,
  Job,
  MatchResult,
  Notification,
  RecruiterProfile,
  Resume,
  Skill,
  User,
} from '@/types';

type Q = Record<string, string | number | boolean | undefined | null>;
const clean = (q: Q = {}) => Object.fromEntries(Object.entries(q).filter(([, v]) => v !== undefined && v !== null && v !== ''));

export const authApi = {
  login: (email: string, password: string) => unwrap<{ user: User; accessToken: string }>(api.post('/auth/login', { email, password })),
  register: (body: { name: string; email: string; password: string; role: 'candidate' | 'recruiter'; company?: string }) =>
    unwrap<{ user: User; accessToken: string }>(api.post('/auth/register', body)),
  logout: () => api.post('/auth/logout'),
  me: () => unwrap<{ user: User }>(api.get('/auth/me')),
  providers: () => unwrap<{ google: boolean; linkedin: boolean }>(api.get('/auth/providers')),
  updatePreferences: (prefs: Partial<User['preferences']>) => unwrap<{ user: User }>(api.patch('/users/me/preferences', prefs)),
  changePassword: (currentPassword: string, newPassword: string) => unwrap(api.patch('/users/me/password', { currentPassword, newPassword })),
  oauthUrl: (provider: 'google' | 'linkedin', role: string) => `${api.defaults.baseURL}/auth/oauth/${provider}?role=${role}`,
};

export const candidateApi = {
  me: () => unwrap<CandidateProfile>(api.get('/candidates/me')),
  update: (body: Partial<CandidateProfile> & { name?: string }) => unwrap<CandidateProfile>(api.put('/candidates/me', body)),
  get: (userId: string) => unwrap<CandidateProfile & { user: { _id: string; name: string; email: string } }>(api.get(`/candidates/${userId}`)),
  dashboard: () => unwrap<any>(api.get('/analytics/candidate')),
};

export const recruiterApi = {
  me: () => unwrap<RecruiterProfile>(api.get('/recruiters/me')),
  update: (body: Partial<RecruiterProfile>) => unwrap<RecruiterProfile>(api.put('/recruiters/me', body)),
  dashboard: () => unwrap<any>(api.get('/analytics/recruiter')),
  talent: (q: Q) => unwrapPage<any>(api.get('/talent', { params: clean(q) })),
};

export const resumeApi = {
  list: () => unwrap<Resume[]>(api.get('/resumes')),
  get: (id: string) => unwrap<Resume>(api.get(`/resumes/${id}`)),
  upload: (file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    return unwrap<{ _id: string; status: string; originalName: string }>(
      api.post('/resumes', form, {
        onUploadProgress: (e: AxiosProgressEvent) => onProgress?.(e.total ? Math.round((e.loaded / e.total) * 100) : 0),
      }),
    );
  },
  activate: (id: string) => unwrap<Resume>(api.patch(`/resumes/${id}/activate`)),
  remove: (id: string) => unwrap(api.delete(`/resumes/${id}`)),
  reprocess: (id: string) => unwrap(api.post(`/resumes/${id}/reprocess`)),
  applyToProfile: (id: string, sections?: string[]) => unwrap<CandidateProfile>(api.post(`/resumes/${id}/apply-to-profile`, { sections })),
  download: async (id: string, name: string) => {
    const res = await api.get(`/resumes/${id}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  /** Object URL for in-page preview (PDF only). */
  previewUrl: async (id: string) => {
    const res = await api.get(`/resumes/${id}/download`, { responseType: 'blob' });
    return URL.createObjectURL(new Blob([res.data as Blob], { type: 'application/pdf' }));
  },
};

export const jobsApi = {
  list: (q: Q) => unwrapPage<Job>(api.get('/jobs', { params: clean(q) })),
  mine: (q: Q = {}) => unwrapPage<Job>(api.get('/jobs/mine', { params: clean(q) })),
  get: (id: string) => unwrap<Job>(api.get(`/jobs/${id}`)),
  create: (body: Partial<Job> & { publish?: boolean }) => unwrap<Job>(api.post('/jobs', body)),
  update: (id: string, body: Partial<Job>) => unwrap<Job>(api.put(`/jobs/${id}`, body)),
  publish: (id: string) => unwrap<Job>(api.post(`/jobs/${id}/publish`)),
  close: (id: string) => unwrap<Job>(api.post(`/jobs/${id}/close`)),
  remove: (id: string) => unwrap(api.delete(`/jobs/${id}`)),
  analytics: (id: string) => unwrap<any>(api.get(`/jobs/${id}/analytics`)),
  extract: (title: string, description: string) => unwrap<any>(api.post('/jobs/extract', { title, description })),
  bookmark: (id: string, on: boolean) => unwrap(on ? api.post(`/jobs/${id}/bookmark`) : api.delete(`/jobs/${id}/bookmark`)),
  bookmarks: () => unwrap<Job[]>(api.get('/jobs/bookmarks')),
};

export const applicationsApi = {
  apply: (jobId: string, coverLetter = '') => unwrap<Application>(api.post('/applications', { jobId, coverLetter })),
  mine: () => unwrap<Application[]>(api.get('/applications/me')),
  get: (id: string) => unwrap<Application>(api.get(`/applications/${id}`)),
  withdraw: (id: string) => unwrap<Application>(api.patch(`/applications/${id}/withdraw`)),
  forRecruiter: (q: Q) => unwrapPage<Application>(api.get('/applications', { params: clean(q) })),
  setStatus: (id: string, status: ApplicationStatus, note?: string) => unwrap<Application>(api.patch(`/applications/${id}/status`, { status, note })),
  setNotes: (id: string, recruiterNotes: string) => unwrap<Application>(api.patch(`/applications/${id}/notes`, { recruiterNotes })),
};

export const matchingApi = {
  forJob: (jobId: string, narrative = false) => unwrap<MatchResult>(api.get(`/matching/jobs/${jobId}`, { params: narrative ? { narrative: 'true' } : {} })),
  mine: () => unwrap<(MatchResult & { job: Job })[]>(api.get('/matching/me')),
  recommendations: (limit = 6) => unwrap<{ job: Job; match: Pick<MatchResult, 'components' | 'matchedSkills' | 'missingSkills' | 'category'> & { score: number } }[]>(api.get('/matching/recommendations', { params: { limit } })),
  skillGap: () => unwrap<any>(api.get('/matching/skill-gap')),
};

export const screeningApi = {
  results: (jobId: string) => unwrap<any>(api.get(`/screening/jobs/${jobId}`)),
  run: (jobId: string) => unwrap<{ screened: number; total: number }>(api.post(`/screening/jobs/${jobId}/run`)),
  settings: (jobId: string) => unwrap<any>(api.get(`/screening/jobs/${jobId}/settings`)),
  updateSettings: (jobId: string, body: Record<string, unknown>) => unwrap<any>(api.put(`/screening/jobs/${jobId}/settings`, body)),
};

export const interviewsApi = {
  list: (q: Q = {}) => unwrap<Interview[]>(api.get('/interviews', { params: clean(q) })),
  schedule: (body: Record<string, unknown>) => unwrap<Interview>(api.post('/interviews', body)),
  update: (id: string, body: Record<string, unknown>) => unwrap<Interview>(api.patch(`/interviews/${id}`, body)),
  feedback: (id: string, body: Record<string, unknown>) => unwrap<Interview>(api.post(`/interviews/${id}/feedback`, body)),
};

export const notificationsApi = {
  list: (q: Q = {}) => unwrapPage<Notification>(api.get('/notifications', { params: clean(q) })),
  unread: () => unwrap<{ unread: number }>(api.get('/notifications/unread-count')),
  read: (id: string) => unwrap(api.patch(`/notifications/${id}/read`)),
  readAll: () => unwrap(api.patch('/notifications/read-all')),
};

export const complaintsApi = {
  create: (body: Record<string, unknown>) => unwrap<Complaint>(api.post('/complaints', body)),
  mine: () => unwrap<Complaint[]>(api.get('/complaints/mine')),
  get: (id: string) => unwrap<Complaint>(api.get(`/complaints/${id}`)),
  respond: (id: string, message: string) => unwrap<Complaint>(api.post(`/complaints/${id}/responses`, { message })),
};

export const skillsApi = {
  list: (q: Q = {}) => unwrapPage<Skill>(api.get('/skills', { params: clean(q) })),
  create: (body: Partial<Skill>) => unwrap<Skill>(api.post('/skills', body)),
  update: (id: string, body: Partial<Skill>) => unwrap<Skill>(api.put(`/skills/${id}`, body)),
  remove: (id: string) => unwrap(api.delete(`/skills/${id}`)),
};

export const adminApi = {
  analytics: () => unwrap<any>(api.get('/admin/analytics')),
  users: (q: Q) => unwrapPage<User>(api.get('/admin/users', { params: clean(q) })),
  user: (id: string) => unwrap<any>(api.get(`/admin/users/${id}`)),
  suspend: (id: string, reason: string) => unwrap<User>(api.patch(`/admin/users/${id}/suspend`, { reason })),
  reactivate: (id: string) => unwrap<User>(api.patch(`/admin/users/${id}/reactivate`)),
  complaints: (q: Q) => unwrapPage<Complaint>(api.get('/admin/complaints', { params: clean(q) })),
  updateComplaint: (id: string, body: Record<string, unknown>) => unwrap<Complaint>(api.patch(`/admin/complaints/${id}`, body)),
  auditLogs: (q: Q) => unwrapPage<AuditLog>(api.get('/admin/audit-logs', { params: clean(q) })),
  securityEvents: () => unwrap<{ flaggedResumes: any[]; events: AuditLog[] }>(api.get('/admin/security-events')),
  reviewResume: (id: string, decision: 'cleared' | 'rejected', note?: string) => unwrap(api.patch(`/admin/resumes/${id}/review`, { decision, note })),
  runEvaluation: (mode: 'job' | 'benchmark', jobId?: string) => unwrap<AiEvaluationRun>(api.post('/admin/ai-evaluations', { mode, jobId })),
  evaluations: () => unwrap<AiEvaluationRun[]>(api.get('/admin/ai-evaluations')),
  evaluation: (id: string) => unwrap<AiEvaluationRun>(api.get(`/admin/ai-evaluations/${id}`)),
  health: () => unwrap<any>(api.get('/admin/health')),
};
