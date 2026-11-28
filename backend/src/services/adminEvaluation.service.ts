import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

const cases = [
  {
    id: 'backend-engineer',
    name: 'Morgan Example',
    role: 'Backend Engineer',
    experience: '2–4 years',
    text: 'Backend Engineer at Example Software, 2022 to 2025. Built Python and FastAPI services backed by PostgreSQL and deployed them with Docker.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
  },
  {
    id: 'frontend-intern',
    name: 'Taylor Example',
    role: 'Frontend Intern',
    experience: 'Fresher',
    text: 'Academic project from 2025. Built a dashboard with React and TypeScript, styled it with CSS and tested components with Jest.',
    skills: ['React', 'TypeScript', 'CSS', 'Jest'],
  },
  {
    id: 'data-engineer',
    name: 'Jordan Example',
    role: 'Data Engineer',
    experience: '5–7 years',
    text: 'Data Engineer at Example Analytics, 2019 to 2025. Maintained Python and SQL pipelines on AWS with Apache Spark.',
    skills: ['Python', 'SQL', 'AWS', 'Apache Spark'],
  },
];

const dataset = {
  resumes: cases.map(item => ({ id: item.id, text: [item.name, item.role, item.text].join('\n') })),
  jobs: cases.map(item => ({ title: item.role, requiredSkills: item.skills, experience: item.experience })),
  truth: { resumes: cases.map(item => ({ id: item.id, skills: item.skills })) },
  options: {
    datasetName: 'Synthetic hiring benchmark v2',
    components: ['skills', 'stability', 'fairness'],
    stabilityRuns: 2,
    fairnessResumes: 2,
    variantIds: ['gender-coded-names'],
  },
};

async function requestEvaluation(path: string, body?: typeof dataset) {
  const base = env.AI_SERVICE_URL?.trim().replace(/\/+$/, '').replace(/\/v1$/, '');
  if (!base || !env.AI_SERVICE_KEY) throw new ApiError(503, 'The AI evaluation service is not configured.');
  let response: Response;
  try {
    response = await fetch(`${base}/v1/evaluation/${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', 'x-internal-key': env.AI_SERVICE_KEY },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new ApiError(502, 'The AI evaluation service is unreachable.');
  }
  if (response.status === 409) throw new ApiError(409, 'An evaluation is already running.');
  if (!response.ok) throw new ApiError(502, 'The AI evaluation service could not fulfill this request.');
  return response.json();
}

export function getLatestAiEvaluation() {
  return requestEvaluation('latest');
}

export function startAiEvaluation() {
  return requestEvaluation('run', dataset);
}
