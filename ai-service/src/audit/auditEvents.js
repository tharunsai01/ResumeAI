import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { config } from "../config.js";
import { SEMANTIC } from "../semantic/semanticConfig.js";

// Audit events describe what the AI did. They never contain resume text, names, emails or locations.
// The backend stores them in its audit log.

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const SERVICE = { name: pkg.name, version: pkg.version };

export const AUDIT_TYPES = {
  RESUME_ANALYZED: "RESUME_ANALYZED",
  MATCH_SCORED: "MATCH_SCORED",
  SCREENING_RUN: "SCREENING_RUN",
  JOB_EXTRACTED: "JOB_EXTRACTED",
  INJECTION_DETECTED: "INJECTION_DETECTED",
  EVALUATION_RUN: "EVALUATION_RUN",
};

function makeEvent(type, summary, details, now) {
  return {
    id: randomUUID(),
    timestamp: (now ?? new Date()).toISOString(),
    type,
    service: SERVICE,
    summary,
    details,
  };
}

const rulesOf = (security) => [...new Set(security.findings.map((finding) => finding.rule))];

/** result: what analyzeResumeFile returned. options: { resumeRef, now } */
export function auditResumeAnalyzed(result, options = {}) {
  const { analysis, security, meta, file } = result;
  return makeEvent(
    AUDIT_TYPES.RESUME_ANALYZED,
    `Resume analysed: ${analysis.skills.length} skills found, security ${security.riskLevel}`,
    {
      resumeRef: options.resumeRef ?? null,
      fileHash: result.fileHash ?? null,
      fileType: file.type,
      pageCount: file.pageCount,
      wordCount: file.wordCount,
      securityRisk: security.riskLevel,
      securityRules: rulesOf(security),
      skillsFound: analysis.skills.length,
      unknownSkills: analysis.unknownSkills.length,
      model: meta.model,
      attempts: meta.attempts,
      durationMs: meta.ms,
    },
    options.now
  );
}

/** match: what scoreMatch returned. options: { resumeRef, now } */
export function auditMatchScored(match, options = {}) {
  const semanticUsed = match.semanticCosine !== null && match.semanticCosine !== undefined;
  return makeEvent(
    AUDIT_TYPES.MATCH_SCORED,
    `Match scored: ${match.overallMatch}% (${match.screeningStatus})`,
    {
      resumeRef: options.resumeRef ?? null,
      jobId: match.jobId,
      overallMatch: match.overallMatch,
      status: match.screeningStatus,
      meetsThreshold: match.meetsThreshold,
      weightsUsed: match.weightsUsed,
      semanticUsed,
      embeddingModel: semanticUsed ? SEMANTIC.model : null,
    },
    options.now
  );
}

/** ranked: what screenCandidates returned. options: { jobId, weights, threshold, now } */
export function auditScreeningRun(ranked, options = {}) {
  const count = (status) => ranked.filter((r) => r.screeningStatus === status).length;
  return makeEvent(
    AUDIT_TYPES.SCREENING_RUN,
    `Screening run: ${ranked.length} candidates, ${count("Strong Match")} strong matches`,
    {
      jobId: options.jobId ?? null,
      candidates: ranked.length,
      strongMatches: count("Strong Match"),
      potentialMatches: count("Potential Match"),
      lowMatches: count("Low Match"),
      topScore: ranked.length > 0 ? ranked[0].overallMatch : null,
      weights: options.weights ?? null,
      threshold: options.threshold ?? null,
    },
    options.now
  );
}

/** result: what extractJobFromText returned. options: { jobRef, now } */
export function auditJobExtracted(result, options = {}) {
  const { job, security, meta } = result;
  return makeEvent(
    AUDIT_TYPES.JOB_EXTRACTED,
    `Job description analysed: ${job.requiredSkills.length} required and ${job.preferredSkills.length} preferred skills`,
    {
      jobRef: options.jobRef ?? null,
      title: job.title,
      requiredSkills: job.requiredSkills.length,
      preferredSkills: job.preferredSkills.length,
      unknownSkills: job.unknownSkills,
      securityRisk: security.riskLevel,
      securityRules: rulesOf(security),
      model: meta.model,
      attempts: meta.attempts,
    },
    options.now
  );
}

/** Returns an event when a scan flagged something, otherwise null. options: { source, ref, now } */
export function auditInjectionDetected(security, options = {}) {
  if (security.riskLevel === "clean") return null;
  const source = options.source ?? "resume";
  return makeEvent(
    AUDIT_TYPES.INJECTION_DETECTED,
    `Possible prompt-injection attempt flagged in a ${source} (${security.riskLevel} risk)`,
    {
      source,
      ref: options.ref ?? null,
      securityRisk: security.riskLevel,
      securityRules: rulesOf(security),
      flaggedLines: security.findings.length,
      model: config.groq.model,
    },
    options.now
  );
}

/** result: what runEvaluation returned. options: { now } */
export function auditEvaluationRun(result, options = {}) {
    const { report, record } = result;
    return makeEvent(
      AUDIT_TYPES.EVALUATION_RUN,
      `Evaluation ${record.id} completed: ${record.components}`,
      {
        evaluationId: record.id,
        dataset: record.dataset,
        components: report.modelInfo.components,
        skillExtraction: record.metrics.skillExtraction ?? null,
        scoreStability: record.metrics.scoreStability ?? null,
        fairnessMaximumDifference: report.fairness?.maximumDifference ?? null,
        fairnessCasesToReview: report.fairness?.scoreDifferencesDetected ?? null,
        injectionScenariosTested: report.security?.attacksTested ?? null,
        injectionScenariosManipulated: report.security?.attacksManipulated ?? null,
        reviewFlags: report.reviewFlags.length,
        model: config.groq.model,
      },
      options.now
    );
  }