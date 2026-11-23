import { Router } from 'express';
import * as ctrl from '../controllers/skill.controller';

const router = Router();

router.get('/taxonomy', ctrl.getTaxonomy);
router.get('/demand', ctrl.getSkillDemand);
router.get('/career-paths', ctrl.getCareerPaths);
router.get('/analyze', ctrl.analyzeSkills);
router.get('/', ctrl.getTaxonomy);

export default router;
