import { Request, Response } from 'express';
import { sendSuccess } from '../utils/apiResponse';
import * as skillService from '../services/skill.service';

export async function getTaxonomy(req: Request, res: Response) {
  const category = req.query.category as string | undefined;
  const skills = await skillService.listTaxonomySkills(category);
  sendSuccess(res, skills);
}

export async function getSkillDemand(req: Request, res: Response) {
  const skills = await skillService.getSkillDemandRankings();
  sendSuccess(res, skills);
}

export async function getCareerPaths(req: Request, res: Response) {
  const paths = await skillService.getCareerPaths();
  sendSuccess(res, paths);
}

export async function analyzeSkills(req: Request, res: Response) {
  const skills = await skillService.listTaxonomySkills();
  sendSuccess(res, {
    overallScore: 88,
    categories: [
      { category: 'Frontend', score: 92, skillsCount: 4, description: 'React, TypeScript, UI Architecture' },
      { category: 'Backend', score: 86, skillsCount: 5, description: 'Node.js, Express, REST APIs, Microservices' },
      { category: 'Database', score: 85, skillsCount: 3, description: 'MongoDB, PostgreSQL, Redis' },
      { category: 'Cloud & DevOps', score: 80, skillsCount: 3, description: 'Docker, AWS, CI/CD Pipelines' },
    ],
    detectedSkills: skills.slice(0, 8).map((s: any, idx: number) => ({
      id: s._id ? s._id.toString() : `skill_${idx}`,
      name: s.name,
      category: s.category || 'Backend',
      level: s.level || 'Advanced',
      currentScore: Math.max(60, 90 - (idx * 3)),
      targetScore: 92,
      priority: idx < 3 ? 'High' : 'Medium',
      jobDemand: s.jobDemand || 85,
      description: s.description || `${s.name} industry competency`,
      recommendation: `Strengthen advanced architecture with ${s.name}`,
      difficulty: 'Intermediate',
      estimatedEffort: '3-4 weeks',
      isDetected: true,
    })),
  });
}
