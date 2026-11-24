import { SEMANTIC } from "./semanticConfig.js";
import { embedTexts } from "./embedder.js";
import { resumeSemanticText, jobSemanticText } from "./semanticText.js";
import { normalizeJob } from "../matching/jobSchema.js";
import { scoreMatch } from "../matching/scoreMatch.js";

export function cosine(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA === 0 || normB === 0 ? 0 : dot / Math.sqrt(normA * normB);
}

/** Raw cosine -> 0-100 using the low/high calibration in semanticConfig. */
export function cosineToScore(value, { low, high } = SEMANTIC) {
  const scaled = (value - low) / (high - low);
  return Math.round(100 * Math.min(1, Math.max(0, scaled)));
}

let warned = false;
function warnOnce(err) {
  if (warned) return;
  warned = true;
  console.warn(`[semantic] embeddings unavailable, using rule-based similarity only: ${err?.message ?? err}`);
}

/**
 * Semantic similarity of many resumes to one job, using ONE embedding call.
 * Returns an array aligned with `candidates`: { cosine, score } or null when embeddings are unavailable.
 */
export async function semanticSimilarities(candidates, rawJob, options = {}) {
  if (candidates.length === 0) return [];
  const embed = options.embedder ?? embedTexts;
  try {
    const job = normalizeJob(rawJob);
    const texts = [jobSemanticText(job), ...candidates.map((c) => resumeSemanticText(c.analysis))];
    const vectors = await embed(texts);
    const [jobVector, ...resumeVectors] = vectors;
    return resumeVectors.map((vector) => {
      const value = cosine(vector, jobVector);
      return { cosine: Math.round(value * 1000) / 1000, score: cosineToScore(value) };
    });
  } catch (err) {
    warnOnce(err);
    return candidates.map(() => null);
  }
}

export async function semanticSimilarity(resume, rawJob, options = {}) {
  const [result] = await semanticSimilarities([resume], rawJob, options);
  return result;
}

/** scoreMatch plus the embedding model. Falls back to rule-based scoring if embeddings fail. */
export async function scoreMatchSemantic(resume, rawJob, options = {}) {
  const semantic = await semanticSimilarity(resume, rawJob, options);
  return scoreMatch(resume, rawJob, { ...options, semantic });
}

/** screenCandidates plus the embedding model. candidates: [{ id, analysis, text? }] */
export async function screenCandidatesSemantic(candidates, rawJob, options = {}) {
  const similarities = await semanticSimilarities(candidates, rawJob, options);
  return candidates
    .map((candidate, i) => ({ id: candidate.id, ...scoreMatch(candidate, rawJob, { ...options, semantic: similarities[i] }) }))
    .sort((a, b) => b.overallMatch - a.overallMatch || (b.skillMatch ?? 0) - (a.skillMatch ?? 0));
}