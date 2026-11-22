// Offline checks for Phase 3: no API key and no network needed.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { ExtractionSchema } from "../src/extraction/schema.js";
import { buildAnalysis } from "../src/extraction/extractResume.js";
import { scoreMatch, screenCandidates, resolveWeights } from "../src/matching/scoreMatch.js";
import { normalizeJob, MatchError } from "../src/matching/jobSchema.js";
import { keywordMatch } from "../src/matching/similarity.js";
import {
  parseExperienceRange,
  experienceScore,
  requiredEducationLevel,
  candidateEducationLevel,
  educationScore,
} from "../src/matching/parsers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jobs = JSON.parse(readFileSync(path.join(__dirname, "..", "samples", "jobs.json"), "utf8"));
const job = (id) => jobs.find((j) => j.id === id);
const NOW = new Date("2026-11-17");

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

const RAHUL_FACTS = {
  candidate: { name: "Rahul Kumar", email: "rahul@example.com", location: "Bangalore, India" },
  statedExperienceYears: 2,
  skillsSection: ["Java", "Python", "C++", "JavaScript", "TypeScript", "React", "Node.js", "Express", "Spring Boot", "REST API", "MongoDB", "SQL", "AWS", "Docker", "Linux", "Git"],
  experience: [
    { title: "Software Developer", company: "ABC Technologies", startYear: 2024, endYear: null, isCurrent: true, bullets: [], technologies: ["Java", "Spring Boot", "REST API", "React", "MongoDB"] },
    { title: "Software Intern", company: "XYZ Solutions", startYear: 2023, endYear: 2024, isCurrent: false, bullets: [], technologies: [] },
  ],
  education: [{ degree: "B.Tech in Computer Science", institution: "ABC University", startYear: 2021, endYear: 2025 }],
  projects: [
    { name: "AI Resume Screening System", techStack: ["Python", "FastAPI", "React", "MongoDB"], description: "" },
    { name: "E-Commerce Microservices", techStack: ["Java", "Spring Boot", "Docker", "AWS"], description: "" },
  ],
};
const PRIYA_FACTS = {
  candidate: { name: "Priya Verma", email: "priya@example.com", location: "Pune, India" },
  statedExperienceYears: 1,
  skillsSection: ["HTML", "CSS", "JavaScript", "React"],
  experience: [
    { title: "Junior Frontend Developer", company: "Pixel Labs", startYear: 2025, endYear: null, isCurrent: true, bullets: [], technologies: ["React", "JavaScript", "HTML", "CSS"] },
  ],
  education: [{ degree: "B.Sc Computer Science", institution: "Pune University", startYear: 2021, endYear: 2024 }],
  projects: [],
};
const analyse = (facts) => buildAnalysis(ExtractionSchema.parse(facts), { now: NOW });
const rahul = analyse(RAHUL_FACTS);
const priya = analyse(PRIYA_FACTS);

console.log("Experience parsing");
check("ranges and plus signs", () => {
  assert.deepEqual(parseExperienceRange("2–4 years"), { min: 2, max: 4 });
  assert.deepEqual(parseExperienceRange("0–2 Years"), { min: 0, max: 2 });
  assert.deepEqual(parseExperienceRange("5+ Years"), { min: 5, max: null });
  assert.deepEqual(parseExperienceRange("3 years"), { min: 3, max: null });
  assert.deepEqual(parseExperienceRange("Fresher"), { min: 0, max: 1 });
  assert.equal(parseExperienceRange(""), null);
  assert.equal(parseExperienceRange("senior"), null);
});
check("experience score", () => {
  const range = { min: 2, max: 4 };
  assert.equal(experienceScore(2, range), 100);
  assert.equal(experienceScore(1, range), 50);
  assert.equal(experienceScore(0, { min: 0, max: 2 }), 100);
  assert.equal(experienceScore(3, { min: 0, max: 2 }), 90);
  assert.equal(experienceScore(9, { min: 0, max: 2 }), 70);
  assert.equal(experienceScore(10, { min: 5, max: null }), 100);
  assert.equal(experienceScore(2, null), null);
});

console.log("Education parsing");
check("required level", () => {
  assert.equal(requiredEducationLevel("B.Tech/B.E. in Computer Science or equivalent"), 3);
  assert.equal(requiredEducationLevel("B.Tech/M.Tech in Computer Science, AI or a related field"), 3);
  assert.equal(requiredEducationLevel("Master's degree in Computer Science"), 4);
  assert.equal(requiredEducationLevel("Bachelor's degree in Computer Science or a related field"), 3);
  assert.equal(requiredEducationLevel("Any graduate degree"), 3);
  assert.equal(requiredEducationLevel(""), null);
  assert.equal(requiredEducationLevel("Must be able to work in a team"), null);
});
check("candidate level", () => {
  assert.equal(candidateEducationLevel(["B.Tech in Computer Science"]), 3);
  assert.equal(candidateEducationLevel(["B.Com"]), 3);
  assert.equal(candidateEducationLevel(["Diploma in IT"]), 2);
  assert.equal(candidateEducationLevel(["MBA", "B.Tech"]), 4);
  assert.equal(candidateEducationLevel([]), 0);
});
check("education score", () => {
  assert.equal(educationScore("B.Tech/B.E. in Computer Science or equivalent", ["B.Tech in Computer Science"]), 100);
  assert.equal(educationScore("Master's degree in Computer Science", ["B.Tech in Computer Science"]), 72);
  assert.equal(educationScore("Bachelor's degree in Computer Science", ["B.Com"]), 82);
  assert.equal(educationScore("Bachelor's degree in Computer Science or related", ["B.Com"]), 91);
  assert.equal(educationScore("Bachelor's degree", []), 0);
  assert.equal(educationScore("", ["B.Tech"]), null);
});

console.log("Job input");
check("skills are normalised and de-duplicated", () => {
  const normalised = normalizeJob({ id: 7, title: "Dev", requiredSkills: ["reactjs", "Node"], preferredSkills: ["React", "Kafka"] });
  assert.equal(normalised.id, "7");
  assert.deepEqual(normalised.required.map((s) => s.name), ["React", "Node.js"]);
  assert.deepEqual(normalised.preferred.map((s) => s.name), ["Kafka"]);
});
check("an invalid job is rejected", () => {
  assert.throws(() => normalizeJob(null), (e) => e instanceof MatchError && e.code === "INVALID_JOB");
});

console.log("Matching: Rahul");
const r101 = scoreMatch({ analysis: rahul }, job("job_101"));
check("Software Engineer: strong match", () => {
  assert.equal(r101.overallMatch, 87);
  assert.equal(r101.screeningStatus, "Strong Match");
  assert.equal(r101.meetsThreshold, true);
  assert.equal(r101.skillMatch, 73);
  assert.equal(r101.experienceMatch, 100);
  assert.equal(r101.educationMatch, 100);
  assert.equal(r101.roleSimilarity, 100);
  assert.equal(r101.experience, "2 years");
});
check("skill match types follow the evidence", () => {
  const type = (name) => r101.skills.find((s) => s.name === name);
  assert.equal(type("React").matchType, "Matched");
  assert.equal(type("Node.js").matchType, "Partial"); // listed, never used
  assert.equal(type("GraphQL").matchType, "Missing");
  assert.equal(type("GraphQL").proficiency, "None");
  assert.equal(type("React").required, true);
  assert.equal(type("AWS").required, false);
});
check("strengths and gaps are written out", () => {
  assert.ok(r101.matchedStrengths.some((s) => s.includes("fits the 2–4 years")));
  assert.ok(r101.potentialGaps.some((s) => s.includes("Node.js") && s.includes("no evidence")));
  assert.ok(r101.potentialGaps.some((s) => s.includes("GraphQL")));
});
check("other jobs score lower and use the right status", () => {
  const ai = scoreMatch({ analysis: rahul }, job("job_102"));
  assert.equal(ai.screeningStatus, "Low Match");
  assert.ok(ai.overallMatch < r101.overallMatch);
  assert.ok(ai.potentialGaps.some((s) => s.includes("Missing required skills")));
});

console.log("Weights");
check("custom weights change the result", () => {
  const onlySkills = scoreMatch({ analysis: rahul }, job("job_101"), { weights: { skills: 1, experience: 0, education: 0, roleSimilarity: 0 } });
  assert.equal(onlySkills.overallMatch, 73);
});
check("bad or all-zero weights fall back to the defaults", () => {
  assert.deepEqual(resolveWeights({ skills: "abc", experience: -1 }), { skills: 0.5, experience: 0.2, education: 0.1, roleSimilarity: 0.2 });
  const zero = scoreMatch({ analysis: rahul }, job("job_101"), { weights: { skills: 0, experience: 0, education: 0, roleSimilarity: 0 } });
  assert.equal(zero.overallMatch, 87);
});
check("a component the job does not describe is skipped and weights are rescaled", () => {
  const noEducation = scoreMatch({ analysis: rahul }, { ...job("job_101"), education: "" });
  assert.equal(noEducation.educationMatch, null);
  assert.equal(noEducation.weightsUsed.education, undefined);
  assert.equal(noEducation.overallMatch, 85);
});
check("the threshold can be changed", () => {
  const strict = scoreMatch({ analysis: rahul }, job("job_101"), { threshold: 90 });
  assert.equal(strict.screeningStatus, "Potential Match");
  assert.equal(strict.meetsThreshold, false);
});

console.log("Experience claims");
check("a stated number cannot beat what the dates show", () => {
  const inflated = analyse({ ...RAHUL_FACTS, statedExperienceYears: 10, experience: [RAHUL_FACTS.experience[1]] });
  const result = scoreMatch({ analysis: inflated }, job("job_101"));
  assert.equal(result.experience, "1 year");
  assert.equal(result.experienceMatch, 50);
});
check("stated years without dated roles are used but flagged", () => {
  const undated = analyse({ ...RAHUL_FACTS, statedExperienceYears: 2, experience: [] });
  const result = scoreMatch({ analysis: undated }, job("job_101"));
  assert.equal(result.experience, "2 years");
  assert.ok(result.potentialGaps.some((s) => s.includes("not backed by dated roles")));
});

console.log("Fairness basics");
check("name, email, location, company and institution do not change any score", () => {
  const other = structuredClone(rahul);
  other.candidate = { name: "Someone Else", email: "x@y.z", location: "Elsewhere" };
  other.experience.forEach((role) => (role.company = "Another Company"));
  other.education.forEach((e) => (e.institution = "Another University"));
  for (const j of jobs) {
    assert.deepEqual(scoreMatch({ analysis: other }, j), scoreMatch({ analysis: rahul }, j));
  }
});

console.log("Ranking");
check("the better fit ranks first for each job", () => {
  const people = [
    { id: "rahul", analysis: rahul },
    { id: "priya", analysis: priya },
  ];
  assert.equal(screenCandidates(people, job("job_101"))[0].id, "rahul");
  assert.equal(screenCandidates(people, job("job_103"))[0].id, "priya");
});
check("Priya is a strong frontend match", () => {
  const result = scoreMatch({ analysis: priya }, job("job_103"));
  assert.equal(result.screeningStatus, "Strong Match");
});

console.log("Keyword match");
check("finds skills written in the text", () => {
  assert.equal(keywordMatch("Built APIs with GraphQL.", [], [{ name: "GraphQL" }]), 100);
  assert.equal(keywordMatch("I use JavaScript daily", [], [{ name: "Java" }]), 0);
  assert.equal(keywordMatch("Ready to go to market", [], [{ name: "Go" }]), 0);
  assert.equal(keywordMatch("Built services in Go.", [], [{ name: "Go" }]), 100);
  assert.equal(keywordMatch("", [], []), null);
});

console.log("Keyword-stuffing guard");
const EXTRA_SKILLS = ["Angular", "Vue.js", "Django", "Flask", "Go", "Rust", "Kotlin", "Swift", "PHP", "Ruby", "Scala", "Kubernetes", "Terraform", "Jenkins", "Ansible", "Azure", "Redis", "MySQL", "Elasticsearch", "GraphQL", "gRPC", "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy", "LLMs", "LangChain", "Tableau", "Power BI", "Apache Spark", "Machine Learning", "Deep Learning", "NLP", "Selenium", "Jest", "Webpack", "Redux", "Bootstrap", "Next.js"];
const stuffed = analyse({ ...RAHUL_FACTS, skillsSection: [...RAHUL_FACTS.skillsSection, ...EXTRA_SKILLS] });
check("a normal number of listed-only skills is not penalised", () => {
  assert.equal(r101.skillMatch, 73); // Rahul lists 9 skills without evidence, below the cap of 12
});
check("forty extra listed skills do not raise the score, and the result says why", () => {
  const result = scoreMatch({ analysis: stuffed }, job("job_101"));
  assert.ok(result.overallMatch <= r101.overallMatch, `${result.overallMatch} vs ${r101.overallMatch}`);
  assert.ok(result.potentialGaps.some((g) => g.includes("listed without evidence of use, so each one counts for less")));
});
check("skills with real evidence are not affected by the guard", () => {
  const result = scoreMatch({ analysis: stuffed }, job("job_101"));
  assert.equal(result.skills.find((s) => s.name === "React").matchType, "Matched");
  assert.equal(result.skills.find((s) => s.name === "MongoDB").matchType, "Matched");
});

console.log(`\n${passed} checks passed${process.exitCode ? " (some FAILED)" : ""}`);