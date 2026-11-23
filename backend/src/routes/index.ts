import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import candidateRoutes from './candidate.routes';
import recruiterRoutes from './recruiter.routes';
import resumeRoutes from './resume.routes';
import jobRoutes from './job.routes';
import applicationRoutes from './application.routes';
import aiRoutes from './ai.routes';
import notificationRoutes from './notification.routes';
import interviewRoutes from './interview.routes';
import complaintRoutes from './complaint.routes';
import skillRoutes from './skill.routes';
import adminRoutes from './admin.routes';

const router = Router();

// API Gateway Root Overview
router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'HireSmart AI API Gateway',
      version: '1.0.0',
      status: 'online',
      message: 'HireSmart AI API Gateway is active and ready.',
      health: '/api/v1/health',
      endpoints: {
        health: '/api/v1/health',
        auth: '/api/v1/auth',
        candidates: '/api/v1/candidates',
        recruiter: '/api/v1/recruiter',
        resumes: '/api/v1/resumes',
        jobs: '/api/v1/jobs',
        applications: '/api/v1/applications',
        ai: '/api/v1/ai',
        notifications: '/api/v1/notifications',
        interviews: '/api/v1/interviews',
        complaints: '/api/v1/complaints',
        skills: '/api/v1/skills',
        admin: '/api/v1/admin',
      },
    },
  });
});

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/candidates', candidateRoutes);
router.use('/candidate', candidateRoutes);
router.use('/recruiter', recruiterRoutes);
router.use('/resumes', resumeRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);
router.use('/interviews', interviewRoutes);
router.use('/complaints', complaintRoutes);
router.use('/skills', skillRoutes);
router.use('/admin', adminRoutes);

export default router;
