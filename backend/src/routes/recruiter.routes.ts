import { Router } from 'express';
import * as ctrl from '../controllers/recruiter.controller';
import { authenticate, authorize } from '../middleware/auth';

import { z } from 'zod';
import { validate } from '../middleware/validate';
import { recordIdParamSchema } from '../validators/recordId.validators';

const recruiterCandidateQuery = z.object({
  candidateId: z.string().regex(/^[a-f0-9]{24}$/i).optional(),
  skills: z.string().trim().max(500).optional(),
  location: z.string().trim().max(200).optional(),
  search: z.string().trim().max(200).optional(),
  minExperience: z.coerce.number().min(0).max(80).optional(),
});

const router = Router();

router.use(authenticate, authorize('recruiter'));

router.get('/profile', ctrl.getProfile);
router.put('/profile', ctrl.updateProfile);
router.get('/dashboard', ctrl.getDashboard);

router.get('/candidates', validate(recruiterCandidateQuery, 'query'), ctrl.searchCandidates);
router.get('/candidates/:id', validate(recordIdParamSchema, 'params'), ctrl.getCandidateDetails);

router.get('/screening-settings', ctrl.getScreeningSettings);
router.put('/screening-settings', ctrl.updateScreeningSettings);

router.get('/pipeline', ctrl.getPipeline);
router.patch('/pipeline/:applicationId/stage', ctrl.updatePipelineStage);

export default router;
