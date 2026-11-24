import { parseResume } from "./parsing/parseResume.js";
import { cleanText } from "./parsing/cleanText.js";
import { scanForInjection } from "./security/injectionScan.js";
import { extractResume } from "./extraction/extractResume.js";
import { sha256 } from "./audit/hash.js";

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
export { semanticSimilaritiesToJobs } from "./semantic/semanticJobs.js";
export { fromBoardJob, toMatchJob } from "./matching/jobAdapters.js";
export { buildResumeReport } from "./report/resumeReport.js";
export { buildSkillGap } from "./skillgap/skillGap.js";
export { recommendJobs, recommendJobsSemantic } from "./recommend/recommendJobs.js";
export { extractJobFromText, buildJobFromFacts } from "./jobs/extractJob.js";
export { LlmError } from "./llm/jsonCall.js";
export { buildBlindProfile, pseudonym } from "./blind/blindProfile.js";
export { redactText } from "./blind/redact.js";
export { aggregateUnknownSkills } from "./skills/unknownSkills.js";
export { sha256 } from "./audit/hash.js";
export {
  AUDIT_TYPES,
  auditResumeAnalyzed,
  auditMatchScored,
  auditScreeningRun,
  auditJobExtracted,
  auditInjectionDetected,
  auditEvaluationRun,
} from "./audit/auditEvents.js";
export { analyzeResumeText } from "./evaluation/analyzeText.js";
export { runEvaluation, COMPONENTS as EVALUATION_COMPONENTS } from "./evaluation/runEvaluation.js";
export { skillExtractionMetrics, stabilityMetrics, fairnessMetrics, securityMetrics } from "./evaluation/metrics.js";
export { ATTACKS } from "./evaluation/attacks.js";
export { buildVariants } from "./evaluation/fairnessVariants.js";

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
    fileHash: sha256(buffer),
    security: processed.security,
    text: processed.text,
    analysis,
    meta,
  };
}