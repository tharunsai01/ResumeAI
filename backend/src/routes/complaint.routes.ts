import { Router } from 'express';
import * as ctrl from '../controllers/complaint.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', ctrl.createComplaint);
router.get('/', ctrl.getMyComplaints);
router.get('/my', ctrl.getMyComplaints);
router.get('/:id', ctrl.getComplaint);

export default router;
