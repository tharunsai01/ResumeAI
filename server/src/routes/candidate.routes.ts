import { Router } from 'express';
import * as ctrl from '../controllers/candidate.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import {
  updateCandidateProfileSchema,
  patchCandidateProfileSchema,
} from '../validators/candidate.validators';

const router = Router();

// Restrict all candidate profile routes strictly to authenticated users with 'candidate' role
router.use(authenticate, authorize('candidate'));

// GET endpoints
router.get('/profile', ctrl.getProfile);
router.get('/me', ctrl.getProfile);
router.get('/', ctrl.getProfile);

// PUT endpoints (full update)
router.put('/profile', validate(updateCandidateProfileSchema), ctrl.updateProfile);
router.put('/', validate(updateCandidateProfileSchema), ctrl.updateProfile);

// PATCH endpoints (partial update)
router.patch('/profile', validate(patchCandidateProfileSchema), ctrl.patchProfile);
router.patch('/', validate(patchCandidateProfileSchema), ctrl.patchProfile);

export default router;
