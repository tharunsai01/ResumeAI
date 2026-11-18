// Phase 5 live test: builds the candidate-facing report, skill gap and job recommendations
// for the resumes analysed in Phase 4 (read from samples/.cache, so Groq is not called again).
// Run:  npm run test:phase5
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildResumeReport, buildSkillGap, recommendJobs, recommendJobsSemantic } from "../src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cacheDir = path.join(__dirname, "..", "samples", ".cache");
const boardJobs = JSON.parse(await readFile(path.join(__dirname, "..", "samples", "board-jobs.json"), "utf8"));

let files = [];
try {
  files = (await readdir(cacheDir)).filter((f) => f.endsWith(".json")).sort();
} catch {
  // handled below
}
if (files.length === 0) {
  console.log("No analysed resumes found. Run `npm run test:phase4` first (it creates samples/.cache).");
  process.exit(1);
}

for (const file of files) {
  const candidate = JSON.parse(await readFile(path.join(cacheDir, file), "utf8"));
  const { analysis } = candidate;
  console.log("\n" + "=".repeat(74));
  console.log("CANDIDATE:", candidate.id);

  // ---- resume report ----
  const report = buildResumeReport(analysis);
  console.log(`\nRESUME REPORT  score ${report.score}  (skills ${report.breakdown.skills} | experience ${report.breakdown.experience} | education ${report.breakdown.education} | projects ${report.breakdown.projects})`);
  console.log(`  ${report.personalInfo.name || "-"} | ${report.personalInfo.experience} | ${report.personalInfo.education || "-"} | ${report.personalInfo.location || "-"}`);
  console.log("  top skills:", report.skills.slice(0, 8).map((s) => `${s.name} ${s.score}`).join(", "));
  for (const line of report.insights.strengths) console.log("  + " + line);
  for (const line of report.insights.improvements) console.log("  - " + line);
  console.log("  summary:", report.insights.summary);
  if (report.otherSkills.length > 0) console.log("  outside the taxonomy:", report.otherSkills.join(", "));

  // ---- skill gap ----
  const gap = buildSkillGap(analysis, { jobs: boardJobs });
  console.log(`\nSKILL GAP  (demand from ${gap.jobsConsidered} jobs)`);
  for (const s of gap.skills.filter((x) => !x.isDetected)) {
    console.log(`  learn: ${s.name.padEnd(14)} priority ${s.priority.padEnd(6)} demand ${String(s.jobDemand).padStart(3)}%  ${s.difficulty}, ${s.estimatedEffort}`);
  }
  console.log("  career paths:", gap.careerPaths.map((p) => `${p.title} ${p.readinessScore}`).join(" | "));
  console.log("  categories:  ", gap.categoryScores.map((c) => `${c.category} ${c.score}`).join(" | "));

  // ---- recommendations ----
  const rule = recommendJobs(candidate, boardJobs, { minScore: 0 });
  const blended = await recommendJobsSemantic(candidate, boardJobs, { minScore: 0 });
  const ruleScore = new Map(rule.map((r) => [r.jobId, r.match]));
  console.log("\nRECOMMENDED JOBS  (rule-based -> with embeddings)");
  for (const r of blended) {
    console.log(`  ${String(ruleScore.get(r.jobId)).padStart(3)} -> ${String(r.match).padStart(3)}  ${r.jobTitle.padEnd(24)} ${r.screeningStatus.padEnd(16)} missing: ${r.missingSkills.slice(0, 3).join(", ") || "none"}`);
  }
}