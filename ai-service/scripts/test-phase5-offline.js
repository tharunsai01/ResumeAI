// Offline checks for Phase 5: no API key, no network and no embedding model needed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { ExtractionSchema } from "../src/extraction/schema.js";
import { buildAnalysis } from "../src/extraction/extractResume.js";
import { normalizeSkill } from "../src/taxonomy/normalizeSkill.js";
import { buildResumeReport } from "../src/report/resumeReport.js";
import { FRONTEND_CATEGORIES } from "../src/report/reportConfig.js";
import { buildSkillGap } from "../src/skillgap/skillGap.js";
import { ROLES, roleSkillNames } from "../src/skillgap/roles.js";
import { skillMeta } from "../src/skillgap/skillMeta.js";
import { fromBoardJob, toMatchJob } from "../src/matching/jobAdapters.js";
import { parseExperienceRange } from "../src/matching/parsers.js";
import { recommendJobs, recommendJobsSemantic } from "../src/recommend/recommendJobs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const boardJobs = JSON.parse(readFileSync(path.join(__dirname, "..", "samples", "board-jobs.json"), "utf8"));
const NOW = new Date("2026-11-17");

let passed = 0;
function check(label, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      passed++;
      console.log("  ok  ", label);
    })
    .catch((err) => {
      console.log("  FAIL", label, "\n      ", err.message);
      process.exitCode = 1;
    });
}

const RAHUL_FACTS = {
  candidate: { name: "Rahul Kumar", email: "rahul@example.com", location: "Bangalore, India" },
  statedExperienceYears: 2,
  skillsSection: ["Java", "Python", "C++", "JavaScript", "TypeScript", "React", "Node.js", "Express", "Spring Boot", "REST API", "MongoDB", "SQL", "AWS", "Docker", "Linux", "Git"],
  experience: [
    { title: "Software Developer", company: "ABC Technologies", startYear: 2024, endYear: null, isCurrent: true, bullets: ["Developed backend services using Java and Spring Boot", "Designed REST APIs consumed by a React frontend"], technologies: ["Java", "Spring Boot", "REST API", "React", "MongoDB"] },
    { title: "Software Intern", company: "XYZ Solutions", startYear: 2023, endYear: 2024, isCurrent: false, bullets: ["Assisted in full-stack feature development"], technologies: [] },
  ],
  education: [{ degree: "B.Tech in Computer Science", institution: "ABC University", startYear: 2021, endYear: 2025 }],
  projects: [
    { name: "AI Resume Screening System", techStack: ["Python", "FastAPI", "React", "MongoDB"], description: "AI-powered recruitment platform for resume analysis and job matching." },
    { name: "E-Commerce Microservices", techStack: ["Java", "Spring Boot", "Docker", "AWS"], description: "Scalable e-commerce backend built with microservices architecture." },
  ],
};
const analyse = (facts) => buildAnalysis(ExtractionSchema.parse(facts), { now: NOW });
const rahul = analyse(RAHUL_FACTS);

console.log("Resume report");
const report = buildResumeReport(rahul);
await check("has every field of the frontend's ResumeAnalysisResult", () => {
  for (const key of ["score", "breakdown", "personalInfo", "skills", "experience", "education", "projects", "insights"]) {
    assert.ok(key in report, `missing ${key}`);
  }
  assert.deepEqual(Object.keys(report.breakdown), ["skills", "experience", "education", "projects"]);
  assert.deepEqual(Object.keys(report.personalInfo), ["name", "email", "experience", "education", "location"]);
  assert.deepEqual(Object.keys(report.insights), ["strengths", "improvements", "summary"]);
});
await check("scores for the Rahul sample", () => {
  assert.equal(report.score, 80);
  assert.deepEqual(report.breakdown, { skills: 89, experience: 52, education: 100, projects: 83 });
  assert.equal(report.personalInfo.experience, "2 Years");
  assert.equal(report.personalInfo.education, "B.Tech in Computer Science");
});
await check("skills use only the categories the resume page allows", () => {
  const allowed = ["Programming", "Frontend", "Backend", "Database", "Cloud & DevOps"];
  assert.ok(report.skills.length <= 14);
  assert.ok(report.skills.every((s) => allowed.includes(s.category)));
  assert.deepEqual(Object.keys(report.skills[0]), ["name", "score", "category"]);
  assert.equal(report.skills.find((s) => s.name === "Git").category, "Cloud & DevOps"); // Tools folded in
  const scores = report.skills.map((s) => s.score);
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
});
await check("insights are written from the facts", () => {
  assert.ok(report.insights.strengths.includes("Strong Java, MongoDB and React skills"));
  assert.ok(report.insights.improvements[0].includes("measurable achievements"));
  assert.ok(report.insights.summary.includes("Rahul Kumar"));
  assert.ok(report.insights.summary.includes("Backend Developer"));
});
await check("measurable achievements remove that suggestion", () => {
  const numeric = analyse({
    ...RAHUL_FACTS,
    experience: RAHUL_FACTS.experience.map((r) => ({ ...r, bullets: [...r.bullets, "Cut API latency by 40%"] })),
  });
  assert.ok(!buildResumeReport(numeric).insights.improvements.some((s) => s.includes("measurable")));
});
await check("skills outside the taxonomy go to otherSkills, not skills", () => {
  const withKafka = buildResumeReport(analyse({ ...RAHUL_FACTS, skillsSection: [...RAHUL_FACTS.skillsSection, "Kafka"] }));
  assert.deepEqual(withKafka.otherSkills, ["Kafka"]);
  assert.ok(!withKafka.skills.some((s) => s.name === "Kafka"));
});
await check("AI & Data skills are shown under Programming for now", () => {
  const ml = buildResumeReport(analyse({ ...RAHUL_FACTS, skillsSection: ["Machine Learning", "Python"], experience: [], projects: [] }));
  assert.equal(ml.skills.find((s) => s.name === "Machine Learning").category, "Programming");
});
await check("an empty resume does not crash and gets sensible advice", () => {
  const empty = buildResumeReport(analyse({}));
  assert.equal(empty.score, 0);
  assert.ok(empty.insights.improvements.includes("Add projects that show hands-on work"));
  assert.ok(empty.insights.improvements.includes("Add your education details"));
  assert.ok(empty.insights.summary.startsWith("The candidate is a developing candidate"));
});
await check("name, email and location do not change any score", () => {
  const other = structuredClone(rahul);
  other.candidate = { name: "Someone Else", email: "x@y.z", location: "Elsewhere" };
  const changed = buildResumeReport(other);
  assert.equal(changed.score, report.score);
  assert.deepEqual(changed.breakdown, report.breakdown);
});

console.log("Role catalog");
await check("every skill in the role templates exists in the taxonomy", () => {
  for (const role of ROLES) {
    for (const name of roleSkillNames(role)) {
      const skill = normalizeSkill(name);
      assert.ok(skill?.known && skill.name === name, `"${name}" in ${role.title} is not a canonical taxonomy skill`);
    }
  }
});

console.log("Skill gap");
const gap = buildSkillGap(rahul, { jobs: boardJobs });
const detected = gap.skills.filter((s) => s.isDetected);
const missing = gap.skills.filter((s) => !s.isDetected);
await check("demand comes from the jobs", () => {
  assert.equal(gap.demandSource, "jobs");
  assert.equal(gap.jobsConsidered, 6);
  assert.equal(gap.skills.find((s) => s.name === "React").jobDemand, 33);
  assert.equal(gap.skills.find((s) => s.name === "Java").jobDemand, 33);
});
await check("detected skills and gap skills are separated", () => {
  assert.equal(detected.length, 17);
  assert.ok(missing.length > 0 && missing.length <= 8);
  assert.ok(missing.every((s) => s.currentScore === 0 && s.level === "Beginner"));
  const names = gap.skills.map((s) => s.name);
  assert.equal(new Set(names).size, names.length, "no skill appears twice");
  assert.ok(missing.some((s) => s.name === "CI/CD"));
  assert.ok(!missing.some((s) => ["Java", "React", "Docker"].includes(s.name)));
});
await check("each entry has every SkillData field", () => {
  const fields = ["id", "name", "category", "currentScore", "targetScore", "level", "priority", "jobDemand", "description", "recommendation", "difficulty", "estimatedEffort", "isDetected"];
  for (const skill of gap.skills) {
    assert.deepEqual(Object.keys(skill), fields);
    assert.ok(skill.id.startsWith("s_"));
    assert.ok(skill.targetScore >= skill.currentScore);
    assert.ok(["High", "Medium", "Low"].includes(skill.priority));
    assert.ok(FRONTEND_CATEGORIES.includes(skill.category));
  }
  assert.ok(missing[0].recommendation.startsWith("1. Learn"));
});
await check("career paths, role comparison and category scores", () => {
  assert.equal(gap.careerPaths.length, 5);
  assert.equal(gap.careerPaths[0].title, "Backend Developer");
  assert.equal(gap.careerPaths[0].readinessScore, 83);
  const ready = gap.careerPaths.map((p) => p.readinessScore);
  assert.deepEqual(ready, [...ready].sort((a, b) => b - a));
  assert.equal(gap.roleComparisons[0].userCoverage, 100);
  assert.equal(gap.roleComparisons[0].targetCoverage, 90);
  assert.deepEqual(gap.categoryScores.map((c) => c.category), FRONTEND_CATEGORIES);
  assert.equal(gap.categoryScores.find((c) => c.category === "Tools").score, 40);
});
await check("without jobs it falls back to the role templates", () => {
  const fallback = buildSkillGap(rahul);
  assert.equal(fallback.demandSource, "roles");
  assert.equal(fallback.jobsConsidered, 0);
  assert.ok(fallback.skills.find((s) => s.name === "Docker").jobDemand > 0);
});
await check("empty or malformed jobs are ignored", () => {
  const messy = buildSkillGap(rahul, { jobs: [null, {}, ...boardJobs] });
  assert.equal(messy.jobsConsidered, 6);
});
await check("unknown skills get default wording", () => {
  const meta = skillMeta("SomethingNew", "Backend");
  assert.equal(meta.difficulty, "Intermediate");
  assert.ok(meta.about.includes("SomethingNew"));
});

console.log("Job adapters");
await check("board jobs lose soft skills and keep the degree line", () => {
  const adapted = fromBoardJob(boardJobs[0]);
  assert.deepEqual(adapted.requiredSkills, ["Java", "Spring Boot", "REST API", "SQL", "MongoDB", "Docker", "AWS"]);
  assert.equal(adapted.education, "B.Tech/B.E. in Computer Science or a related field.");
  assert.equal(adapted.experience, "2–5 Years");
});
await check("structured jobs pass through unchanged", () => {
  const structured = { id: "x", title: "Dev", requiredSkills: ["React"], preferredSkills: [], experience: "", education: "" };
  assert.equal(toMatchJob(structured), structured);
});
await check("the frontend's experience buckets are understood", () => {
  assert.deepEqual(parseExperienceRange("2–5 Years"), { min: 2, max: 5 });
  assert.deepEqual(parseExperienceRange("0–2 Years"), { min: 0, max: 2 });
  assert.deepEqual(parseExperienceRange("5+ Years"), { min: 5, max: null });
  assert.deepEqual(parseExperienceRange("Fresher"), { min: 0, max: 1 });
});

console.log("Recommendations");
const recs = recommendJobs({ analysis: rahul }, boardJobs);
await check("best match first, with the original job ids", () => {
  assert.equal(recs[0].jobId, "job_201");
  assert.equal(recs[0].match, 90);
  assert.equal(recs[0].screeningStatus, "Strong Match");
  const scores = recs.map((r) => r.match);
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
  assert.ok(recs.every((r) => boardJobs.some((j) => j.id === r.jobId)));
});
await check("each recommendation lists matched and missing skills", () => {
  const devops = recs.find((r) => r.jobId === "job_204");
  assert.ok(devops.missingSkills.includes("Kubernetes"));
  assert.ok(devops.matchedSkills.includes("Docker"));
  assert.deepEqual(Object.keys(recs[0]), ["jobId", "jobTitle", "match", "screeningStatus", "matchedSkills", "partialSkills", "missingSkills", "reasons", "gaps"]);
});
await check("limit and minScore are respected", () => {
  assert.equal(recommendJobs({ analysis: rahul }, boardJobs, { limit: 2 }).length, 2);
  const strict = recommendJobs({ analysis: rahul }, boardJobs, { minScore: 80 });
  assert.deepEqual(strict.map((r) => r.jobId), ["job_201"]);
});
await check("name, email and location do not change the recommendations", () => {
  const other = structuredClone(rahul);
  other.candidate = { name: "Someone Else", email: "x@y.z", location: "Elsewhere" };
  assert.deepEqual(recommendJobs({ analysis: other }, boardJobs), recs);
});

function toyVector(text) {
  const v = new Array(256).fill(0);
  for (const word of text.toLowerCase().match(/[a-z0-9+#.]+/g) ?? []) {
    let h = 0;
    for (const ch of word) h = (h * 31 + ch.charCodeAt(0)) % 256;
    v[h] += 1;
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}
await check("semantic recommendations work with a stand-in embedder", async () => {
  const result = await recommendJobsSemantic({ analysis: rahul }, boardJobs, { embedder: async (texts) => texts.map(toyVector) });
  assert.ok(result.length > 0);
  assert.ok(result.every((r) => typeof r.match === "number"));
});
await check("if embeddings fail, recommendations fall back to rule-based", async () => {
  const warn = console.warn;
  console.warn = () => {};
  try {
    const result = await recommendJobsSemantic({ analysis: rahul }, boardJobs, {
      embedder: async () => {
        throw new Error("no model");
      },
    });
    assert.deepEqual(result, recs);
  } finally {
    console.warn = warn;
  }
});

console.log(`\n${passed} checks passed${process.exitCode ? " (some FAILED)" : ""}`);