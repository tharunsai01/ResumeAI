import { Router } from 'express';
import * as ctrl from '../controllers/profile.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateCandidateSchema, skillsSchema, experienceCreate, experiencePatch,
  educationCreate, educationPatch, updateRecruiterSchema,
} from '../validators/profile.validators';

export const candidateRouter = Router();
candidateRouter.use(authenticate, authorize('candidate'));

candidateRouter.get('/me', ctrl.getCandidate);
candidateRouter.patch('/me', validate(updateCandidateSchema), ctrl.updateCandidate);
candidateRouter.put('/me/skills', validate(skillsSchema), ctrl.setSkills);

candidateRouter.post('/me/experience', validate(experienceCreate), ctrl.experience.add);
candidateRouter.patch('/me/experience/:entryId', validate(experiencePatch), ctrl.experience.update);
candidateRouter.delete('/me/experience/:entryId', ctrl.experience.remove);

candidateRouter.post('/me/education', validate(educationCreate), ctrl.education.add);
candidateRouter.patch('/me/education/:entryId', validate(educationPatch), ctrl.education.update);
candidateRouter.delete('/me/education/:entryId', ctrl.education.remove);

export const recruiterRouter = Router();
recruiterRouter.use(authenticate, authorize('recruiter'));

recruiterRouter.get('/me', ctrl.getRecruiter);
recruiterRouter.patch('/me', validate(updateRecruiterSchema), ctrl.updateRecruiter);
