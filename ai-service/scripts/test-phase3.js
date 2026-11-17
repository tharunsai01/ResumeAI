// Phase 3 live test: analyse each sample resume once, then score it against every sample job.
// Run:  npm run test:phase3
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeResumeFile, scoreMatch, screenCandidates } from "../src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resumeDir = path.join(__dirname, "..", "samples", "resumes");
const jobs = JSON.parse(await readFile(path.join(__dirname, "..", "samples", "jobs.json"), "utf8"));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const files = (await readdir(resumeDir))
  .filter((f) => !f.startsWith("~$") && /\.(pdf|docx|txt)$/i.test(f))
  .sort();

const candidates = [];
for (const file of files) {
  try {
    const buffer = await readFile(path.join(resumeDir, file));
    const result = await analyzeResumeFile(buffer, file, { allowTxt: true });
    candidates.push({ id: file, analysis: result.analysis, text: result.text });
    console.log(`analysed ${file} (${result.analysis.skills.length} skills)`);
  } catch (err) {
    console.log(`SKIPPED ${file}: ${err.code ?? "ERROR"} - ${err.message}`);
  }
  await sleep(1500);
}
if (candidates.length === 0) process.exit(1);

const row = (r) =>
  `${String(r.overallMatch).padStart(3)}  ${r.screeningStatus.padEnd(15)} skills ${r.skillMatch ?? "-"} | exp ${r.experienceMatch ?? "-"} | edu ${r.educationMatch ?? "-"} | role ${r.roleSimilarity ?? "-"} | keywords ${r.keywordMatch ?? "-"}`;

for (const candidate of candidates) {
  console.log("\n" + "=".repeat(70));
  console.log("CANDIDATE:", candidate.id);
  let best = null;
  for (const job of jobs) {
    const r = scoreMatch(candidate, job);
    console.log(`  ${job.id} ${job.title.padEnd(22)} ${row(r)}`);
    if (!best || r.overallMatch > best.overallMatch) best = r;
  }
  console.log(`\n  Best fit: ${best.jobTitle} (${best.experience})`);
  console.log("  skills:", best.skills.map((s) => `${s.name} [${s.matchType}/${s.proficiency}]`).join(", "));
  for (const line of best.matchedStrengths) console.log("  + " + line);
  for (const line of best.potentialGaps) console.log("  - " + line);
}

console.log("\n" + "=".repeat(70));
for (const job of jobs) {
  console.log(`RANKING for ${job.id} ${job.title}`);
  screenCandidates(candidates, job).forEach((r, i) => console.log(`  ${i + 1}. ${r.id.padEnd(26)} ${r.overallMatch} ${r.screeningStatus}`));
}

const custom = { skills: 0.8, experience: 0.1, education: 0.05, roleSimilarity: 0.05 };
console.log("\nCustom weights", JSON.stringify(custom), "on", jobs[0].title);
screenCandidates(candidates, jobs[0], { weights: custom }).forEach((r) => console.log(`  ${r.id.padEnd(26)} ${r.overallMatch} ${r.screeningStatus}`));