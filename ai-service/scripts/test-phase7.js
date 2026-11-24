// Phase 7 live test: runs the real evaluation (calls Groq).
//   npm run test:phase7                 about 24 model calls
//   npm run test:phase7 -- --quick      about 12 model calls
//   add --pace=5000 to wait longer (in ms) between model calls if Groq's rate limit keeps stopping the run
// Finished calls are saved in samples/.cache/eval, so a rerun after an interruption only repeats what is missing.
// Uses the resumes analysed in Phase 4 (samples/.cache) as the baseline.
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runEvaluation, analyzeResumeText, auditEvaluationRun } from "../src/index.js";
import { createPacedAnalyzer } from "../src/evaluation/pacedAnalyzer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const samples = path.join(__dirname, "..", "samples");
const quick = process.argv.includes("--quick");
const paceArgument = process.argv.find((arg) => arg.startsWith("--pace="));
const paceMs = paceArgument ? Number(paceArgument.split("=")[1]) || 3000 : 3000;

// ---- inputs ----
let cacheFiles = [];
try {
  cacheFiles = (await readdir(path.join(samples, ".cache"))).filter((f) => f.endsWith(".json"));
} catch {
  // handled below
}
if (cacheFiles.length === 0) {
  console.log("No analysed resumes found. Run `npm run test:phase4` first (it creates samples/.cache).");
  process.exit(1);
}

// only the plain-text sample resumes can be re-analysed from text (variants and attacks edit the text)
const resumeIds = ["clean-rahul.txt", "injected-candidate.txt"].filter((id) => cacheFiles.includes(`${id}.json`));
if (resumeIds.length === 0) {
  console.log("Could not find cached analyses for clean-rahul.txt. Run `npm run test:phase4` first.");
  process.exit(1);
}
const resumes = [];
const baseline = {};
for (const id of resumeIds) {
  resumes.push({ id, text: await readFile(path.join(samples, "resumes", id), "utf8") });
  const cached = JSON.parse(await readFile(path.join(samples, ".cache", `${id}.json`), "utf8"));
  baseline[id] = { analysis: cached.analysis };
}
const jobs = JSON.parse(await readFile(path.join(samples, "jobs.json"), "utf8"));
const truth = JSON.parse(await readFile(path.join(samples, "ground-truth.json"), "utf8"));

// ---- run ----
const analyze = createPacedAnalyzer({
  analyze: (text) => analyzeResumeText(text),
  cacheDir: path.join(samples, ".cache", "eval"),
  paceMs,
  waitMs: 60000,
  onEvent: (message) => console.log("  !! " + message),
});

const options = quick
  ? {
      stabilityRuns: 3,
      variantIds: ["community-coded-names", "location", "institution"],
      attackIds: ["known-pattern", "paraphrased-override", "fake-json-output", "skill-stuffing", "inflated-experience"],
    }
  : {};

console.log(`Running the ${quick ? "quick" : "full"} evaluation on ${resumes.map((r) => r.id).join(", ")} ...`);
const started = Date.now();
const result = await runEvaluation({
  analyze,
  resumes,
  jobs,
  truth,
  baseline,
  options: { ...options, datasetName: "Sample evaluation set", onProgress: (message) => console.log("  ... " + message) },
});
const { report, record } = result;
const { calls, cached, waits } = analyze.stats;
console.log(`\nfinished in ${((Date.now() - started) / 1000).toFixed(0)} s: ${calls} model calls, ${cached} reused from earlier runs, ${waits} rate-limit waits`);

// ---- print ----
const line = "=".repeat(74);
console.log(`\n${line}\nEVALUATION ${record.id}  (${record.components})\n${line}`);
console.log("model:", report.modelInfo.modelVersion, "| embeddings:", report.modelInfo.embeddingModel);

const se = report.skillExtraction;
console.log(`\nSKILL EXTRACTION   accuracy ${se.accuracy} | precision ${se.precision}% | recall ${se.recall}% | F1 ${se.f1}%`);
console.log(`  correct ${se.correctSkills} | missed ${se.missedSkills} | incorrect ${se.incorrectSkills} | samples ${se.evaluationSamples}`);
for (const c of se.perCase) {
  if (c.missed.length || c.incorrect.length) console.log(`  ${c.id}: missed [${c.missed.join(", ")}] incorrect [${c.incorrect.join(", ")}]`);
}

const st = report.scoreStability;
console.log(`\nSCORE STABILITY    ${st.stability}  (${st.stableResults} of ${st.evaluationSamples} runs identical, ${st.changedResults} changed)`);

const fr = report.fairness;
console.log(`\nFAIRNESS           ${fr.status} | threshold ${fr.threshold} points | max difference ${fr.maximumDifference} | noise floor ${fr.noiseFloor.maximumDifference}`);
for (const p of fr.comparisonPairs) {
  const skills = p.skillDifferences.onlyA.length + p.skillDifferences.onlyB.length > 0 ? `  skills differ: A-only [${p.skillDifferences.onlyA}] B-only [${p.skillDifferences.onlyB}]` : "";
  console.log(`  ${p.id}  ${p.group.padEnd(11)} ${String(p.scoreA).padStart(5)} vs ${String(p.scoreB).padEnd(5)} diff ${String(p.difference).padEnd(4)} ${p.status}${skills}`);
  console.log(`            ${p.label}`);
}

const sec = report.security;
console.log(`\nSECURITY           ${sec.attacksManipulated} of ${sec.attacksTested} scenarios changed scores | scan caught ${sec.attacksDetectedByScan} | tolerance ${sec.tolerance} points`);
for (const a of sec.attacks) {
  const strong = a.newStrongSkills.length ? `  new strong skills: ${a.newStrongSkills.join(", ")}` : "";
  console.log(`  ${a.id.padEnd(24)} scan ${a.scanRisk.padEnd(10)} ${String(a.baseScore).padStart(5)} -> ${String(a.attackScore).padEnd(5)} (${a.delta >= 0 ? "+" : ""}${a.delta})  ${a.outcome}${strong}`);
}

const bs = report.blindScreening;
console.log(`\nBLIND SCREENING    ${bs.status} | ${bs.testCoverage} | hidden: ${bs.identityFieldsHidden.join(", ")}`);
for (const f of bs.failures) console.log(`  leaked "${f.leaked}" in ${f.id}`);

console.log("\nFINDINGS");
for (const f of report.findings) console.log(`  [${f.type}] ${f.text}`);
console.log("REVIEW FLAGS");
if (report.reviewFlags.length === 0) console.log("  none");
for (const f of report.reviewFlags) console.log(`  (${f.type}) ${f.message}`);

await mkdir(path.join(samples, ".cache"), { recursive: true });
await writeFile(path.join(samples, ".cache", "evaluation-report.json"), JSON.stringify({ ...result, audit: auditEvaluationRun(result) }, null, 2));
console.log("\nfull report saved to ai-service/samples/.cache/evaluation-report.json");