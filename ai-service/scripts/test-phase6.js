// Phase 6 live test: job description extraction (calls Groq), blind profile,
// unknown-skill list and audit events. Uses the resumes analysed in Phase 4 (samples/.cache).
// Run:  npm run test:phase6
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractJobFromText,
  scoreMatch,
  buildBlindProfile,
  redactText,
  aggregateUnknownSkills,
  auditJobExtracted,
  auditMatchScored,
  auditInjectionDetected,
} from "../src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const samples = path.join(__dirname, "..", "samples");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- candidates analysed earlier ----
let cacheFiles = [];
try {
  cacheFiles = (await readdir(path.join(samples, ".cache"))).filter((f) => f.endsWith(".json")).sort();
} catch {
  // handled below
}
if (cacheFiles.length === 0) {
  console.log("No analysed resumes found. Run `npm run test:phase4` first (it creates samples/.cache).");
  process.exit(1);
}
const candidates = [];
for (const file of cacheFiles) candidates.push(JSON.parse(await readFile(path.join(samples, ".cache", file), "utf8")));

// ---- 1. job descriptions -> structured jobs ----
const jdDir = path.join(samples, "job-descriptions");
const jdFiles = (await readdir(jdDir)).filter((f) => f.endsWith(".txt")).sort();
const extractedJobs = [];

for (const file of jdFiles) {
  console.log("\n" + "=".repeat(74));
  console.log("JOB DESCRIPTION:", file);
  try {
    const result = await extractJobFromText(await readFile(path.join(jdDir, file), "utf8"));
    const { job, security, meta } = result;
    extractedJobs.push({ file, result });
    console.log(`  title:       ${job.title}`);
    console.log(`  experience:  ${job.experience || "-"}  ${job.experienceRange ? JSON.stringify(job.experienceRange) : ""}`);
    console.log(`  education:   ${job.education || "-"}`);
    console.log(`  required:    ${job.requiredSkills.join(", ") || "-"}`);
    console.log(`  preferred:   ${job.preferredSkills.join(", ") || "-"}`);
    console.log(`  not in taxonomy: ${job.unknownSkills.join(", ") || "-"}`);
    console.log(`  security:    ${security.riskLevel}${security.findings.length ? " (" + security.findings.map((f) => f.rule).join(", ") + ")" : ""}`);
    console.log(`  model: ${meta.model} | attempts ${meta.attempts} | ${meta.ms} ms`);
  } catch (err) {
    console.log("  ERROR:", err.code ?? "UNKNOWN", "-", err.message);
  }
  await sleep(1500);
}

// ---- 2. score the analysed candidates against each extracted job ----
for (const { file, result } of extractedJobs) {
  console.log(`\nSCORES for "${result.job.title}" (${file})`);
  candidates
    .map((c) => ({ id: c.id, match: scoreMatch(c, { id: file, ...result.job }) }))
    .sort((a, b) => b.match.overallMatch - a.match.overallMatch)
    .forEach((r) => console.log(`  ${String(r.match.overallMatch).padStart(3)}  ${r.match.screeningStatus.padEnd(16)} ${r.id}`));
}

// ---- 3. blind view ----
const sample = candidates.find((c) => /rahul/i.test(c.id)) ?? candidates[0];
const profile = buildBlindProfile(sample.analysis, { id: sample.id });
console.log("\n" + "=".repeat(74));
console.log(`BLIND PROFILE of ${sample.id}  ->  ${profile.label}`);
console.log(`  experience: ${profile.experienceYears} years | education: ${profile.education.map((e) => e.degree).join("; ") || "-"}`);
console.log("  skills:", profile.skills.slice(0, 8).map((s) => `${s.name} (${s.level})`).join(", "));
for (const role of profile.roles) console.log(`  role: ${role.title} - ${role.length}`);
console.log("  hidden:", profile.hidden.join(", "));

const entities = {
  name: sample.analysis.candidate.name,
  location: sample.analysis.candidate.location,
  companies: sample.analysis.experience.map((r) => r.company).filter(Boolean),
  institutions: sample.analysis.education.map((e) => e.institution).filter(Boolean),
};
console.log("\n  resume text as the recruiter would see it (first lines):");
for (const line of redactText(sample.text, entities).split("\n").slice(0, 14)) console.log("    " + line);

// ---- 4. unknown skills ----
console.log("\nSKILLS PENDING REVIEW (not in the taxonomy)");
const pending = aggregateUnknownSkills({
  analyses: candidates.map((c) => c.analysis),
  jobs: extractedJobs.map((j) => j.result.job),
});
if (pending.length === 0) console.log("  none");
for (const entry of pending) console.log(`  ${entry.name.padEnd(18)} resumes ${entry.resumes} | jobs ${entry.jobs}`);

// ---- 5. audit events ----
console.log("\nAUDIT EVENTS (examples)");
if (extractedJobs[0]) console.log(JSON.stringify(auditJobExtracted(extractedJobs[0].result, { jobRef: extractedJobs[0].file }), null, 2));
if (extractedJobs[0]) {
  const match = scoreMatch(sample, { id: extractedJobs[0].file, ...extractedJobs[0].result.job });
  console.log(JSON.stringify(auditMatchScored(match, { resumeRef: sample.id }), null, 2));
}
for (const { file, result } of extractedJobs) {
  const event = auditInjectionDetected(result.security, { source: "job", ref: file });
  if (event) console.log(JSON.stringify(event, null, 2));
}