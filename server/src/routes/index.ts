import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import candidateRoutes from './candidate.routes';
import resumeRoutes from './resume.routes';
import jobRoutes from './job.routes';
import applicationRoutes from './application.routes';
import aiRoutes from './ai.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/candidates', candidateRoutes);
router.use('/resumes', resumeRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;
