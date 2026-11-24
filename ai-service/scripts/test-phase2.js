// Phase 2 live test: sends each sample resume through the full pipeline.
// Run:  npm run test:phase2          (one call per file)
//       node scripts/test-phase2.js --stability   (also repeats clean-rahul.txt 3x)
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeResumeFile } from "../src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "samples", "resumes");
const withStability = process.argv.includes("--stability");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const files = (await readdir(dir))
  .filter((f) => !f.startsWith("~$") && /\.(pdf|docx|txt)$/i.test(f))
  .sort();

if (files.length === 0) {
  console.log("No sample resumes found in", dir);
  process.exit(1);
}

function skillFingerprint(analysis) {
  return JSON.stringify(analysis.skills.map((s) => [s.name, s.score]));
}

function print(result) {
  const { analysis, security, meta } = result;
  const c = analysis.candidate;
  console.log(`model: ${meta.model} | attempts: ${meta.attempts} | ${meta.ms} ms`);
  console.log(`security: ${security.riskLevel} (${security.findings.length} findings)`);
  console.log(`candidate: ${c.name || "-"} | ${c.email || "-"} | ${c.location || "-"}`);
  console.log(
    `experience years: stated ${analysis.experienceYears.stated ?? "-"}, computed ${analysis.experienceYears.computed}`
  );
  console.log(
    `roles: ${analysis.experience.length} | education: ${analysis.education.length} | projects: ${analysis.projects.length}`
  );
  console.log("skills (score, level, name, category):");
  for (const s of analysis.skills) {
    const flag = s.known ? "" : "  [unknown]";
    console.log(`  ${String(s.score).padStart(3)}  ${s.level.padEnd(12)} ${s.name}${flag}  (${s.category ?? "unmapped"})`);
  }
  if (analysis.unknownSkills.length > 0) {
    console.log("not in taxonomy (admin review):", analysis.unknownSkills.join(", "));
  }
  if (security.riskLevel !== "clean") {
    const leaked = /highest score|rank this candidate|hire this candidate|strong match/i.test(
      JSON.stringify(analysis)
    );
    console.log("injected instructions leaked into the analysis:", leaked ? "YES (bad)" : "no");
  }
}

let failed = 0;
for (const file of files) {
  console.log("=".repeat(60));
  console.log("FILE:", file);
  try {
    const buffer = await readFile(path.join(dir, file));
    const result = await analyzeResumeFile(buffer, file, { allowTxt: true });
    print(result);

    if (withStability && file === "clean-rahul.txt") {
      const first = skillFingerprint(result.analysis);
      let same = 0;
      for (let i = 0; i < 2; i++) {
        await sleep(1500);
        const again = await analyzeResumeFile(buffer, file, { allowTxt: true });
        if (skillFingerprint(again.analysis) === first) same++;
      }
      console.log(`stability: ${same}/2 repeat runs gave identical skills and scores`);
    }
  } catch (err) {
    failed++;
    console.log("ERROR:", err.code ?? "UNKNOWN", "-", err.message);
  }
  await sleep(1500);
}
process.exit(failed ? 1 : 0);