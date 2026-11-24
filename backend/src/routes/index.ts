import { Router, type NextFunction, type Request, type Response } from 'express';
import * as admin from '../controllers/admin.controller';
import * as analytics from '../controllers/analytics.controller';
import * as apps from '../controllers/application.controller';
import * as auth from '../controllers/auth.controller';
import * as interviews from '../controllers/interview.controller';
import * as jobs from '../controllers/job.controller';
import * as matching from '../controllers/matching.controller';
import * as profile from '../controllers/profile.controller';
import * as resumes from '../controllers/resume.controller';
import * as support from '../controllers/support.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { authLimiter, uploadLimiter } from '../middleware/security';
import { resumeUpload } from '../middleware/upload';
import { validate as v } from '../middleware/validate';
import { ApiError } from '../utils/ApiError';
import * as s from '../validators/schemas';

const candidate = [authenticate, authorize('candidate')];
const recruiter = [authenticate, authorize('recruiter')];
const recruiterOrAdmin = [authenticate, authorize('recruiter', 'admin')];
const adminOnly = [authenticate, authorize('admin')];
const id = v(s.idParam, 'params');
const jobId = v(s.jobIdParam, 'params');

/** Cookie-authenticated endpoints require a custom header, which forces a CORS preflight (CSRF guard). */
function requireXhr(req: Request, _res: Response, next: NextFunction) {
  if (req.get('X-Requested-With') !== 'HireSmart') throw ApiError.forbidden('Missing request header');
  next();
}

export const api = Router();

// --- auth -------------------------------------------------------------------------
const a = Router();
a.get('/providers', auth.providers);
a.post('/register', authLimiter, v(s.registerSchema), auth.register);
a.post('/login', authLimiter, v(s.loginSchema), auth.login);
a.post('/refresh', requireXhr, auth.refresh);
a.post('/logout', requireXhr, auth.logout);
a.get('/me', authenticate, auth.me);
a.get('/oauth/:provider', authLimiter, auth.oauthStart);
a.get('/oauth/:provider/callback', auth.oauthCallback);
api.use('/auth', a);

// --- users / profiles ---------------------------------------------------------------
api.patch('/users/me/preferences', authenticate, v(s.preferencesSchema), profile.updatePreferences);
api.patch('/users/me/password', authenticate, authLimiter, v(s.changePasswordSchema), profile.changePassword);
api.get('/candidates/me', ...candidate, profile.getMyCandidateProfile);
api.put('/candidates/me', ...candidate, v(s.candidateProfileSchema), profile.updateMyCandidateProfile);
api.get('/candidates/:id', ...recruiterOrAdmin, id, profile.getCandidateForRecruiter);
api.get('/recruiters/me', ...recruiter, profile.getMyRecruiterProfile);
api.put('/recruiters/me', ...recruiter, v(s.recruiterProfileSchema), profile.updateMyRecruiterProfile);

// --- resumes -------------------------------------------------------------------------
api.post('/resumes', ...candidate, uploadLimiter, resumeUpload, resumes.uploadResume);
api.get('/resumes', ...candidate, resumes.listResumes);
api.get('/resumes/:id', authenticate, id, resumes.getResume);
api.get('/resumes/:id/download', authenticate, id, resumes.downloadResume);
api.patch('/resumes/:id/activate', ...candidate, id, resumes.setActiveResume);
api.post('/resumes/:id/apply-to-profile', ...candidate, id, profile.applyResumeToProfile);
api.post('/resumes/:id/reprocess', ...candidate, uploadLimiter, id, resumes.reprocessResume);
api.delete('/resumes/:id', ...candidate, id, resumes.deleteResume);

// --- jobs ------------------------------------------------------------------------------
api.get('/jobs', optionalAuthenticate, v(s.jobQuerySchema, 'query'), jobs.listPublicJobs);
api.get('/jobs/mine', ...recruiter, v(s.jobQuerySchema, 'query'), jobs.myJobs);
api.get('/jobs/bookmarks', ...candidate, jobs.bookmarks);
api.post('/jobs/extract', ...recruiter, v(s.extractJobSchema), jobs.extractJob);
api.post('/jobs', ...recruiter, v(s.createJobSchema), jobs.createJob);
api.get('/jobs/:id', optionalAuthenticate, id, jobs.getJob);
api.put('/jobs/:id', ...recruiterOrAdmin, id, v(s.updateJobSchema), jobs.updateJob);
api.post('/jobs/:id/publish', ...recruiterOrAdmin, id, jobs.publishJob);
api.post('/jobs/:id/close', ...recruiterOrAdmin, id, jobs.closeJob);
api.delete('/jobs/:id', ...recruiterOrAdmin, id, jobs.deleteJob);
api.get('/jobs/:id/analytics', ...recruiterOrAdmin, id, jobs.jobAnalytics);
api.post('/jobs/:id/bookmark', ...candidate, id, jobs.toggleBookmark);
api.delete('/jobs/:id/bookmark', ...candidate, id, jobs.toggleBookmark);

// --- applications ----------------------------------------------------------------------
api.post('/applications', ...candidate, v(s.applySchema), apps.apply);
api.get('/applications/me', ...candidate, apps.myApplications);
api.get('/applications', ...recruiter, v(s.applicationQuerySchema, 'query'), apps.recruiterApplications);
api.get('/applications/:id', authenticate, id, apps.getApplication);
api.patch('/applications/:id/withdraw', ...candidate, id, apps.withdraw);
api.patch('/applications/:id/status', ...recruiterOrAdmin, id, v(s.statusSchema), apps.updateStatus);
api.patch('/applications/:id/notes', ...recruiter, id, v(s.notesSchema), apps.updateNotes);

// --- matching & screening ---------------------------------------------------------------
api.get('/matching/me', ...candidate, matching.myMatches);
api.get('/matching/recommendations', ...candidate, matching.recommendations);
api.get('/matching/skill-gap', ...candidate, matching.skillGap);
api.get('/matching/jobs/:jobId', ...candidate, jobId, matching.matchJob);
api.post('/screening/jobs/:jobId/run', ...recruiterOrAdmin, jobId, matching.runScreening);
api.get('/screening/jobs/:jobId', ...recruiterOrAdmin, jobId, matching.screeningResults);
api.get('/screening/jobs/:jobId/settings', ...recruiterOrAdmin, jobId, matching.getScreeningSettings);
api.put('/screening/jobs/:jobId/settings', ...recruiterOrAdmin, jobId, v(s.screeningSettingsSchema), matching.updateScreeningSettings);
api.get('/talent', ...recruiter, v(s.talentQuery, 'query'), analytics.talentPool);

// --- interviews -----------------------------------------------------------------------------
api.post('/interviews', ...recruiter, v(s.interviewSchema), interviews.scheduleInterview);
api.get('/interviews', authenticate, v(s.rangeQuery, 'query'), interviews.listInterviews);
api.patch('/interviews/:id', ...recruiter, id, v(s.updateInterviewSchema), interviews.updateInterview);
api.post('/interviews/:id/feedback', ...recruiter, id, v(s.feedbackSchema), interviews.submitFeedback);

// --- notifications ----------------------------------------------------------------------------
api.get('/notifications', authenticate, support.listNotifications);
api.get('/notifications/unread-count', authenticate, support.unreadCount);
api.patch('/notifications/read-all', authenticate, support.markAllRead);
api.patch('/notifications/:id/read', authenticate, id, support.markRead);

// --- complaints / support -------------------------------------------------------------------
api.post('/complaints', authenticate, v(s.complaintSchema), support.createComplaint);
api.get('/complaints/mine', authenticate, support.myComplaints);
api.get('/complaints/:id', authenticate, id, support.getComplaint);
api.post('/complaints/:id/responses', authenticate, id, v(s.complaintResponseSchema), support.respondComplaint);

// --- skills -----------------------------------------------------------------------------------
api.get('/skills', optionalAuthenticate, v(s.listQuery, 'query'), support.listSkills);
api.post('/skills', ...adminOnly, v(s.skillSchema), support.createSkill);
api.put('/skills/:id', ...adminOnly, id, v(s.updateSkillSchema), support.updateSkill);
api.delete('/skills/:id', ...adminOnly, id, support.deleteSkill);

// --- analytics ---------------------------------------------------------------------------------
api.get('/analytics/candidate', ...candidate, analytics.candidateDashboard);
api.get('/analytics/recruiter', ...recruiter, analytics.recruiterDashboard);

// --- admin -------------------------------------------------------------------------------------
const ad = Router();
ad.use(...adminOnly);
ad.get('/analytics', admin.platformAnalytics);
ad.get('/users', v(s.listQuery, 'query'), admin.listUsers);
ad.get('/users/:id', id, admin.userDetails);
ad.patch('/users/:id/suspend', id, v(s.suspendSchema), admin.suspendUser);
ad.patch('/users/:id/reactivate', id, admin.reactivateUser);
ad.get('/complaints', v(s.listQuery, 'query'), support.adminListComplaints);
ad.patch('/complaints/:id', id, v(s.complaintUpdateSchema), support.adminUpdateComplaint);
ad.get('/audit-logs', v(s.listQuery, 'query'), admin.auditLogs);
ad.get('/security-events', admin.securityEvents);
ad.patch('/resumes/:id/review', id, v(s.reviewResumeSchema), admin.reviewResume);
ad.post('/ai-evaluations', v(s.evaluationSchema), admin.runEvaluation);
ad.get('/ai-evaluations', admin.listEvaluations);
ad.get('/ai-evaluations/:id', id, admin.getEvaluation);
ad.get('/health', admin.systemHealth);
api.use('/admin', ad);
