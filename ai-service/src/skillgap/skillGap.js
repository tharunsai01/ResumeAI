import { config } from "../config.js";
import { skillKey, normalizeSkill } from "../taxonomy/normalizeSkill.js";
import { normalizeJob } from "../matching/jobSchema.js";
import { toMatchJob } from "../matching/jobAdapters.js";
import { toFrontendCategory, FRONTEND_CATEGORIES, GAP } from "../report/reportConfig.js";
import { ROLES, rankRoles, roleSkillNames } from "./roles.js";
import { skillMeta, evidenceDescription, recommendationFor } from "./skillMeta.js";

function levelFor(score) {
  const { expert, advanced, intermediate } = config.levels;
  if (score >= expert) return "Expert";
  if (score >= advanced) return "Advanced";
  if (score >= intermediate) return "Intermediate";
  return "Beginner";
}

const targetFor = (demand) => GAP.targets.find((t) => demand >= t.demandFrom).target;

/** skill name -> % of jobs that ask for it (required or preferred). */
function demandFromJobs(jobs) {
  const counts = new Map();
  let used = 0;
  for (const raw of jobs) {
    let job;
    try {
      job = normalizeJob(toMatchJob(raw));
    } catch {
      continue; // a malformed job is skipped
    }
    if (job.required.length + job.preferred.length === 0) continue; // says nothing about skills
    used++;
    for (const name of new Set([...job.required, ...job.preferred].map((s) => s.name))) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return { demand: new Map([...counts].map(([name, count]) => [name, Math.round((100 * count) / used)])), used };
}

/** Fallback when no jobs are given: % of the role templates that mention a skill. */
function demandFromRoles() {
  const counts = new Map();
  for (const role of ROLES) {
    for (const name of roleSkillNames(role)) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return new Map([...counts].map(([name, count]) => [name, Math.round((100 * count) / ROLES.length)]));
}

const idFor = (name) => `s_${skillKey(name)}`;

function categoryScores(known) {
  return FRONTEND_CATEGORIES.map((category) => {
    const scores = known
      .filter((s) => toFrontendCategory(s.category) === category)
      .map((s) => s.score)
      .sort((a, b) => b - a)
      .slice(0, 3);
    const score = scores.length === 0 ? 0 : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const description =
      scores.length === 0
        ? "No evidence of skills here yet."
        : score >= 80
          ? "Strong foundation in this area."
          : score >= 60
            ? "Good working knowledge in this area."
            : score >= 40
              ? "Basic knowledge, worth deepening."
              : "Limited evidence so far.";
    return { category, score, description };
  });
}

/**
 * Builds the data for the Candidate "Skill Analysis" page (same shapes as the frontend's SkillData,
 * CareerPath, SkillRoleComparison and category scores). Pure function, no network.
 * options: { jobs } - the jobs to measure demand against (frontend board jobs or structured jobs)
 */
export function buildSkillGap(analysis, options = {}) {
  const jobs = Array.isArray(options.jobs) ? options.jobs : [];
  const maxGapSkills = options.maxGapSkills ?? GAP.maxGapSkills;

  const known = analysis.skills.filter((s) => s.known);
  const candidate = new Map(analysis.skills.map((s) => [s.name, s]));

  let demand;
  let demandSource = "roles";
  let jobsConsidered = 0;
  if (jobs.length > 0) {
    const fromJobs = demandFromJobs(jobs);
    if (fromJobs.used > 0) {
      demand = fromJobs.demand;
      demandSource = "jobs";
      jobsConsidered = fromJobs.used;
    }
  }
  if (!demand) demand = demandFromRoles();

  const roles = rankRoles(candidate);

  // ---- skills found on the resume ----
  const detected = known
    .filter((s) => s.score > 0)
    .map((s) => {
      const jobDemand = demand.get(s.name) ?? 0;
      const target = targetFor(jobDemand);
      const gap = target - s.score;
      const priority = gap <= 0 ? "Low" : jobDemand >= 30 && gap >= 20 ? "High" : gap >= 10 ? "Medium" : "Low";
      const meta = skillMeta(s.name, s.category);
      return {
        id: idFor(s.name),
        name: s.name,
        category: toFrontendCategory(s.category),
        currentScore: s.score,
        targetScore: Math.max(s.score, target),
        level: levelFor(s.score),
        priority,
        jobDemand,
        description: evidenceDescription(s.evidence),
        recommendation: recommendationFor({ name: s.name, detected: true, score: s.score, target }),
        difficulty: meta.difficulty,
        estimatedEffort: gap <= 0 ? "Ongoing" : meta.effort,
        isDetected: true,
      };
    });

  // ---- skills the candidate lacks that their closest roles ask for ----
  const relevance = new Map();
  for (const role of roles.slice(0, 3)) {
    for (const item of role.core) if (item.credit === 0) relevance.set(item.name, (relevance.get(item.name) ?? 0) + 1);
    for (const item of role.extra) if (item.credit === 0) relevance.set(item.name, (relevance.get(item.name) ?? 0) + 0.5);
  }
  const gaps = [...relevance.entries()]
    .map(([name, weight]) => ({ name, weight, jobDemand: demand.get(name) ?? 0, skill: normalizeSkill(name) }))
    .filter((g) => g.skill?.known && toFrontendCategory(g.skill.category))
    .sort((a, b) => b.jobDemand - a.jobDemand || b.weight - a.weight || a.name.localeCompare(b.name))
    .slice(0, maxGapSkills)
    .map(({ name, jobDemand, skill }) => {
      const target = targetFor(jobDemand);
      const meta = skillMeta(name, skill.category);
      return {
        id: idFor(name),
        name,
        category: toFrontendCategory(skill.category),
        currentScore: 0,
        targetScore: target,
        level: "Beginner",
        priority: jobDemand >= 30 ? "High" : jobDemand >= 15 ? "Medium" : "Low",
        jobDemand,
        description: meta.about,
        recommendation: recommendationFor({ name, detected: false, score: 0, target }),
        difficulty: meta.difficulty,
        estimatedEffort: meta.effort,
        isDetected: false,
      };
    });

  return {
    skills: [...detected, ...gaps],
    careerPaths: roles.slice(0, GAP.careerPathsShown).map((r) => ({
      title: r.title,
      readinessScore: r.readiness,
      strongSkills: r.strongSkills.slice(0, 4),
      missingSkills: r.missingSkills.slice(0, 3),
    })),
    roleComparisons: roles.slice(0, GAP.careerPathsShown).map((r) => ({
      role: r.title,
      userCoverage: r.coreCoverage,
      targetCoverage: GAP.targetCoverage,
      missingSkills: r.missingSkills.slice(0, 3),
    })),
    categoryScores: categoryScores(known),
    demandSource,
    jobsConsidered,
  };
}