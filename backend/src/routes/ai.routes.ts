import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as ctrl from '../controllers/ai.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  resumeIdParamSchema,
  jobMatchParamSchema,
  applicationIdParamSchema,
  jobIdParamSchema,
  bulkScreenBodySchema,
} from '../validators/ai.validators';

const router = Router();

// Protect AI provider endpoints against excessive requests
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many AI requests. Please try again later.' },
  },
});

router.use(aiLimiter);

// ==========================================
// Batch 5: Candidate AI Features
// ==========================================
router.post(
  '/resume/analyze/:resumeId',
  authenticate,
  authorize('candidate'),
  validate(resumeIdParamSchema, 'params'),
  ctrl.analyzeResume,
);

router.post(
  '/match/:resumeId/:jobId',
  authenticate,
  authorize('candidate'),
  validate(jobMatchParamSchema, 'params'),
  ctrl.matchResume,
);

// ==========================================
// Batch 6: Recruiter Screening & Insights
// ==========================================
router.post(
  '/screen/:applicationId',
  authenticate,
  authorize('recruiter'),
  validate(applicationIdParamSchema, 'params'),
  ctrl.screenApplication,
);

router.post(
  '/screen/job/:jobId/bulk',
  authenticate,
  authorize('recruiter'),
  validate(jobIdParamSchema, 'params'),
  validate(bulkScreenBodySchema),
  ctrl.bulkScreen,
);

router.get(
  '/insights/job/:jobId',
  authenticate,
  authorize('recruiter'),
  validate(jobIdParamSchema, 'params'),
  ctrl.getJobInsights,
);

router.get(
  '/screen/:applicationId',
  authenticate,
  authorize('recruiter'),
  validate(applicationIdParamSchema, 'params'),
  ctrl.getScreeningResult,
);

export default router;
