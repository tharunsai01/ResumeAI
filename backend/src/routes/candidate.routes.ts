import { Router } from 'express';
import * as ctrl from '../controllers/candidate.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import {
  updateCandidateProfileSchema,
  patchCandidateProfileSchema,
  addSkillSchema,
} from '../validators/candidate.validators';

const router = Router();

// Restrict all candidate routes strictly to authenticated users with 'candidate' role
router.use(authenticate, authorize('candidate'));

// Profile endpoints
router.get('/profile', ctrl.getProfile);
router.get('/me', ctrl.getProfile);
router.get('/', ctrl.getProfile);

router.put('/profile', validate(updateCandidateProfileSchema), ctrl.updateProfile);
router.put('/', validate(updateCandidateProfileSchema), ctrl.updateProfile);

router.patch('/profile', validate(patchCandidateProfileSchema), ctrl.patchProfile);
router.patch('/', validate(patchCandidateProfileSchema), ctrl.patchProfile);

// Skills sub-resource
router.post('/skills', validate(addSkillSchema), ctrl.addSkill);
router.delete('/skills/:skillName', ctrl.removeSkill);

// Bookmarks
router.get('/bookmarks', ctrl.getBookmarks);
router.post('/bookmarks/:jobId', ctrl.bookmarkJob);
router.delete('/bookmarks/:jobId', ctrl.removeBookmark);

// Recommendations & Dashboard
router.get('/recommended-jobs', ctrl.getRecommendedJobs);
router.get('/dashboard', ctrl.getDashboard);

export default router;
