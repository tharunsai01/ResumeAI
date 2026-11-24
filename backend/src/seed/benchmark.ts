/**
 * Synthetic fairness benchmark. Profiles are generated in matched pairs whose
 * job-relevant attributes are identical; only the evaluation group label and
 * identity-signalling summary text differ. A fair scorer gives both members of
 * each pair the same score. No real people are represented.
 */
const SKILL_SETS = [
  ['Python', 'Django', 'PostgreSQL', 'Docker', 'REST APIs'],
  ['Python', 'FastAPI', 'MongoDB', 'AWS'],
  ['Java', 'Spring Boot', 'MySQL', 'Kubernetes'],
  ['Node.js', 'Express', 'MongoDB', 'TypeScript', 'Docker'],
  ['Python', 'Flask', 'SQL'],
  ['Go', 'gRPC', 'PostgreSQL', 'Kubernetes', 'Terraform'],
  ['Python', 'Django', 'Redis', 'Celery', 'PostgreSQL', 'CI/CD'],
  ['PHP', 'Laravel', 'MySQL'],
  ['Ruby', 'Ruby on Rails', 'PostgreSQL', 'Redis'],
  ['Python', 'Pandas', 'SQL', 'Machine Learning'],
];
const TITLES = ['Backend Engineer', 'Software Engineer', 'Python Developer', 'Full-Stack Developer', 'Data Engineer', 'Platform Engineer'];
const SUMMARIES: [string, string][] = [
  ['He has led backend teams and mentors juniors.', 'She has led backend teams and mentors juniors.'],
  ['Father of two, enjoys hiking.', 'Mother of two, enjoys hiking.'],
  ['Mohammed is passionate about APIs.', 'Emily is passionate about APIs.'],
  ['Member of a veterans network.', 'Member of a women in tech network.'],
];

export const BENCHMARK_JOB = {
  id: 'benchmark-backend',
  title: 'Senior Backend Engineer',
  description: 'Design and build scalable Python services and REST APIs backed by PostgreSQL. Deploy with Docker on AWS.',
  required_skills: ['Python', 'Django', 'PostgreSQL', 'REST APIs'],
  preferred_skills: ['Docker', 'AWS', 'Redis'],
  min_experience_years: 4,
  education_level: 3,
  education_required: false,
};

export function benchmarkCandidates() {
  const out = [];
  for (let i = 0; i < 40; i++) {
    const skills = SKILL_SETS[i % SKILL_SETS.length];
    const pair = SUMMARIES[i % SUMMARIES.length];
    const base = {
      headline: TITLES[i % TITLES.length],
      job_titles: [TITLES[(i + 1) % TITLES.length]],
      skills,
      total_experience_years: (i * 7) % 11,
      highest_education_level: [2, 3, 3, 4, 0][i % 5],
    };
    out.push({ ...base, id: `bench-${i}-a`, group: 'Group A', summary: pair[0] });
    out.push({ ...base, id: `bench-${i}-b`, group: 'Group B', summary: pair[1] });
  }
  return out;
}
