import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

router.use('/health', healthRoutes);

// Later phases mount here:
// router.use('/auth', authRoutes);            // Phase 2
// router.use('/candidates', candidateRoutes); // Phase 3
// router.use('/resumes', resumeRoutes);       // Phase 4
// router.use('/jobs', jobRoutes);             // Phase 5

export default router;
