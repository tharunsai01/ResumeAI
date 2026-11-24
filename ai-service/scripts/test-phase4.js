// Phase 4 live test: runs the real embedding model.
// First run downloads the model (tens of MB) and can take a minute.
// Run:  npm run test:phase4
import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeResumeFile, scoreMatch, semanticSimilarities } from "../src/index.js";
import { embedTexts } from "../src/semantic/embedder.js";
import { cosine } from "../src/semantic/semanticScore.js";
import { SEMANTIC } from "../src/semantic/semanticConfig.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resumeDir = path.join(__dirname, "..", "samples", "resumes");
const cacheDir = path.join(__dirname, "..", "samples", ".cache");
const jobs = JSON.parse(await readFile(path.join(__dirname, "..", "samples", "jobs.json"), "utf8"));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---- 1. Does the model load and behave sensibly? ----
console.log(`Loading embedding model: ${SEMANTIC.model}`);
const startedAt = Date.now();
try {
  await embedTexts(["warm up"]);
} catch (err) {
  console.log("ERROR: the embedding model could not load:", err.message);
  console.log("Check your internet connection (the model downloads on first use) and try again.");
  process.exit(1);
}
console.log(`model ready in ${((Date.now() - startedAt) / 1000).toFixed(1)} s`);

const [a, b, c] = await embedTexts([
  "Java backend developer building REST APIs with Spring Boot",
  "Software engineer who creates web services using Spring Boot and Java",
  "Registered nurse caring for patients on a hospital ward",
]);
const related = cosine(a, b);
const unrelated = cosine(a, c);
console.log(`sanity check: related pair ${related.toFixed(3)} | unrelated pair ${unrelated.toFixed(3)} -> ${related > unrelated + 0.2 ? "OK" : "SUSPICIOUS"}`);

// ---- 2. Analyse the sample resumes (cached so Groq is only called once per file) ----
async function analyseCached(file) {
  const resumePath = path.join(resumeDir, file);
  const cachePath = path.join(cacheDir, `${file}.json`);
  try {
    const [resumeInfo, cacheInfo] = await Promise.all([stat(resumePath), stat(cachePath)]);
    if (cacheInfo.mtimeMs > resumeInfo.mtimeMs) return JSON.parse(await readFile(cachePath, "utf8"));
  } catch {
    // no usable cache
  }
  const result = await analyzeResumeFile(await readFile(resumePath), file, { allowTxt: true });
  const entry = { id: file, analysis: result.analysis, text: result.text };
  await mkdir(cacheDir, { recursive: true });
  await writeFile(cachePath, JSON.stringify(entry));
  await sleep(1500);
  return entry;
}

const files = (await readdir(resumeDir))
  .filter((f) => !f.startsWith("~$") && /\.(pdf|docx|txt)$/i.test(f))
  .sort();
const candidates = [];
for (const file of files) {
  try {
    candidates.push(await analyseCached(file));
  } catch (err) {
    console.log(`SKIPPED ${file}: ${err.code ?? "ERROR"} - ${err.message}`);
  }
}
if (candidates.length === 0) process.exit(1);
console.log(`\nusing ${candidates.length} analysed resumes (delete ai-service/samples/.cache to re-analyse)`);

// ---- 3. Score every candidate against every job, with and without the model ----
for (const job of jobs) {
  const similarities = await semanticSimilarities(candidates, job);
  console.log("\n" + "=".repeat(78));
  console.log(`${job.id} ${job.title}`);
  console.log("  candidate                   cosine  role(rule) role(blend)  overall(rule) overall(blend)");
  candidates.forEach((candidate, i) => {
    const rule = scoreMatch(candidate, job);
    const blended = scoreMatch(candidate, job, { semantic: similarities[i] });
    const cos = similarities[i] ? similarities[i].cosine.toFixed(3) : "  -  ";
    console.log(
      `  ${candidate.id.padEnd(27)} ${cos.padStart(6)}  ${String(rule.roleSimilarity).padStart(9)} ${String(blended.roleSimilarity).padStart(11)}  ${String(rule.overallMatch).padStart(12)} ${String(blended.overallMatch).padStart(14)}  ${blended.screeningStatus}`
    );
  });
}
console.log("\nTune SEMANTIC.low / SEMANTIC.high in src/semantic/semanticConfig.js so related pairs land near 100 and unrelated near 0.");