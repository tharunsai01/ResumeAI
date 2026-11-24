import { REPORT, toResumePageCategory } from "./reportConfig.js";
import { effectiveYears } from "../matching/scoreMatch.js";
import { educationScore, candidateEducationLevel } from "../matching/parsers.js";
import { rankRoles } from "../skillgap/roles.js";

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const average = (numbers) => (numbers.length === 0 ? 0 : numbers.reduce((a, b) => a + b, 0) / numbers.length);

const yearsText = (years) => (years === 0 ? "Fresher" : `${years} ${years === 1 ? "Year" : "Years"}`);
const joinNames = (names) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

// ---------- the four parts of the score (each 0-100) ----------

function skillsPart(known) {
  if (known.length === 0) return 0;
  const breadth = clamp01(known.length / REPORT.breadthTarget);
  const top = known.slice(0, REPORT.depthSkills);
  const depth = clamp01(average(top.map((s) => s.score)) / REPORT.depthCeiling);
  return Math.round(100 * (0.5 * breadth + 0.5 * depth));
}

function experiencePart(roles, years) {
  if (roles.length === 0 && years === 0) return 0;
  const yearsShare = clamp01(years / REPORT.yearsTarget);
  const detailed = roles.length ? roles.filter((r) => r.description.length >= 2).length / roles.length : 0;
  const quantified = roles.length ? roles.filter((r) => r.description.some((b) => /\d/.test(b))).length / roles.length : 0;
  return Math.round(100 * (0.6 * yearsShare + 0.25 * detailed + 0.15 * quantified));
}

function educationPart(degrees) {
  return educationScore("Bachelor's degree in Computer Science or a related field", degrees) ?? 0;
}

function projectsPart(projects) {
  if (projects.length === 0) return 0;
  const count = clamp01(projects.length / 3);
  const described = projects.filter((p) => p.description.length >= 20).length / projects.length;
  const depth = clamp01(average(projects.map((p) => p.techStack.length)) / 3);
  return Math.round(100 * (0.5 * count + 0.25 * described + 0.25 * depth));
}

// ---------- insights: plain templates over facts we computed, nothing generated ----------

function buildInsights({ analysis, known, breakdown, years, score, roles }) {
  const strengths = [];
  const improvements = [];

  const strong = known.filter((s) => s.score >= 70).slice(0, 3);
  if (strong.length > 0) strengths.push(`Strong ${joinNames(strong.map((s) => s.name))} skills`);

  const solidCategories = new Set(known.filter((s) => s.score >= 50 && s.category).map((s) => toResumePageCategory(s.category)));
  if (solidCategories.size >= 3) strengths.push(`Good range across ${joinNames([...solidCategories].slice(0, 4))}`);

  if (analysis.projects.length >= 2) strengths.push(`Relevant project experience (${analysis.projects.length} projects)`);
  if (years >= 1) strengths.push(`${years} ${years === 1 ? "year" : "years"} of hands-on experience`);
  else if (analysis.experience.length > 0) strengths.push("Work or internship experience listed");
  if (breakdown.education >= 85) strengths.push("Relevant technical education");

  const quantified = analysis.experience.length
    ? analysis.experience.filter((r) => r.description.some((b) => /\d/.test(b))).length / analysis.experience.length
    : 1;
  if (analysis.experience.length > 0 && quantified < 0.5) {
    improvements.push("Add measurable achievements (numbers, percentages, scale)");
  }

  const listedOnly = known.filter(
    (s) => s.score <= 40 && s.evidence.inSkillsSection && s.evidence.experienceRoles === 0 && s.evidence.projects === 0
  );
  if (listedOnly.length >= 3) {
    improvements.push(`Show real use of ${joinNames(listedOnly.slice(0, 3).map((s) => s.name))} (they are only listed)`);
  }

  for (const category of ["Cloud & DevOps", "Database", "Backend", "Frontend"]) {
    const best = Math.max(0, ...known.filter((s) => toResumePageCategory(s.category) === category).map((s) => s.score));
    if (best < 50) {
      improvements.push(`Build and show experience in ${category}`);
      break;
    }
  }

  if (analysis.projects.length === 0) improvements.push("Add projects that show hands-on work");
  else if (analysis.projects.some((p) => p.description.length < 20)) improvements.push("Describe what each project does and your role in it");

  if (analysis.experience.some((r) => r.description.length < 2)) improvements.push("Describe responsibilities and results for every role");
  if (analysis.education.length === 0) improvements.push("Add your education details");
  if (!analysis.candidate.email) improvements.push("Add a contact email");
  if (improvements.length === 0) improvements.push("Keep your resume updated with your latest work");

  const label = score >= REPORT.strongLabelFrom ? "a strong" : score >= REPORT.solidLabelFrom ? "a solid" : "a developing";
  const name = analysis.candidate.name || "The candidate";
  const experienceText = years > 0 ? `${years} ${years === 1 ? "year" : "years"} of experience` : "early-career experience";
  const focus = strong.length > 0 ? ` in ${joinNames(strong.map((s) => s.name))}` : "";
  const fit = roles.filter((r) => r.readiness >= 50).slice(0, 2);
  const fitText = fit.length > 0 ? ` Their profile is best aligned with ${joinNames(fit.map((r) => r.title))} roles.` : "";

  return {
    strengths: strengths.slice(0, 5),
    improvements: improvements.slice(0, 5),
    summary: `${name} is ${label} candidate with ${experienceText}${focus}.${fitText} Key next step: ${improvements[0].charAt(0).toLowerCase()}${improvements[0].slice(1)}.`,
  };
}

/**
 * Builds the object the Candidate "Resume Analysis" page shows (same shape as the frontend's
 * ResumeAnalysisResult) from the analysis produced in Phase 2. Pure function, no network.
 */
export function buildResumeReport(analysis) {
  const known = analysis.skills.filter((s) => s.known);
  const years = effectiveYears(analysis.experienceYears);
  const degrees = analysis.education.map((e) => e.degree).filter(Boolean);

  const breakdown = {
    skills: skillsPart(known),
    experience: experiencePart(analysis.experience, years),
    education: educationPart(degrees),
    projects: projectsPart(analysis.projects),
  };
  const w = REPORT.weights;
  const score = Math.round(
    w.skills * breakdown.skills + w.experience * breakdown.experience + w.education * breakdown.education + w.projects * breakdown.projects
  );

  const skillMap = new Map(analysis.skills.map((s) => [s.name, s]));
  const roles = rankRoles(skillMap);

  const topDegree = [...degrees].sort((a, b) => candidateEducationLevel([b]) - candidateEducationLevel([a]))[0] ?? "";

  return {
    score,
    breakdown,
    personalInfo: {
      name: analysis.candidate.name,
      email: analysis.candidate.email,
      experience: yearsText(years),
      education: topDegree,
      location: analysis.candidate.location,
    },
    skills: known.slice(0, REPORT.maxSkillsShown).map((s) => ({
      name: s.name,
      score: s.score,
      category: toResumePageCategory(s.category),
    })),
    experience: analysis.experience.map((role) => ({
      title: role.title,
      company: role.company,
      duration: role.duration,
      description: role.description,
    })),
    education: analysis.education,
    projects: analysis.projects,
    insights: buildInsights({ analysis, known, breakdown, years, score, roles }),
    otherSkills: analysis.unknownSkills, // skills outside our taxonomy, shown for completeness
  };
}