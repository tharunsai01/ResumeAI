import { parseResume } from "./parsing/parseResume.js";
import { cleanText } from "./parsing/cleanText.js";
import { scanForInjection } from "./security/injectionScan.js";
import { extractResume } from "./extraction/extractResume.js";

export { ResumeParseError, MAX_FILE_BYTES } from "./parsing/parseResume.js";
export { extractResume, buildAnalysis, ExtractionError } from "./extraction/extractResume.js";
export { normalizeSkill } from "./taxonomy/normalizeSkill.js";
export { scoreMatch, screenCandidates, resolveWeights } from "./matching/scoreMatch.js";
export { MatchError } from "./matching/jobSchema.js";
export { AI_SCREENING_THRESHOLD, DEFAULT_WEIGHTS } from "./matching/matchConfig.js";
export {
  semanticSimilarity,
  semanticSimilarities,
  scoreMatchSemantic,
  screenCandidatesSemantic,
  cosine,
} from "./semantic/semanticScore.js";

/**
 * Phase 1 pipeline: file -> parsed text -> cleaned -> security-scanned.
 * `text` is the sanitised text that is safe to hand to the LLM.
 */
export async function processResumeFile(buffer, filename, options = {}) {
  const parsed = await parseResume(buffer, filename, options);
  const { text: cleaned, invisibleCount } = cleanText(parsed.text);
  const scan = scanForInjection(cleaned, { invisibleCount });

  return {
    fileType: parsed.fileType,
    pageCount: parsed.pageCount,
    wordCount: scan.sanitizedText.split(/\s+/).filter(Boolean).length,
    text: scan.sanitizedText,
    security: {
      riskLevel: scan.riskLevel,
      findings: scan.findings,
      invisibleCount,
    },
  };
}

/**
 * Phase 2 pipeline: resume file -> safe text -> LLM facts -> skills + scores.
 * Run this once per resume and keep the result; score it against any number of jobs
 * with scoreMatch({ analysis, text }, job).
 * options: { allowTxt, client, now } (client/now are for tests).
 */
export async function analyzeResumeFile(buffer, filename, options = {}) {
  const processed = await processResumeFile(buffer, filename, options);
  const { analysis, meta } = await extractResume(processed.text, options);

  return {
    file: {
      type: processed.fileType,
      pageCount: processed.pageCount,
      wordCount: processed.wordCount,
    },
    security: processed.security,
    text: processed.text,
    analysis,
    meta,
  };
}