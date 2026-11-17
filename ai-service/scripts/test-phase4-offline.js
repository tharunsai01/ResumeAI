// Offline checks for Phase 4: no API key, no network and no embedding model needed.
// A tiny word-hashing "embedder" stands in for the real model to test the plumbing.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { ExtractionSchema } from "../src/extraction/schema.js";
import { buildAnalysis } from "../src/extraction/extractResume.js";
import { scoreMatch } from "../src/matching/scoreMatch.js";
import { normalizeJob } from "../src/matching/jobSchema.js";
import { resumeSemanticText, jobSemanticText } from "../src/semantic/semanticText.js";
import {
  cosine,
  cosineToScore,
  semanticSimilarity,
  scoreMatchSemantic,
  screenCandidatesSemantic,
} from "../src/semantic/semanticScore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jobs = JSON.parse(readFileSync(path.join(__dirname, "..", "samples", "jobs.json"), "utf8"));
const job = (id) => jobs.find((j) => j.id === id);
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
    { name: "AI Resume Screening System", techStack: ["Python", "FastAPI", "React", "MongoDB"], description: "AI-powered recruitment platform." },
    { name: "E-Commerce Microservices", techStack: ["Java", "Spring Boot", "Docker", "AWS"], description: "Scalable e-commerce backend." },
  ],
};
const PRIYA_FACTS = {
  candidate: { name: "Priya Verma", email: "priya@example.com", location: "Pune, India" },
  statedExperienceYears: 1,
  skillsSection: ["HTML", "CSS", "JavaScript", "React"],
  experience: [
    { title: "Junior Frontend Developer", company: "Pixel Labs", startYear: 2025, endYear: null, isCurrent: true, bullets: ["Built responsive UI components in React", "Collaborated with designers on a component library"], technologies: ["React", "JavaScript", "HTML", "CSS"] },
  ],
  education: [{ degree: "B.Sc Computer Science", institution: "Pune University", startYear: 2021, endYear: 2024 }],
  projects: [],
};
const analyse = (facts) => buildAnalysis(ExtractionSchema.parse(facts), { now: NOW });
const rahul = analyse(RAHUL_FACTS);
const priya = analyse(PRIYA_FACTS);

// Toy embedder: hashes words into 256 buckets. Texts that share words are similar.
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
function toyEmbedder(counter) {
  return async (texts) => {
    counter.calls++;
    return texts.map(toyVector);
  };
}

console.log("Similarity maths");
await check("cosine of identical and unrelated vectors", () => {
  assert.equal(Math.round(cosine([1, 0], [1, 0])), 1);
  assert.equal(cosine([1, 0], [0, 1]), 0);
  assert.equal(cosine([0, 0], [1, 0]), 0);
});
await check("cosine -> 0-100 calibration (low 0.2, high 0.7)", () => {
  assert.equal(cosineToScore(0.2), 0);
  assert.equal(cosineToScore(0.7), 100);
  assert.equal(cosineToScore(0.45), 50);
  assert.equal(cosineToScore(-0.3), 0);
  assert.equal(cosineToScore(0.95), 100);
});

console.log("Texts that get embedded");
await check("the resume text is blind: no name, email, location, company or institution", () => {
  const text = resumeSemanticText(rahul);
  assert.ok(text.includes("Software Developer"));
  assert.ok(text.includes("Java"));
  for (const hidden of ["Rahul", "Kumar", "rahul@example.com", "Bangalore", "ABC Technologies", "XYZ Solutions", "ABC University"]) {
    assert.ok(!text.includes(hidden), `text must not contain "${hidden}"`);
  }
});
await check("the job text has title, skills, description and responsibilities", () => {
  const text = jobSemanticText(normalizeJob(job("job_101")));
  assert.ok(text.startsWith("Software Engineer."));
  assert.ok(text.includes("Required skills: React, Node.js, MongoDB, TypeScript."));
  assert.ok(text.includes("full-stack web applications"));
  assert.ok(text.includes("RESTful APIs"));
});
await check("texts are capped in length", () => {
  const long = normalizeJob({ title: "Dev", description: "x ".repeat(5000) });
  assert.ok(jobSemanticText(long).length <= 1500);
});

console.log("Blending into roleSimilarity");
await check("no semantic score -> rule-based only (same as Phase 3)", () => {
  const plain = scoreMatch({ analysis: rahul }, job("job_101"));
  assert.equal(plain.roleSimilarity, 100);
  assert.equal(plain.semanticCosine, null);
  assert.equal(plain.overallMatch, 87);
});
await check("blend = 60% semantic + 40% rule-based", () => {
  const low = scoreMatch({ analysis: rahul }, job("job_101"), { semantic: { score: 0, cosine: 0.1 } });
  assert.equal(low.roleSimilarity, 40);
  assert.equal(low.semanticCosine, 0.1);
  assert.ok(low.overallMatch < 87);
  const high = scoreMatch({ analysis: rahul }, job("job_101"), { semantic: { score: 100, cosine: 0.8 } });
  assert.equal(high.roleSimilarity, 100);
  const custom = scoreMatch({ analysis: rahul }, job("job_101"), { semantic: { score: 0, cosine: 0.1 }, semanticBlend: 1 });
  assert.equal(custom.roleSimilarity, 0);
});
await check("when the rule-based score is unavailable the semantic score is used", () => {
  const vague = { id: "x", title: "", requiredSkills: ["Kafka"], preferredSkills: [], experience: "", education: "" };
  assert.equal(scoreMatch({ analysis: rahul }, vague).roleSimilarity, null);
  assert.equal(scoreMatch({ analysis: rahul }, vague, { semantic: { score: 70, cosine: 0.55 } }).roleSimilarity, 70);
});

console.log("Embedding flow (toy embedder)");
await check("one embedding call covers the job and all resumes", async () => {
  const counter = { calls: 0 };
  const ranked = await screenCandidatesSemantic(
    [{ id: "rahul", analysis: rahul }, { id: "priya", analysis: priya }],
    job("job_101"),
    { embedder: toyEmbedder(counter) }
  );
  assert.equal(counter.calls, 1);
  assert.equal(ranked.length, 2);
  assert.ok(ranked.every((r) => typeof r.semanticCosine === "number"));
});
await check("the better fit still ranks first", async () => {
  const people = [{ id: "rahul", analysis: rahul }, { id: "priya", analysis: priya }];
  const embedder = toyEmbedder({ calls: 0 });
  assert.equal((await screenCandidatesSemantic(people, job("job_101"), { embedder }))[0].id, "rahul");
  assert.equal((await screenCandidatesSemantic(people, job("job_103"), { embedder }))[0].id, "priya");
});
await check("a related job is more similar than an unrelated one", async () => {
  const embedder = toyEmbedder({ calls: 0 });
  const nurse = { id: "n", title: "Registered Nurse", requiredSkills: [], preferredSkills: [], experience: "", education: "", description: "Care for patients on a hospital ward and administer medication." };
  const related = await semanticSimilarity({ analysis: rahul }, job("job_101"), { embedder });
  const unrelated = await semanticSimilarity({ analysis: rahul }, nurse, { embedder });
  assert.ok(related.cosine > unrelated.cosine);
});
await check("if embeddings fail, scoring falls back to rule-based and does not crash", async () => {
  const warn = console.warn;
  console.warn = () => {};
  try {
    const broken = async () => {
      throw new Error("model could not be downloaded");
    };
    assert.equal(await semanticSimilarity({ analysis: rahul }, job("job_101"), { embedder: broken }), null);
    const result = await scoreMatchSemantic({ analysis: rahul }, job("job_101"), { embedder: broken });
    assert.deepEqual(result, scoreMatch({ analysis: rahul }, job("job_101")));
  } finally {
    console.warn = warn;
  }
});

console.log(`\n${passed} checks passed${process.exitCode ? " (some FAILED)" : ""}`);