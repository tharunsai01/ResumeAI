import { Skill } from '../models';
import { ApiError } from '../utils/ApiError';
import { recordAuditLog } from './audit.service';

export async function listTaxonomySkills(category?: string) {
  const filter: any = { status: 'approved' };
  if (category) filter.category = category;
  return Skill.find(filter).sort({ name: 1 });
}

export async function getSkillDemandRankings() {
  return Skill.find({ status: 'approved' })
    .sort({ jobDemand: -1 })
    .limit(30);
}

export async function getCareerPaths() {
  return [
    {
      id: 'path_fullstack',
      title: 'Full-stack Web Engineer',
      level: 'Mid to Senior',
      description: 'End-to-end web architecture, distributed services, and modern frontends.',
      requiredSkills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'AWS'],
      strongSkills: ['React', 'Node.js', 'TypeScript'],
      missingSkills: ['MongoDB', 'Docker', 'AWS'],
      averageSalary: '$120,000 - $160,000',
      matchProbability: 92,
      readinessScore: 92,
    },
    {
      id: 'path_ai_engineer',
      title: 'AI / LLM Application Engineer',
      level: 'Specialist',
      description: 'Building intelligent applications with LLMs, embeddings, RAG, and agentic workflows.',
      requiredSkills: ['Python', 'FastAPI', 'Groq API', 'PyTorch', 'NLP', 'Docker'],
      strongSkills: ['Python', 'FastAPI', 'Groq API'],
      missingSkills: ['PyTorch', 'NLP', 'Docker'],
      averageSalary: '$140,000 - $190,000',
      matchProbability: 85,
      readinessScore: 85,
    },
    {
      id: 'path_cloud_architect',
      title: 'Cloud DevOps Architect',
      level: 'Senior',
      description: 'Designing resilient cloud infrastructure, CI/CD pipelines, and microservices.',
      requiredSkills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Terraform', 'Linux'],
      strongSkills: ['Linux', 'Docker'],
      missingSkills: ['AWS', 'Kubernetes', 'CI/CD', 'Terraform'],
      averageSalary: '$135,000 - $175,000',
      matchProbability: 78,
      readinessScore: 78,
    },
  ];
}

// Admin skill management
export async function listSkillsForAdmin(query: {
  category?: string;
  status?: string;
  isUnknown?: boolean | string;
  search?: string;
}) {
  const filter: any = {};
  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.isUnknown !== undefined) {
    filter.isUnknown = String(query.isUnknown) === 'true';
  }
  if (query.search) {
    const s = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ name: s }, { category: s }, { synonyms: { $in: [s] } }];
  }

  return Skill.find(filter).sort({ createdAt: -1 });
}

export async function addSkill(
  adminId: string,
  data: {
    name: string;
    category: string;
    level?: string;
    description?: string;
    synonyms?: string[];
    jobDemand?: number;
    trend?: 'rising' | 'stable' | 'declining';
  },
) {
  const existing = await Skill.findOne({
    name: { $regex: `^${data.name.trim()}$`, $options: 'i' },
  });
  if (existing) {
    throw ApiError.conflict(`Skill "${data.name}" already exists in taxonomy`);
  }

  const skill = await Skill.create({
    name: data.name.trim(),
    category: data.category.trim(),
    level: (data.level as any) || 'Intermediate',
    description: data.description,
    synonyms: data.synonyms || [],
    jobDemand: data.jobDemand ?? 70,
    trend: data.trend || 'rising',
    status: 'approved',
    isUnknown: false,
    source: 'system',
    reviewedBy: adminId as any,
    reviewedAt: new Date(),
  });

  void recordAuditLog({
    action: 'SKILL_ADD',
    actorId: adminId,
    actorRole: 'admin',
    targetType: 'Skill',
    targetId: (skill as any)._id.toString(),
    status: 'success',
    details: { name: (skill as any).name, category: (skill as any).category },
  });

  return skill;
}

export async function updateSkill(adminId: string, skillId: string, data: any) {
  const skill = await Skill.findById(skillId);
  if (!skill) throw ApiError.notFound('Skill not found');

  if (data.name) skill.name = data.name.trim();
  if (data.category) skill.category = data.category.trim();
  if (data.level) skill.level = data.level;
  if (data.description !== undefined) skill.description = data.description;
  if (data.synonyms) skill.synonyms = data.synonyms;
  if (data.jobDemand !== undefined) skill.jobDemand = data.jobDemand;
  if (data.trend) skill.trend = data.trend;
  if (data.status) skill.status = data.status;

  await skill.save();

  void recordAuditLog({
    action: 'SKILL_UPDATE',
    actorId: adminId,
    actorRole: 'admin',
    targetType: 'Skill',
    targetId: skillId,
    status: 'success',
  });

  return skill;
}

export async function reviewUnknownSkill(
  adminId: string,
  skillId: string,
  decision: { status: 'approved' | 'rejected'; category?: string; synonyms?: string[] },
) {
  const skill = await Skill.findById(skillId);
  if (!skill) throw ApiError.notFound('Skill not found');

  skill.status = decision.status;
  skill.isUnknown = false;
  skill.reviewedBy = adminId as any;
  skill.reviewedAt = new Date();
  if (decision.category) skill.category = decision.category;
  if (decision.synonyms) skill.synonyms = decision.synonyms;

  await skill.save();

  void recordAuditLog({
    action: 'SKILL_REVIEW',
    actorId: adminId,
    actorRole: 'admin',
    targetType: 'Skill',
    targetId: skillId,
    status: 'success',
    details: { decision: decision.status, name: skill.name },
  });

  return skill;
}

export async function deleteSkill(adminId: string, skillId: string) {
  const skill = await Skill.findById(skillId);
  if (!skill) throw ApiError.notFound('Skill not found');

  await Skill.deleteOne({ _id: skillId });

  void recordAuditLog({
    action: 'SKILL_DELETE',
    actorId: adminId,
    actorRole: 'admin',
    targetType: 'Skill',
    targetId: skillId,
    status: 'success',
    details: { name: skill.name },
  });

  return { message: 'Skill deleted successfully' };
}
