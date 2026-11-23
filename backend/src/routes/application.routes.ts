import { Router } from 'express';
import * as ctrl from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
  withdrawApplicationSchema,
} from '../validators/application.validators';

const router = Router();

// All application routes require authentication
router.use(authenticate);

// Candidate routes
router.post('/', authorize('candidate'), validate(createApplicationSchema), ctrl.apply);
router.get('/me', authorize('candidate'), ctrl.getCandidateApplications);
router.patch(
  '/:id/withdraw',
  authorize('candidate'),
  validate(withdrawApplicationSchema),
  ctrl.withdraw,
);

// Recruiter routes
router.get('/job/:jobId', authorize('recruiter'), ctrl.getJobApplications);
router.patch(
  '/:id/status',
  authorize('recruiter'),
  validate(updateApplicationStatusSchema),
  ctrl.updateStatus,
);
router.put(
  '/:id/status',
  authorize('recruiter'),
  validate(updateApplicationStatusSchema),
  ctrl.updateStatus,
);
router.post('/:id/notes', authorize('recruiter'), ctrl.addNote);

// General route (accessible by candidate owner or job recruiter)
router.get('/:id', ctrl.getApplication);

export default router;
