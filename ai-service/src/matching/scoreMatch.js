import { normalizeJob } from "./jobSchema.js";
import { AI_SCREENING_THRESHOLD, POTENTIAL_MATCH_MIN, DEFAULT_WEIGHTS, MATCH } from "./matchConfig.js";
import { experienceScore, parseExperienceRange, educationScore, requiredEducationLevel } from "./parsers.js";
import { roleSimilarity, keywordMatch } from "./similarity.js";
import { SEMANTIC } from "../semantic/semanticConfig.js";

// Scoring reads only skills, years, degree text and role titles.
// It never reads name, email, location, company or institution.

const WEIGHT_KEYS = Object.keys(DEFAULT_WEIGHTS);
const CREDIT = { Matched: 1, Partial: MATCH.partialCredit, Missing: 0 };

/** Recruiter weights -> valid weights. Bad or missing values fall back to the defaults. */
export function resolveWeights(input = {}) {
  const weights = {};
  for (const key of WEIGHT_KEYS) {
    const value = Number(input?.[key]);
    weights[key] = Number.isFinite(value) && value >= 0 ? value : DEFAULT_WEIGHTS[key];
  }
  return weights.skills + weights.experience + weights.education + weights.roleSimilarity > 0
    ? weights
    : { ...DEFAULT_WEIGHTS };
}

/** Years to use: the lower of "stated" and "computed from dates", so inflated claims do not help. */
export function effectiveYears({ stated, computed }) {
  if (computed > 0 && stated != null) return Math.min(stated, computed);
  if (computed > 0) return computed;
  return stated ?? 0;
}

const proficiencyOf = (level) =>
  level === "Expert" || level === "Advanced" ? "Strong" : level === "Intermediate" ? "Intermediate" : "Basic";

function matchSkills(wanted, candidateSkills, required) {
  return wanted.map((skill) => {
    const found = candidateSkills.get(skill.name);
    let matchType = "Missing";
    if (found) matchType = found.score >= MATCH.matchedMinScore ? "Matched" : "Partial";
    return {
      name: skill.name,
      proficiency: found ? proficiencyOf(found.level) : "None",
      matchType,
      required,
    };
  });
}

function coverage(entries) {
  if (entries.length === 0) return null;
  return entries.reduce((sum, e) => sum + CREDIT[e.matchType], 0) / entries.length;
}

function skillScore(requiredEntries, preferredEntries) {
  const req = coverage(requiredEntries);
  const pref = coverage(preferredEntries);
  if (req === null && pref === null) return null;
  if (pref === null) return Math.round(100 * req);
  if (req === null) return Math.round(100 * pref);
  return Math.round(100 * (MATCH.requiredShare * req + (1 - MATCH.requiredShare) * pref));
}

const names = (entries) => entries.map((e) => e.name);
const list = (items) => items.join(", ");
const yearsLabel = (y) => (y === 0 ? "Fresher" : `${y} ${y === 1 ? "year" : "years"}`);
const rangeLabel = (r) => (r.max === null ? `${r.min}+ years` : `${r.min}–${r.max} years`);

function explain({ job, years, range, reqEntries, prefEntries, education, unverified }) {
  const strengths = [];
  const gaps = [];

  const matchedReq = reqEntries.filter((e) => e.matchType === "Matched");
  const partialReq = reqEntries.filter((e) => e.matchType === "Partial");
  const missingReq = reqEntries.filter((e) => e.matchType === "Missing");
  const matchedPref = prefEntries.filter((e) => e.matchType === "Matched");
  const missingPref = prefEntries.filter((e) => e.matchType === "Missing");

  if (matchedReq.length > 0) {
    strengths.push(`Shows evidence of required skills: ${list(names(matchedReq))}`);
  }
  const strong = matchedReq.filter((e) => e.proficiency === "Strong");
  if (strong.length > 0) strengths.push(`Strong in ${list(names(strong))}`);
  if (matchedPref.length > 0) strengths.push(`Also has preferred skills: ${list(names(matchedPref))}`);

  if (range) {
    if (years >= range.min && (range.max === null || years <= range.max)) {
      strengths.push(`Experience (${yearsLabel(years)}) fits the ${rangeLabel(range)} requirement`);
    } else if (years < range.min) {
      gaps.push(`Falls short of the ${rangeLabel(range)} requirement (has ${yearsLabel(years)})`);
    } else {
      gaps.push(`Has more experience (${yearsLabel(years)}) than the ${rangeLabel(range)} asked for`);
    }
  }
  if (unverified) gaps.push("Experience is stated but not backed by dated roles");

  if (education !== null) {
    if (education >= 90) strengths.push("Meets the education requirement");
    else if (education >= 60) gaps.push("Education only partly matches the requirement");
    else gaps.push("Education does not match the requirement");
  }

  if (missingReq.length > 0) gaps.push(`Missing required skills: ${list(names(missingReq))}`);
  if (partialReq.length > 0) gaps.push(`Listed but no evidence of use: ${list(names(partialReq))}`);
  if (missingPref.length > 0) gaps.push(`No sign of preferred skills: ${list(names(missingPref))}`);

  return {
    matchedStrengths: strengths.slice(0, MATCH.maxListItems),
    potentialGaps: gaps.slice(0, MATCH.maxListItems),
  };
}

/**
 * Scores one resume against one job.
 * resume:  { analysis, text? }  (analysis comes from analyzeResumeFile; text improves keywordMatch)
 * rawJob:  { id, title, requiredSkills, preferredSkills, experience, education }
 * options: { weights, threshold, semantic }
 *   semantic: { cosine, score } from the embedding model (see semanticScore.js); optional
 */
export function scoreMatch(resume, rawJob, options = {}) {
  const { analysis, text = "" } = resume;
  const job = normalizeJob(rawJob);
  const threshold = options.threshold ?? AI_SCREENING_THRESHOLD;
  const weights = resolveWeights(options.weights);

  const candidateSkills = new Map(analysis.skills.map((s) => [s.name, s]));
  const reqEntries = matchSkills(job.required, candidateSkills, true);
  const prefEntries = matchSkills(job.preferred, candidateSkills, false);

  const years = effectiveYears(analysis.experienceYears);
  const range = parseExperienceRange(job.experience);
  const degrees = analysis.education.map((e) => e.degree).filter(Boolean);

  // Role similarity = rule-based score, blended with the embedding score when we have one.
  const ruleBased = roleSimilarity(analysis, job, MATCH.matchedMinScore);
  const semantic = options.semantic ?? null;
  const blend = options.semanticBlend ?? SEMANTIC.blend;
  let roleScore = ruleBased;
  if (semantic) {
    roleScore =
      ruleBased === null ? semantic.score : Math.round(blend * semantic.score + (1 - blend) * ruleBased);
  }

  const components = {
    skills: skillScore(reqEntries, prefEntries),
    experience: experienceScore(years, range),
    education: educationScore(job.education, degrees),
    roleSimilarity: roleScore,
  };

  // Components the job gives no information about are skipped and the other weights are rescaled.
  const available = WEIGHT_KEYS.filter((key) => components[key] !== null);
  let used = Object.fromEntries(available.map((key) => [key, weights[key]]));
  if (Object.values(used).reduce((a, b) => a + b, 0) === 0) {
    used = Object.fromEntries(available.map((key) => [key, 1]));
  }
  const totalWeight = Object.values(used).reduce((a, b) => a + b, 0);
  const overallMatch =
    totalWeight > 0
      ? Math.round(available.reduce((sum, key) => sum + used[key] * components[key], 0) / totalWeight)
      : 0;

  const unverified = analysis.experienceYears.computed === 0 && (analysis.experienceYears.stated ?? 0) > 0;
  const { matchedStrengths, potentialGaps } = explain({
    job,
    years,
    range,
    reqEntries,
    prefEntries,
    education: components.education,
    unverified,
  });
  if (requiredEducationLevel(job.education) !== null && analysis.education.length === 0) {
    potentialGaps.unshift("No education details found on the resume");
  }

  const screeningStatus =
    overallMatch >= threshold ? "Strong Match" : overallMatch >= POTENTIAL_MATCH_MIN ? "Potential Match" : "Low Match";

  return {
    jobId: job.id,
    jobTitle: job.title,
    overallMatch,
    skillMatch: components.skills,
    experienceMatch: components.experience,
    educationMatch: components.education,
    roleSimilarity: components.roleSimilarity,
    keywordMatch: keywordMatch(text, analysis.skills, [...job.required, ...job.preferred]),
    semanticCosine: semantic ? semantic.cosine : null,
    screeningStatus,
    meetsThreshold: overallMatch >= threshold,
    experience: yearsLabel(years),
    skills: [...reqEntries, ...prefEntries],
    matchedStrengths,
    potentialGaps,
    weightsUsed: Object.fromEntries(
      available.map((key) => [key, Math.round((1000 * used[key]) / totalWeight) / 1000])
    ),
  };
}

/** Scores many candidates against one job, best first. candidates: [{ id, analysis, text? }] */
export function screenCandidates(candidates, rawJob, options = {}) {
  return candidates
    .map((candidate) => ({ id: candidate.id, ...scoreMatch(candidate, rawJob, options) }))
    .sort((a, b) => b.overallMatch - a.overallMatch || (b.skillMatch ?? 0) - (a.skillMatch ?? 0));
}