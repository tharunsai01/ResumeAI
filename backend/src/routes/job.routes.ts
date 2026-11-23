import { Router } from 'express';
import * as ctrl from '../controllers/job.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
  jobQuerySchema,
} from '../validators/job.validators';

const router = Router();

// Public / Discovery routes
router.get('/', validate(jobQuerySchema, 'query'), ctrl.searchJobs);
router.get('/recruiter/mine', authenticate, authorize('recruiter'), ctrl.getRecruiterJobs);
router.get('/:id', ctrl.getJob);
router.get('/:id/stats', authenticate, authorize('recruiter'), ctrl.getJobStats);

// Recruiter-protected management routes
router.post('/', authenticate, authorize('recruiter'), validate(createJobSchema), ctrl.createJob);
router.put('/:id', authenticate, authorize('recruiter'), validate(updateJobSchema), ctrl.updateJob);
router.patch('/:id', authenticate, authorize('recruiter'), validate(updateJobSchema), ctrl.updateJob);
router.patch(
  '/:id/status',
  authenticate,
  authorize('recruiter'),
  validate(updateJobStatusSchema),
  ctrl.updateJobStatus,
);
router.delete('/:id', authenticate, authorize('recruiter'), ctrl.deleteJob);

export default router;
