// Phase 8 live test: starts the HTTP service inside this process and calls it the way the backend will.
// Uses the real Groq model (3 to 5 calls) and the real embedding model.
// Run:  npm run test:phase8
import { readFile, access } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "../src/server/app.js";
import { embedTexts } from "../src/semantic/embedder.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const samples = path.join(__dirname, "..", "samples");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const exists = (file) => access(file).then(() => true, () => false);

const KEY = `live-test-${randomBytes(12).toString("hex")}`;
const app = createApp({ apiKey: KEY, allowTxt: true, logger: { info: () => {}, error: (m) => console.error(m) } });
const server = await new Promise((resolve) => {
  const s = app.listen(0, "127.0.0.1", () => resolve(s));
});
const base = `http://127.0.0.1:${server.address().port}`;

async function call(method, route, { body, form, key = KEY, pause = 0 } = {}) {
  const started = Date.now();
  const init = { method, headers: key ? { "x-internal-key": key } : {} };
  if (body !== undefined) {
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  if (form) init.body = form;
  const res = await fetch(base + route, init);
  const json = await res.json();
  console.log(`${method.padEnd(4)} ${route.padEnd(26)} -> ${res.status}  (${Date.now() - started} ms)`);
  if (pause) await sleep(pause);
  return { status: res.status, json };
}
const file = (name, buffer) => {
  const form = new FormData();
  form.append("file", new Blob([buffer]), name);
  return form;
};

try {
  console.log("Loading the embedding model (first run downloads it, later runs are quick) ...");
  await embedTexts(["warm up"]);
  console.log(`Service running on ${base}\n`);

  await call("GET", "/health", { key: null });
  const status = await call("GET", "/v1/status");
  console.log(`  model: ${status.json.llm.model} | queue: ${JSON.stringify(status.json.queue)}`);
  const noKey = await call("GET", "/v1/status", { key: null });
  console.log(`  without the key: ${noKey.json.error.code}\n`);

  // ---- analyse resumes ----
  const candidates = [];
  const rahulText = await readFile(path.join(samples, "resumes", "clean-rahul.txt"), "utf8");
  const rahul = await call("POST", "/v1/resume/analyze-text", { body: { text: rahulText, resumeRef: "res_rahul" }, pause: 1500 });
  console.log(`  clean-rahul.txt: ${rahul.json.analysis.skills.length} skills | resume score ${rahul.json.report.score} | security ${rahul.json.security.riskLevel} | audit ${rahul.json.auditEvents.map((e) => e.type)}`);
  candidates.push({ id: "clean-rahul", analysis: rahul.json.analysis });

  const injectedText = await readFile(path.join(samples, "resumes", "injected-candidate.txt"), "utf8");
  const injected = await call("POST", "/v1/resume/analyze-text", { body: { text: injectedText, resumeRef: "res_injected" }, pause: 1500 });
  console.log(`  injected-candidate.txt: ${injected.json.analysis.skills.length} skills | security ${injected.json.security.riskLevel} | audit ${injected.json.auditEvents.map((e) => e.type)}`);
  candidates.push({ id: "injected-candidate", analysis: injected.json.analysis });

  for (const name of ["my-resume.pdf", "my-test.docx"]) {
    const location = path.join(samples, "resumes", name);
    if (!(await exists(location))) continue;
    const res = await call("POST", "/v1/resume/analyze", { form: file(name, await readFile(location)), pause: 1500 });
    if (res.status !== 200) {
      console.log(`  ${name}: ${res.json.error.code} - ${res.json.error.message}`);
      continue;
    }
    console.log(`  ${name}: ${res.json.file.type}, ${res.json.file.pageCount ?? "-"} pages, ${res.json.analysis.skills.length} skills | resume score ${res.json.report.score} | hash ${res.json.fileHash.slice(0, 12)}...`);
    candidates.push({ id: name, analysis: res.json.analysis });
  }

  const wrongType = await call("POST", "/v1/resume/analyze", { form: file("notes.exe", "MZ") });
  console.log(`  uploading an .exe: ${wrongType.json.error.code}\n`);

  // ---- job description -> job, then match and screen ----
  const jdText = await readFile(path.join(samples, "job-descriptions", "jd-backend-fintech.txt"), "utf8");
  const extracted = await call("POST", "/v1/jobs/extract", { body: { text: jdText, jobRef: "jd_backend" }, pause: 1500 });
  const job = { id: "jd_backend", ...extracted.json.job };
  console.log(`  ${job.title} | required: ${job.requiredSkills.join(", ")} | preferred: ${job.preferredSkills.join(", ")} | unknown: ${job.unknownSkills.join(", ") || "-"}\n`);

  const match = await call("POST", "/v1/match", { body: { resume: { analysis: rahul.json.analysis, text: rahul.json.text }, job, resumeRef: "res_rahul" } });
  const m = match.json.match;
  console.log(`  match: ${m.overallMatch}% ${m.screeningStatus} | skills ${m.skillMatch} exp ${m.experienceMatch} edu ${m.educationMatch} role ${m.roleSimilarity} | embedding cosine ${m.semanticCosine}`);
  console.log(`  strengths: ${m.matchedStrengths.join(" | ")}`);
  console.log(`  gaps: ${m.potentialGaps.join(" | ")}\n`);

  const screen = await call("POST", "/v1/screen", { body: { candidates, job, jobRef: "jd_backend" } });
  for (const r of screen.json.ranked) console.log(`  ${String(r.overallMatch).padStart(3)}  ${r.screeningStatus.padEnd(16)} ${r.id}`);
  console.log(`  audit: ${screen.json.auditEvents[0].summary}\n`);

  // ---- candidate side ----
  const boardJobs = JSON.parse(await readFile(path.join(samples, "board-jobs.json"), "utf8"));
  const recommend = await call("POST", "/v1/recommend", { body: { resume: { analysis: rahul.json.analysis }, jobs: boardJobs, limit: 3 } });
  for (const r of recommend.json.recommendations) console.log(`  ${String(r.match).padStart(3)}  ${r.jobTitle}`);
  const gap = await call("POST", "/v1/resume/skill-gap", { body: { analysis: rahul.json.analysis, jobs: boardJobs } });
  console.log(`  skill gap: ${gap.json.skillGap.skills.filter((s) => !s.isDetected).map((s) => s.name).join(", ")} | best role: ${gap.json.skillGap.careerPaths[0].title}`);
  const blind = await call("POST", "/v1/resume/blind-profile", { body: { analysis: rahul.json.analysis, id: "cand_1" } });
  console.log(`  blind profile: ${blind.json.profile.label}, hidden: ${blind.json.profile.hidden.join(", ")}\n`);

  // ---- evaluation (no model calls here: the analysis is supplied as the baseline) ----
  const jobs = JSON.parse(await readFile(path.join(samples, "jobs.json"), "utf8"));
  const truth = JSON.parse(await readFile(path.join(samples, "ground-truth.json"), "utf8"));
  const run = await call("POST", "/v1/evaluation/run", {
    body: {
      resumes: [{ id: "clean-rahul.txt", text: rahulText }],
      jobs,
      truth,
      baseline: { "clean-rahul.txt": { analysis: rahul.json.analysis } },
      options: { components: ["skills", "blind"], datasetName: "Live API test" },
    },
  });
  let done = null;
  for (let i = 0; i < 100 && !done; i++) {
    await sleep(100);
    const polled = await fetch(`${base}/v1/evaluation/${run.json.id}`, { headers: { "x-internal-key": KEY } });
    const body = await polled.json();
    if (body.status !== "running") done = body;
  }
  console.log(`  evaluation ${run.json.id}: ${done?.status} | ${done?.result?.record.components} | skill extraction ${done?.result?.record.metrics.skillExtraction}`);
  console.log("\nAll calls completed.");
} finally {
  server.close();
  server.closeAllConnections?.();
}