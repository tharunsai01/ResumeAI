import { MATCH } from "../matching/matchConfig.js";

// Role templates used for career paths and the role comparison.
// An item is a skill name, or an array meaning "any one of these".
export const ROLES = [
  {
    title: "Software Engineer",
    core: [["Java", "Python", "JavaScript", "TypeScript", "C++", "C#", "Go"], "Git", ["SQL", "MongoDB", "PostgreSQL", "MySQL"], "REST API"],
    extra: ["Docker", "Microservices", "AWS", "CI/CD"],
  },
  {
    title: "Full Stack Developer",
    core: [["React", "Angular", "Vue.js", "Next.js"], ["Node.js", "Express", "Spring Boot", "Django", "Flask", "FastAPI"], ["MongoDB", "SQL", "PostgreSQL", "MySQL"], "JavaScript", "REST API", "HTML", "CSS"],
    extra: ["TypeScript", "Docker", "Git", "AWS"],
  },
  {
    title: "Frontend Developer",
    core: ["JavaScript", "HTML", "CSS", ["React", "Angular", "Vue.js", "Next.js"]],
    extra: ["TypeScript", "Tailwind CSS", "Redux", "Git", "Figma"],
  },
  {
    title: "Backend Developer",
    core: [["Java", "Python", "Node.js", "Go", "C#"], ["Spring Boot", "Express", "Django", "Flask", "FastAPI", "NestJS", ".NET"], "REST API", ["SQL", "MongoDB", "PostgreSQL", "MySQL"]],
    extra: ["Docker", "Redis", "Microservices", "Git", "CI/CD"],
  },
  {
    title: "DevOps Engineer",
    core: ["Linux", "Docker", "Kubernetes", "CI/CD", ["AWS", "Azure", "Google Cloud"], "Git"],
    extra: ["Terraform", "Jenkins", "Ansible", "Bash", "Nginx"],
  },
  {
    title: "Cloud Engineer",
    core: [["AWS", "Azure", "Google Cloud"], "Linux", "Docker", "Kubernetes"],
    extra: ["Terraform", "CI/CD", "Bash", "Python"],
  },
  {
    title: "AI/ML Engineer",
    core: ["Python", "Machine Learning", ["TensorFlow", "PyTorch", "scikit-learn"], "Pandas", "NumPy"],
    extra: ["Deep Learning", "NLP", "LLMs", "Docker", "SQL"],
  },
];

const CORE_SHARE = 0.75;

// Best credit for one item: 1 = solid evidence, 0.5 = listed only, 0 = nothing.
function itemCredit(item, skills) {
  const options = Array.isArray(item) ? item : [item];
  let best = { credit: 0, name: options[0], score: 0 };
  for (const name of options) {
    const found = skills.get(name);
    if (!found) continue;
    const credit = found.score >= MATCH.matchedMinScore ? 1 : 0.5;
    if (credit > best.credit || (credit === best.credit && found.score > best.score)) {
      best = { credit, name, score: found.score };
    }
  }
  return best;
}

const mean = (items) => (items.length === 0 ? 0 : items.reduce((sum, x) => sum + x.credit, 0) / items.length);

/** skills: Map of skill name -> { score }. Returns every role, best fit first. */
export function rankRoles(skills) {
  return ROLES.map((role) => {
    const core = role.core.map((item) => itemCredit(item, skills));
    const extra = role.extra.map((item) => itemCredit(item, skills));
    const all = [...core, ...extra];
    return {
      title: role.title,
      readiness: Math.round(100 * (CORE_SHARE * mean(core) + (1 - CORE_SHARE) * mean(extra))),
      coreCoverage: Math.round(100 * mean(core)),
      strongSkills: all.filter((x) => x.credit === 1).sort((a, b) => b.score - a.score).map((x) => x.name),
      missingSkills: all.filter((x) => x.credit === 0).map((x) => x.name),
      core,
      extra,
    };
  }).sort((a, b) => b.readiness - a.readiness || a.title.localeCompare(b.title));
}

/** Every skill name a role template mentions (used for demand when no jobs are available). */
export function roleSkillNames(role) {
  return new Set([...role.core, ...role.extra].flat());
}