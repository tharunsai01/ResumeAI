import { Router } from 'express';
import * as ctrl from '../controllers/interview.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getInterviews);
router.get('/:id', ctrl.getInterviewById);

// Recruiter scheduling
router.post('/', authorize('recruiter'), ctrl.scheduleInterview);
router.patch('/:id', authorize('recruiter'), ctrl.updateInterview);
router.patch('/:id/cancel', ctrl.cancelInterview);

export default router;
