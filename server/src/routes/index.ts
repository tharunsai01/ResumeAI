import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

// Later phases mount here:
// router.use('/auth', authRoutes);            // Phase 2
// router.use('/candidates', candidateRoutes); // Phase 3
// router.use('/resumes', resumeRoutes);       // Phase 4
// router.use('/jobs', jobRoutes);             // Phase 5

export default router;
