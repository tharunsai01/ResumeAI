import { Router } from 'express';
import * as ctrl from '../controllers/interview.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { scheduleInterviewSchema } from '../validators/interview.validators';
import { recordIdParamSchema } from '../validators/recordId.validators';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getInterviews);
router.get('/:id', validate(recordIdParamSchema, 'params'), ctrl.getInterviewById);

// Recruiter scheduling
router.post('/', authorize('recruiter'), validate(scheduleInterviewSchema), ctrl.scheduleInterview);
router.patch('/:id', authorize('recruiter'), validate(recordIdParamSchema, 'params'), ctrl.updateInterview);
router.patch('/:id/cancel', validate(recordIdParamSchema, 'params'), ctrl.cancelInterview);

export default router;
