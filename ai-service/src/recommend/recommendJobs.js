import { scoreMatch } from "../matching/scoreMatch.js";
import { toMatchJob } from "../matching/jobAdapters.js";
import { semanticSimilaritiesToJobs } from "../semantic/semanticJobs.js";

const DEFAULTS = { limit: 10, minScore: 40 };

function shape(job, result) {
  const names = (matchType) => result.skills.filter((s) => s.matchType === matchType).map((s) => s.name);
  return {
    jobId: job.id ?? result.jobId,
    jobTitle: result.jobTitle,
    match: result.overallMatch,
    screeningStatus: result.screeningStatus,
    matchedSkills: names("Matched"),
    partialSkills: names("Partial"),
    missingSkills: names("Missing"),
    reasons: result.matchedStrengths.slice(0, 2),
    gaps: result.potentialGaps.slice(0, 2),
  };
}

function rank(scored, options) {
      // `??` so that an option passed as undefined (for example from an API body) keeps its default
  const limit = options.limit ?? DEFAULTS.limit;
  const minScore = options.minScore ?? DEFAULTS.minScore;
  return scored
    .filter(({ result }) => result.overallMatch >= minScore)
    .sort((a, b) => b.result.overallMatch - a.result.overallMatch || (b.result.skillMatch ?? 0) - (a.result.skillMatch ?? 0))
    .slice(0, limit)
    .map(({ job, result }) => shape(job, result));
}

/**
 * Best jobs for one candidate, using the rule-based scores.
 * resume: { analysis, text? }   jobs: frontend board jobs or structured jobs
 * options: { limit, minScore, weights, threshold }
 */
export function recommendJobs(resume, jobs, options = {}) {
  const scored = jobs.map((job) => ({
    job,
    result: scoreMatch(resume, toMatchJob(job), { weights: options.weights, threshold: options.threshold }),
  }));
  return rank(scored, options);
}

/** Same, but with the embedding model blended in. Falls back to rule-based if the model is unavailable. */
export async function recommendJobsSemantic(resume, jobs, options = {}) {
  const similarities = await semanticSimilaritiesToJobs(resume, jobs, options);
  const scored = jobs.map((job, i) => ({
    job,
    result: scoreMatch(resume, toMatchJob(job), {
      weights: options.weights,
      threshold: options.threshold,
      semantic: similarities[i],
    }),
  }));
  return rank(scored, options);
}