import { embedTexts } from "./embedder.js";
import { cosine, cosineToScore } from "./semanticScore.js";
import { resumeSemanticText, jobSemanticText } from "./semanticText.js";
import { normalizeJob } from "../matching/jobSchema.js";
import { toMatchJob } from "../matching/jobAdapters.js";

const CHUNK = 32;
let warned = false;

/**
 * Semantic similarity of ONE resume to MANY jobs (used for recommendations).
 * Returns an array aligned with `jobs`: { cosine, score } or null if embeddings are unavailable.
 */
export async function semanticSimilaritiesToJobs(resume, jobs, options = {}) {
  if (jobs.length === 0) return [];
  const embed = options.embedder ?? embedTexts;
  try {
    const jobTexts = jobs.map((job) => jobSemanticText(normalizeJob(toMatchJob(job))));
    const [resumeVector] = await embed([resumeSemanticText(resume.analysis)]);
    const results = [];
    for (let i = 0; i < jobTexts.length; i += CHUNK) {
      const vectors = await embed(jobTexts.slice(i, i + CHUNK));
      for (const vector of vectors) {
        const value = cosine(vector, resumeVector);
        results.push({ cosine: Math.round(value * 1000) / 1000, score: cosineToScore(value) });
      }
    }
    return results;
  } catch (err) {
    if (!warned) {
      warned = true;
      console.warn(`[semantic] embeddings unavailable, using rule-based similarity only: ${err?.message ?? err}`);
    }
    return jobs.map(() => null);
  }
}