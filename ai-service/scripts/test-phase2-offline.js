// Offline checks for Phase 2: no API key and no network needed.
import assert from "node:assert/strict";
import { normalizeSkill } from "../src/taxonomy/normalizeSkill.js";
import { ExtractionSchema } from "../src/extraction/schema.js";
import { buildAnalysis, extractResume, ExtractionError } from "../src/extraction/extractResume.js";

let passed = 0;
function check(label, fn) {
  try {
    fn();
    passed++;
    console.log("  ok  ", label);
  } catch (err) {
    console.log("  FAIL", label, "\n      ", err.message);
    process.exitCode = 1;
  }
}

// What a correct LLM answer for samples/resumes/clean-rahul.txt looks like.
const CANNED = {
  candidate: { name: "Rahul Kumar", email: "rahul@example.com", location: "Bangalore, India" },
  statedExperienceYears: 2,
  skillsSection: [
    "Java", "Python", "C++", "JavaScript", "TypeScript", "React", "Node.js", "Express",
    "Spring Boot", "REST API", "MongoDB", "SQL", "AWS", "Docker", "Linux", "Git",
  ],
  experience: [
    {
      title: "Software Developer", company: "ABC Technologies", startYear: 2024, endYear: null, isCurrent: true,
      bullets: ["Developed backend services using Java and Spring Boot"],
      technologies: ["Java", "Spring Boot", "REST API", "React", "MongoDB"],
    },
    {
      title: "Software Intern", company: "XYZ Solutions", startYear: 2023, endYear: 2024, isCurrent: false,
      bullets: ["Assisted in full-stack feature development"],
      technologies: [],
    },
  ],
  education: [{ degree: "B.Tech in Computer Science", institution: "ABC University", startYear: 2021, endYear: 2025 }],
  projects: [
    { name: "AI Resume Screening System", techStack: ["Python", "FastAPI", "React", "MongoDB"], description: "AI-powered recruitment platform." },
    { name: "E-Commerce Microservices", techStack: ["Java", "Spring Boot", "Docker", "AWS"], description: "Scalable e-commerce backend." },
  ],
};
const NOW = new Date("2026-11-17");

console.log("Taxonomy");
check("aliases map to canonical names", () => {
  assert.equal(normalizeSkill("NodeJS").name, "Node.js");
  assert.equal(normalizeSkill("React.js").name, "React");
  assert.equal(normalizeSkill("Postgres").name, "PostgreSQL");
  assert.equal(normalizeSkill("Python 3.11").name, "Python");
  assert.equal(normalizeSkill("RESTful APIs").name, "REST API");
});
check("C, C++ and C# stay separate", () => {
  assert.equal(normalizeSkill("C").name, "C");
  assert.equal(normalizeSkill("C++").name, "C++");
  assert.equal(normalizeSkill("C#").name, "C#");
});
check("unknown skills are kept and flagged", () => {
  const skill = normalizeSkill("Kafka");
  assert.equal(skill.name, "Kafka");
  assert.equal(skill.known, false);
  assert.equal(skill.category, null);
});
check("junk input is ignored", () => {
  assert.equal(normalizeSkill(""), null);
  assert.equal(normalizeSkill("12345"), null);
  assert.equal(normalizeSkill(null), null);
});

console.log("Schema");
check("messy model output is coerced into a safe shape", () => {
  const out = ExtractionSchema.parse({
    candidate: null,
    statedExperienceYears: "2",
    skillsSection: ["Java", "", null, "React"],
    experience: [{ title: "Dev", startYear: "2022", isCurrent: "true", extra: "dropped" }],
    junkKey: 1,
  });
  assert.equal(out.statedExperienceYears, 2);
  assert.deepEqual(out.skillsSection, ["Java", "React"]);
  assert.equal(out.experience[0].startYear, 2022);
  assert.equal(out.experience[0].isCurrent, true);
  assert.equal(out.experience[0].extra, undefined);
  assert.equal(out.candidate.name, "");
  assert.equal(out.junkKey, undefined);
});
check("a non-object answer is rejected", () => {
  assert.equal(ExtractionSchema.safeParse("hello").success, false);
});

console.log("Scoring");
const analysis = buildAnalysis(ExtractionSchema.parse(CANNED), { now: NOW });
const byName = Object.fromEntries(analysis.skills.map((s) => [s.name, s]));
check("years of experience: stated and computed", () => {
  assert.equal(analysis.experienceYears.stated, 2);
  assert.equal(analysis.experienceYears.computed, 3);
});
check("Java = listed + 1 role + 1 project + 2 years -> 72 Advanced", () => {
  assert.equal(byName["Java"].score, 72);
  assert.equal(byName["Java"].level, "Advanced");
});
check("a skill only listed scores low", () => {
  assert.equal(byName["Git"].score, 40);
  assert.equal(byName["Git"].level, "Beginner");
});
check("skills carry taxonomy categories", () => {
  assert.equal(byName["Spring Boot"].category, "Backend");
  assert.equal(byName["MongoDB"].category, "Database");
  assert.equal(byName["Docker"].category, "Cloud & DevOps");
});
check("skills only in a project are included (FastAPI)", () => {
  assert.ok(byName["FastAPI"]);
  assert.equal(byName["FastAPI"].evidence.projects, 1);
});
check("duration strings match the UI format", () => {
  assert.equal(analysis.experience[0].duration, "2024 – Present");
  assert.equal(analysis.experience[1].duration, "2023 – 2024");
  assert.equal(analysis.education[0].duration, "2021 – 2025");
});
check("no scores above 100 and list sorted by score", () => {
  const scores = analysis.skills.map((s) => s.score);
  assert.ok(scores.every((s) => s <= 100));
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
});

console.log("LLM call flow (fake client)");
function fakeClient(replies) {
  let calls = 0;
  return {
    get calls() { return calls; },
    chat: { completions: { create: async () => ({ choices: [{ message: { content: replies[calls++] } }] }) } },
  };
}
const validReply = JSON.stringify(CANNED);

async function asyncChecks() {
  try {
    const ok = fakeClient(["```json\n" + validReply + "\n```"]);
    const r1 = await extractResume("some resume text", { client: ok, now: NOW });
    assert.equal(r1.meta.attempts, 1);
    assert.ok(r1.analysis.skills.length > 10);
    passed++; console.log("  ok   code fences around JSON are tolerated");
  } catch (e) { console.log("  FAIL fences", e.message); process.exitCode = 1; }

  try {
    const flaky = fakeClient(["this is not json", validReply]);
    const r2 = await extractResume("some resume text", { client: flaky, now: NOW });
    assert.equal(r2.meta.attempts, 2);
    passed++; console.log("  ok   invalid JSON triggers one retry");
  } catch (e) { console.log("  FAIL retry", e.message); process.exitCode = 1; }

  try {
    const bad = fakeClient(["nope", "still nope"]);
    await extractResume("some resume text", { client: bad, now: NOW });
    throw new Error("should have thrown");
  } catch (e) {
    if (e instanceof ExtractionError && e.code === "INVALID_MODEL_OUTPUT") { passed++; console.log("  ok   gives up cleanly after the retry"); }
    else { console.log("  FAIL give-up", e.message); process.exitCode = 1; }
  }

  try {
    await extractResume("   ", { client: fakeClient([]) });
    throw new Error("should have thrown");
  } catch (e) {
    if (e instanceof ExtractionError && e.code === "EMPTY_TEXT") { passed++; console.log("  ok   empty text is rejected"); }
    else { console.log("  FAIL empty", e.message); process.exitCode = 1; }
  }

  console.log(`\n${passed} checks passed${process.exitCode ? " (some FAILED)" : ""}`);
}
await asyncChecks();