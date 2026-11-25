import { Router } from 'express';
import * as ctrl from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  addApplicationNoteSchema,
  createApplicationSchema,
  updateApplicationStatusSchema,
  withdrawApplicationSchema,
} from '../validators/application.validators';

import { recordIdParamSchema, jobIdParamSchema } from '../validators/recordId.validators';

const router = Router();

// All application routes require authentication
router.use(authenticate);

// Candidate routes
router.post('/', authorize('candidate'), validate(createApplicationSchema), ctrl.apply);
router.get('/me', authorize('candidate'), ctrl.getCandidateApplications);
router.patch(
  '/:id/withdraw',
  authorize('candidate'),
  validate(recordIdParamSchema, 'params'),
  validate(withdrawApplicationSchema),
  ctrl.withdraw,
);

// Recruiter routes
router.get('/job/:jobId', authorize('recruiter'), validate(jobIdParamSchema, 'params'), ctrl.getJobApplications);
router.patch(
  '/:id/status',
  authorize('recruiter'),
  validate(recordIdParamSchema, 'params'),
  validate(updateApplicationStatusSchema),
  ctrl.updateStatus,
);
router.put(
  '/:id/status',
  authorize('recruiter'),
  validate(recordIdParamSchema, 'params'),
  validate(updateApplicationStatusSchema),
  ctrl.updateStatus,
);
router.post('/:id/notes', authorize('recruiter'), validate(recordIdParamSchema, 'params'), validate(addApplicationNoteSchema), ctrl.addNote);

// General route (accessible by candidate owner or job recruiter)
router.get('/:id', validate(recordIdParamSchema, 'params'), ctrl.getApplication);

export default router;
