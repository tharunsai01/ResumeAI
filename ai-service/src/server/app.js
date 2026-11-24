import express from "express";
import multer from "multer";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import { config } from "../config.js";
import { SEMANTIC } from "../semantic/semanticConfig.js";
import { CATEGORIES, SKILLS } from "../taxonomy/skillTaxonomy.js";
import { normalizeJob } from "../matching/jobSchema.js";
import { createPacedAnalyzer } from "../evaluation/pacedAnalyzer.js";
import {
  MAX_FILE_BYTES,
  analyzeResumeFile,
  analyzeResumeText,
  buildResumeReport,
  buildSkillGap,
  scoreMatch,
  screenCandidates,
  screenCandidatesSemantic,
  semanticSimilarity,
  recommendJobs,
  recommendJobsSemantic,
  toMatchJob,
  extractJobFromText,
  buildBlindProfile,
  aggregateUnknownSkills,
  runEvaluation,
  sha256,
  auditResumeAnalyzed,
  auditMatchScored,
  auditScreeningRun,
  auditJobExtracted,
  auditInjectionDetected,
  auditEvaluationRun,
} from "../index.js";
import { serverConfig } from "./serverConfig.js";
import { createLimiter } from "./limiter.js";
import { createRunStore } from "./evaluationRuns.js";
import { ApiError, describeError } from "./errors.js";
import * as S from "./schemas.js";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
const SERVICE = { name: pkg.name, version: pkg.version ?? "unknown" };

// Express 5 forwards rejected promises to the error handler; this keeps the same behaviour explicit.
const route = (handler) => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);

function requireKey(apiKey) {
  const expected = Buffer.from(apiKey);
  return (req, res, next) => {
    const given = Buffer.from(String(req.get("x-internal-key") ?? ""));
    const ok = given.length === expected.length && timingSafeEqual(given, expected);
    if (!ok) return next(new ApiError(401, "UNAUTHORIZED", "A valid x-internal-key header is required."));
    next();
  };
}

function requestContext(logger) {
  return (req, res, next) => {
    const incoming = req.get("x-request-id");
    req.requestId = incoming && /^[\w.-]{1,64}$/.test(incoming) ? incoming : randomUUID();
    res.set("x-request-id", req.requestId);
    const started = Date.now();
    // Only the method, path, status and time are logged. Never bodies: they contain resumes.
    res.on("finish", () => {
      logger.info(`${req.method} ${req.originalUrl.split("?")[0]} ${res.statusCode} ${Date.now() - started}ms id=${req.requestId}`);
    });
    next();
  };
}

/**
 * Builds the Express app. `deps` exists so tests can inject a fake model, embedder, clock and logger:
 *   { apiKey, client, embedder, now, limiter, logger, runs, embeddingState, allowTxt, evalPaceMs }
 */
export function createApp(deps = {}) {
  const apiKey = deps.apiKey ?? serverConfig.apiKey;
  if (!apiKey || apiKey.length < 16) {
    throw new Error("AI_SERVICE_KEY must be set to a secret of at least 16 characters. Create one with: openssl rand -hex 24");
  }
  const logger = deps.logger ?? { info: (m) => console.log(m), error: (m) => console.error(m) };
  const limiter = deps.limiter ?? createLimiter({ maxConcurrent: serverConfig.maxConcurrentLlm, maxQueue: serverConfig.maxQueue });
  const runs = deps.runs ?? createRunStore();
  const embeddingState = deps.embeddingState ?? { value: "not-started" };
  const allowTxt = deps.allowTxt ?? serverConfig.allowTxtUploads;
  const evalPaceMs = deps.evalPaceMs ?? serverConfig.evalPaceMs;
  const nowDate = () => (deps.now ? deps.now() : new Date());
  const llmOptions = () => ({ client: deps.client, now: nowDate() });

  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_BYTES, files: 1 } });

  const resumeResponse = (result, resumeRef) => {
    const now = nowDate();
    const auditEvents = [
      auditResumeAnalyzed(result, { resumeRef, now }),
      auditInjectionDetected(result.security, { source: "resume", ref: resumeRef, now }),
    ].filter(Boolean);
    return { ...result, report: buildResumeReport(result.analysis), auditEvents };
  };

  const app = express();
  app.disable("x-powered-by");
  app.use(requestContext(logger));

  // Open so Docker/Kubernetes can probe it. It says nothing about the data or the configuration.
  app.get("/health", (req, res) => res.json({ status: "ok", service: SERVICE.name, version: SERVICE.version }));

  const v1 = express.Router();
  v1.use(requireKey(apiKey));
  v1.use(express.json({ limit: "10mb" }));

  v1.get("/status", (req, res) => {
    res.json({
      service: SERVICE.name,
      version: SERVICE.version,
      llm: { configured: Boolean(config.groq.apiKey) || Boolean(deps.client), model: config.groq.model },
      embeddings: { model: SEMANTIC.model, state: embeddingState.value },
      queue: limiter.stats,
      evaluationRunning: runs.running,
    });
  });

  // ---- resumes ----
  v1.post(
    "/resume/analyze",
    upload.single("file"),
    route(async (req, res) => {
      if (!req.file) throw new ApiError(400, "VALIDATION_ERROR", 'Send the resume as a multipart field named "file".');
      const resumeRef = typeof req.body?.resumeRef === "string" ? req.body.resumeRef.slice(0, 100) : undefined;
      const result = await limiter.run(() => analyzeResumeFile(req.file.buffer, req.file.originalname, { ...llmOptions(), allowTxt }));
      res.json(resumeResponse(result, resumeRef));
    })
  );

  v1.post(
    "/resume/analyze-text",
    route(async (req, res) => {
      const body = S.AnalyzeTextBody.parse(req.body);
      const analyzed = await limiter.run(() => analyzeResumeText(body.text, llmOptions()));
      const result = {
        file: { type: "text", pageCount: null, wordCount: analyzed.text.split(/\s+/).filter(Boolean).length },
        fileHash: sha256(Buffer.from(body.text)),
        security: analyzed.security,
        text: analyzed.text,
        analysis: analyzed.analysis,
        meta: analyzed.meta,
      };
      res.json(resumeResponse(result, body.resumeRef));
    })
  );

  v1.post(
    "/resume/report",
    route(async (req, res) => {
      const body = S.ReportBody.parse(req.body);
      res.json({ report: buildResumeReport(body.analysis) });
    })
  );

  v1.post(
    "/resume/skill-gap",
    route(async (req, res) => {
      const body = S.SkillGapBody.parse(req.body);
      res.json({ skillGap: buildSkillGap(body.analysis, { jobs: body.jobs }) });
    })
  );

  v1.post(
    "/resume/blind-profile",
    route(async (req, res) => {
      const body = S.BlindProfileBody.parse(req.body);
      res.json({ profile: buildBlindProfile(body.analysis, { id: body.id, now: nowDate(), keepEducationDates: body.keepEducationDates }) });
    })
  );

  // ---- matching ----
  v1.post(
    "/match",
    route(async (req, res) => {
      const body = S.MatchBody.parse(req.body);
      const job = toMatchJob(body.job);
      normalizeJob(job); // reject a bad job with INVALID_JOB before any model work
      const semantic = body.semantic === false ? null : await semanticSimilarity(body.resume, job, { embedder: deps.embedder });
      const match = scoreMatch(body.resume, job, { weights: body.weights, threshold: body.threshold, semantic });
      res.json({ match, auditEvents: [auditMatchScored(match, { resumeRef: body.resumeRef, now: nowDate() })] });
    })
  );

  v1.post(
    "/screen",
    route(async (req, res) => {
      const body = S.ScreenBody.parse(req.body);
      const job = toMatchJob(body.job);
      normalizeJob(job);
      const options = { weights: body.weights, threshold: body.threshold, embedder: deps.embedder };
      const ranked =
        body.semantic === false ? screenCandidates(body.candidates, job, options) : await screenCandidatesSemantic(body.candidates, job, options);
      const event = auditScreeningRun(ranked, { jobId: body.jobRef ?? (job.id == null ? null : String(job.id)), weights: body.weights, threshold: body.threshold, now: nowDate() });
      res.json({ ranked, auditEvents: [event] });
    })
  );

  v1.post(
    "/recommend",
    route(async (req, res) => {
      const body = S.RecommendBody.parse(req.body);
      const options = { limit: body.limit, minScore: body.minScore, weights: body.weights, embedder: deps.embedder };
      const recommendations =
        body.semantic === false ? recommendJobs(body.resume, body.jobs, options) : await recommendJobsSemantic(body.resume, body.jobs, options);
      res.json({ recommendations });
    })
  );

  // ---- jobs and skills ----
  v1.post(
    "/jobs/extract",
    route(async (req, res) => {
      const body = S.JobExtractBody.parse(req.body);
      const result = await limiter.run(() => extractJobFromText(body.text, { client: deps.client }));
      const now = nowDate();
      const auditEvents = [
        auditJobExtracted(result, { jobRef: body.jobRef, now }),
        auditInjectionDetected(result.security, { source: "job", ref: body.jobRef, now }),
      ].filter(Boolean);
      res.json({ ...result, auditEvents });
    })
  );

  v1.get("/taxonomy", (req, res) => {
    res.json({ categories: CATEGORIES, skills: SKILLS.map(([name, category, aliases]) => ({ name, category, aliases })) });
  });

  v1.post(
    "/skills/unknown",
    route(async (req, res) => {
      const body = S.UnknownSkillsBody.parse(req.body);
      res.json({ skills: aggregateUnknownSkills({ analyses: body.analyses, jobs: body.jobs }) });
    })
  );

  // ---- evaluation (runs in the background, poll for the result) ----
  v1.post(
    "/evaluation/run",
    route(async (req, res) => {
      const body = S.EvaluationBody.parse(req.body);
      const jobs = body.jobs.map(toMatchJob);
      jobs.forEach((job) => normalizeJob(job));
      const run = runs.start(async ({ log }) => {
        const analyze = createPacedAnalyzer({
          analyze: (text) => limiter.run(() => analyzeResumeText(text, llmOptions())),
          paceMs: evalPaceMs,
          onEvent: log,
        });
        const result = await runEvaluation({
          analyze,
          resumes: body.resumes,
          jobs,
          truth: body.truth ?? null,
          baseline: body.baseline ?? {},
          options: { ...body.options, now: nowDate(), onProgress: log },
        });
        return { ...result, auditEvents: [auditEvaluationRun(result, { now: nowDate() })] };
      });
      res.status(202).json({ id: run.id, status: run.status, startedAt: run.startedAt });
    })
  );

  v1.get(
    "/evaluation/:id",
    route(async (req, res) => {
      const run = runs.get(req.params.id);
      if (!run) throw new ApiError(404, "NOT_FOUND", "No evaluation with that id.");
      res.json(run);
    })
  );

  app.use("/v1", v1);

  app.use((req, res) => {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "No such endpoint.", requestId: req.requestId } });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    const info = describeError(error);
    if (info.status >= 500) logger.error(`[${req.requestId}] ${error?.stack ?? error}`);
    for (const [name, value] of Object.entries(info.headers ?? {})) res.set(name, value);
    res.status(info.status).json({
      error: { code: info.code, message: info.message, ...(info.details ? { details: info.details } : {}), requestId: req.requestId },
    });
  });

  return app;
}