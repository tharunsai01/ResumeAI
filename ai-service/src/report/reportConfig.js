// Settings for the candidate-facing report, skill gap and recommendations.

// The skill categories the frontend's TypeScript types accept today.
// Our taxonomy also has "AI & Data"; until the frontend adds it, those skills are shown under "Programming".
// When the frontend adds "AI & Data", add it to this list and nothing else needs to change.
export const FRONTEND_CATEGORIES = ["Programming", "Frontend", "Backend", "Database", "Cloud & DevOps", "Tools"];
const FOLD_INTO = { "AI & Data": "Programming" };

export function toFrontendCategory(category) {
  if (!category) return null;
  if (FRONTEND_CATEGORIES.includes(category)) return category;
  return FOLD_INTO[category] ?? null;
}

// The resume-analysis page's type has no "Tools" category, so tools are shown under "Cloud & DevOps".
export function toResumePageCategory(category) {
  const mapped = toFrontendCategory(category);
  return mapped === "Tools" ? "Cloud & DevOps" : mapped;
}

export const REPORT = {
  // overall resume score = weighted mix of the four parts
  weights: { skills: 0.4, experience: 0.25, education: 0.15, projects: 0.2 },

  breadthTarget: 12, // this many recognised skills counts as full breadth
  depthSkills: 8, // the strongest N skills are averaged for depth
  depthCeiling: 80, // an average skill score of 80 counts as full depth
  yearsTarget: 3, // this many years counts as full experience
  maxSkillsShown: 14,

  strongLabelFrom: 80,
  solidLabelFrom: 60,
};

export const GAP = {
  maxGapSkills: 8, // recommended skills shown that are not on the resume
  targetCoverage: 90, // target shown on the role comparison chart
  careerPathsShown: 5,
  // job demand (% of jobs asking for a skill) -> target score
  targets: [
    { demandFrom: 50, target: 85 },
    { demandFrom: 30, target: 75 },
    { demandFrom: 0, target: 65 },
  ],
};