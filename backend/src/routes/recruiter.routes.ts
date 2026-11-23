import { Router } from 'express';
import * as ctrl from '../controllers/recruiter.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('recruiter'));

router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.get('/dashboard', ctrl.getDashboard);

router.get('/candidates', ctrl.searchCandidates);
router.get('/candidates/:id', ctrl.getCandidateDetails);

router.get('/screening-settings', ctrl.getScreeningSettings);
router.put('/screening-settings', ctrl.updateScreeningSettings);

router.get('/pipeline', ctrl.getPipeline);
router.patch('/pipeline/:applicationId/stage', ctrl.updatePipelineStage);

export default router;
