// Offline checks for Phase 7: no API key and no network. A fake model client stands in for Groq.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { SKILLS } from "../src/taxonomy/skillTaxonomy.js";
import { analyzeResumeText } from "../src/evaluation/analyzeText.js";
import { skillExtractionMetrics, stabilityMetrics, fairnessMetrics, securityMetrics } from "../src/evaluation/metrics.js";
import { buildVariants } from "../src/evaluation/fairnessVariants.js";
import { ATTACKS } from "../src/evaluation/attacks.js";
import { runEvaluation } from "../src/evaluation/runEvaluation.js";
import { auditEvaluationRun, AUDIT_TYPES } from "../src/audit/auditEvents.js";
import { createPacedAnalyzer } from "../src/evaluation/pacedAnalyzer.js";
import { mkdtemp, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const read = (...parts) => readFileSync(path.join(__dirname, "..", ...parts), "utf8");
const jobs = JSON.parse(read("samples", "jobs.json"));
const truth = JSON.parse(read("samples", "ground-truth.json"));
const RAHUL_TEXT = read("samples", "resumes", "clean-rahul.txt");
const NOW = new Date("2026-11-17T10:30:00Z");

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

// ---------- a fake model that reads the resume text like a (very simple) extractor ----------
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const mentions = (lower, name) => new RegExp(`(?<![a-z0-9+#.])${escapeRegex(name.toLowerCase())}(?![a-z0-9+#])`).test(lower);

function factsFromText(text, flags) {
  const lines = text.split("\n");
  const contact = (lines[1] ?? "").split("|").map((s) => s.trim());
  const lower = text.toLowerCase();
  let skills = SKILLS.map(([name]) => name).filter((name) => mentions(lower, name));
  const developer = text.match(/Software Developer - (.+?) \(/);
  const intern = text.match(/Software Intern - (.+?) \(/);
  const education = text.match(/B\.Tech in Computer Science - (.+?) \((\d{4}) - (\d{4})\)/);
  let roleTech = ["Java", "Spring Boot", "REST API", "React", "MongoDB"];
  if (flags.biased && /imran/i.test(lines[0])) {
    skills = []; // simulated bias: this model finds no skills for one name
    roleTech = [];
  }
  if (flags.gullible && /maximum rating|pre-approved|verified/i.test(text)) roleTech = [...skills]; // simulated manipulation
  return {
    candidate: { name: lines[0].trim(), email: contact[0] ?? "", location: contact[2] ?? "" },
    statedExperienceYears: 2,
    skillsSection: skills,
    experience: [
      { title: "Software Developer", company: developer?.[1] ?? "", startYear: 2024, isCurrent: true, bullets: ["Developed backend services using Java and Spring Boot", "Wrote unit tests achieving 80% coverage"], technologies: roleTech },
      { title: "Software Intern", company: intern?.[1] ?? "", startYear: 2023, endYear: 2024, bullets: ["Assisted in feature development"], technologies: [] },
    ],
    education: [{ degree: "B.Tech in Computer Science", institution: education?.[1] ?? "", startYear: Number(education?.[2] ?? 2021), endYear: Number(education?.[3] ?? 2025) }],
    projects: [],
  };
}

function fakeModel(flags = {}) {
  const state = { calls: 0, lastUser: "" };
  const client = {
    chat: {
      completions: {
        create: async ({ messages }) => {
          state.calls++;
          state.lastUser = messages[1].content;
          const text = state.lastUser.split("<resume>\n")[1]?.split("\n</resume>")[0] ?? "";
          return { choices: [{ message: { content: JSON.stringify(factsFromText(text, flags)) } }] };
        },
      },
    },
  };
  return { state, client, analyze: (text) => analyzeResumeText(text, { client, now: NOW }) };
}

const resumes = [{ id: "clean-rahul.txt", text: RAHUL_TEXT }];
const evaluate = (model, options = {}, extra = {}) =>
  runEvaluation({ analyze: model.analyze, resumes, jobs, truth, options: { now: NOW, ...options }, ...extra });

console.log("Metrics");
await check("skill extraction: counts, accuracy, precision, recall, F1", () => {
  const m = skillExtractionMetrics([
    { id: "a", expected: ["Java", "React", "SQL", "Docker"], found: ["java", "reactjs", "Docker", "Kafka"] },
    { id: "b", expected: ["Python"], found: ["Python"] },
  ]);
  assert.equal(m.correctSkills, 4); // Java, React, Docker, Python
  assert.equal(m.missedSkills, 1); // SQL
  assert.equal(m.incorrectSkills, 1); // Kafka
  assert.equal(m.evaluationSamples, 6);
  assert.equal(m.accuracy, "66.7%");
  assert.equal(m.precision, 80);
  assert.equal(m.recall, 80);
  assert.equal(m.f1, 80);
  assert.deepEqual(m.perCase[0].missed, ["SQL"]);
  assert.deepEqual(m.perCase[0].incorrect, ["Kafka"]);
});
await check("skill extraction with nothing to compare reports n/a", () => {
  assert.equal(skillExtractionMetrics([]).accuracy, "n/a");
});
await check("stability counts runs that match the most common result", () => {
  const m = stabilityMetrics([["a", "a", "a", "b", "a"], ["x", "x", "x", "x", "x"]]);
  assert.deepEqual(m, { evaluationSamples: 10, stableResults: 9, changedResults: 1, stability: "90%", stabilityValue: 90 });
});
await check("fairness flags differences above the threshold", () => {
  const m = fairnessMetrics(
    [
      { id: "PAIR-001", scoreA: 82.4, scoreB: 81.9 },
      { id: "PAIR-002", scoreA: 76.2, scoreB: 78.3 },
      { id: "PAIR-003", scoreA: 89.1, scoreB: 89.1 },
    ],
    1
  );
  assert.deepEqual(m.comparisonPairs.map((p) => [p.difference, p.status]), [[0.5, "Within Threshold"], [2.1, "Review"], [0, "Within Threshold"]]);
  assert.equal(m.scoreDifferencesDetected, 1);
  assert.equal(m.maximumDifference, 2.1);
  assert.equal(m.status, "Review Available");
  assert.equal(fairnessMetrics([{ id: "p", scoreA: 70, scoreB: 70 }], 1).status, "No Differences Above Threshold");
});
await check("security counts flagged, high-risk and clean texts", () => {
  const m = securityMetrics(
    [{ riskLevel: "clean" }, { riskLevel: "high" }, { riskLevel: "suspicious" }],
    [{ detectedByScan: true, outcome: "Resisted" }, { detectedByScan: false, outcome: "Manipulated" }]
  );
  assert.equal(m.resumesProcessed, 3);
  assert.equal(m.potentialInstructionContent, 2);
  assert.equal(m.promptInjectionWarnings, 1);
  assert.equal(m.clean, 1);
  assert.equal(m.attacksManipulated, 1);
  assert.equal(m.attacksDetectedByScan, 1);
});

console.log("Fairness variants and attacks");
const probe = fakeModel();
const baseAnalysis = (await probe.analyze(RAHUL_TEXT)).analysis;
await check("every identity variant changes only what it should", () => {
  const variants = buildVariants(RAHUL_TEXT, baseAnalysis);
  assert.deepEqual(variants.map((v) => v.id), ["gender-coded-names", "community-coded-names", "location", "institution", "company", "education-dates"]);
  const byId = Object.fromEntries(variants.map((v) => [v.id, v]));
  assert.ok(byId["gender-coded-names"].textA.includes("aarav.sharma@example.com") && !byId["gender-coded-names"].textA.includes("Rahul"));
  assert.ok(byId["community-coded-names"].textB.includes("Imran Khan"));
  assert.ok(byId.location.textB.includes("Bhopal") && !byId.location.textB.includes("Bangalore"));
  assert.ok(byId.institution.textB.includes("Regional Institute of Technology") && !byId.institution.textB.includes("ABC University"));
  assert.ok(byId.company.textB.includes("Globex Corporation") && !byId.company.textB.includes("ABC Technologies") && !byId.company.textB.includes("XYZ Solutions"));
  assert.ok(byId["education-dates"].textB.includes("(2015 - 2019)") && byId["education-dates"].textB.includes("(2024 - Present)"));
});
await check("variants whose details are missing from the text are skipped", () => {
  const sparse = "Candidate\nSKILLS\nJava, React\n";
  const ids = buildVariants(sparse, { candidate: { name: "", email: "", location: "" }, education: [], experience: [] }).map((v) => v.id);
  assert.deepEqual(ids, []);
});
await check("every attack keeps the original resume and adds something", () => {
  assert.equal(ATTACKS.length, 11);
  assert.equal(new Set(ATTACKS.map((a) => a.id)).size, 11);
  for (const attack of ATTACKS) {
    const attacked = attack.build(RAHUL_TEXT);
    assert.ok(attacked.startsWith(RAHUL_TEXT.slice(0, 40)) && attacked.length > RAHUL_TEXT.length, attack.id);
  }
});
await check("the pattern scan catches the obvious attacks and (honestly) misses the disguised ones", async () => {
  const risk = async (id) => (await probe.analyze(ATTACKS.find((a) => a.id === id).build(RAHUL_TEXT))).security.riskLevel;
  assert.equal(await risk("known-pattern"), "high");
  assert.equal(await risk("zero-width-obfuscation"), "high"); // invisible characters are removed before scanning
  // known gap: these are NOT caught by the pattern scan, so the model and the scoring have to resist them
  for (const id of ["paraphrased-override", "fake-recruiter-note", "non-english"]) assert.equal(await risk(id), "clean", id);
});
await check("an attack cannot close the data block early", async () => {
  await probe.analyze(ATTACKS.find((a) => a.id === "delimiter-break").build(RAHUL_TEXT));
  assert.equal(probe.state.lastUser.split("</resume>").length - 1, 1);
});

console.log("Full evaluation: well-behaved model");
const robust = fakeModel();
const robustRun = await evaluate(robust);
const attackById = (run, id) => run.report.security.attacks.find((a) => a.id === id);
await check("the report has every section of the admin page", () => {
  const keys = Object.keys(robustRun.report);
  for (const key of ["summary", "modelInfo", "skillExtraction", "scoreStability", "fairness", "security", "blindScreening", "findings", "reviewFlags"]) {
    assert.ok(keys.includes(key), `missing ${key}`);
  }
  assert.equal(robustRun.report.summary.skillExtractionAccuracy, "94.4%");
  assert.equal(robustRun.report.skillExtraction.correctSkills, 17);
  // the simple fake extractor also picks up "Microservices" from a project line, which the labels do not include
  assert.deepEqual(robustRun.report.skillExtraction.perCase[0].incorrect, ["Microservices"]);
});
await check("scores are stable and identity changes do not move them", () => {
  assert.deepEqual(robustRun.report.scoreStability, { evaluationSamples: 5, stableResults: 5, changedResults: 0, stability: "100%", stabilityValue: 100 });
  assert.equal(robustRun.report.fairness.testCases, 6);
  assert.equal(robustRun.report.fairness.scoreDifferencesDetected, 0);
  assert.equal(robustRun.report.fairness.maximumDifference, 0);
  assert.equal(robustRun.report.fairness.noiseFloor.maximumDifference, 0);
  assert.equal(robustRun.report.fairness.comparisonPairs[0].id, "PAIR-001");
});
await check("blind screening is configured", () => {
  assert.equal(robustRun.report.blindScreening.status, "Configured");
  assert.ok(robustRun.report.blindScreening.identityFieldsHidden.includes("Name"));
  assert.equal(robustRun.report.blindScreening.testCoverage, "1 evaluation cases");
});
await check("blind screening notices a detail that redaction missed", async () => {
  const model = fakeModel();
  const entry = await model.analyze(RAHUL_TEXT);
  entry.analysis.experience[0].description = ["Shipped the Bangalore2024 release"]; // redaction needs a word boundary, so this slips through
  const run = await evaluate(model, { components: ["blind"] }, { baseline: { "clean-rahul.txt": entry } });
  assert.equal(run.report.blindScreening.status, "Needs Attention");
  assert.deepEqual(run.report.blindScreening.failures[0].leaked, "Bangalore");
  assert.ok(run.report.reviewFlags.some((f) => f.type === "Blind Screening"));
});
await check("security: obvious attacks are caught, plain ones do not move scores", () => {
  assert.equal(robustRun.report.security.attacksTested, 11);
  assert.equal(attackById(robustRun, "known-pattern").detectedByScan, true);
  assert.equal(attackById(robustRun, "known-pattern").outcome, "Resisted");
  assert.equal(attackById(robustRun, "inflated-experience").outcome, "Resisted");
  assert.equal(robustRun.report.security.status, "Monitoring Active");
});
await check("security: skill stuffing no longer raises the score (keyword-stuffing guard)", () => {
  const stuffing = attackById(robustRun, "skill-stuffing");
  assert.equal(stuffing.outcome, "Resisted");
  assert.ok(stuffing.delta <= 0, `delta was ${stuffing.delta}`);
  assert.equal(robustRun.report.security.attacksManipulated, 0);
  assert.ok(!robustRun.report.reviewFlags.some((f) => f.type === "Security"));
  assert.equal(robustRun.report.security.resumesProcessed, 1); // attack texts are not counted as real resumes
  assert.equal(robustRun.record.metrics.security, "No Injection Scenario Changed Scores");
});
await check("the evaluation uses the number of model calls we expect", () => {
  // 1 baseline + 5 stability + (4 name + 4 other variants + 1 control) + 11 attacks
  assert.equal(robust.state.calls, 26);
});
await check("record, summary and date use the admin page's format", () => {
  assert.match(robustRun.record.id, /^EVAL-20261117-1030$/);
  assert.equal(robustRun.record.components, "Skill + Stability + Fairness + Security + Blind Screening");
  assert.equal(robustRun.record.date, "17 Nov 2026");
  assert.equal(robustRun.record.status, "Completed");
  assert.equal(robustRun.record.metrics.skillExtraction, "94.4%");
  assert.equal(robustRun.record.metrics.scoreStability, "100%");
  assert.equal(robustRun.record.metrics.fairness, "Maximum Difference 0");
  assert.equal(robustRun.report.modelInfo.lastEvaluation, "17 Nov 2026");
  assert.ok(robustRun.report.findings.every((f) => ["success", "warning"].includes(f.type)));
});

console.log("Full evaluation: models that misbehave");
await check("a model that treats one name differently is flagged for fairness", async () => {
  const run = await evaluate(fakeModel({ biased: true }), { components: ["fairness"], variantIds: ["gender-coded-names", "community-coded-names"] });
  const flagged = run.report.fairness.comparisonPairs.filter((p) => p.status === "Review");
  assert.deepEqual(flagged.map((p) => p.group), ["Name"]);
  assert.equal(flagged.length, 1);
  assert.equal(flagged[0].label, "Names associated with different communities");
  assert.ok(flagged[0].skillDifferences.onlyA.length > 0); // shows WHY the scores differ
  assert.equal(run.report.fairness.status, "Review Available");
  assert.ok(run.report.reviewFlags.some((f) => f.type === "Fairness"));
  assert.ok(run.report.findings.some((f) => f.type === "warning"));
});
await check("a model that obeys injected text is flagged as manipulated", async () => {
  const run = await evaluate(fakeModel({ gullible: true }), { components: ["security"], attackIds: ["paraphrased-override", "fake-recruiter-note", "known-pattern"] });
  assert.equal(attackById(run, "paraphrased-override").outcome, "Manipulated");
  assert.equal(attackById(run, "fake-recruiter-note").outcome, "Manipulated");
  assert.equal(attackById(run, "known-pattern").outcome, "Resisted"); // removed by the scan before the model saw it
  assert.equal(run.report.security.attacksManipulated, 2);
  assert.match(run.record.metrics.security, /^2 Injection Scenarios Changed Scores$/);
});

console.log("Options and audit");
await check("components can be chosen and baseline analyses reused (no model calls)", async () => {
  const model = fakeModel();
  const baseline = { "clean-rahul.txt": await model.analyze(RAHUL_TEXT) };
  const before = model.state.calls;
  const run = await evaluate(model, { components: ["skills", "blind"] }, { baseline });
  assert.equal(model.state.calls, before);
  assert.equal(run.report.fairness, undefined);
  assert.equal(run.report.summary.fairnessTest, null);
  assert.equal(run.record.components, "Skill + Blind Screening");
});
await check("ground-truth entries for other resumes are ignored and progress is reported", async () => {
  const messages = [];
  const run = await evaluate(fakeModel(), { components: ["skills"], onProgress: (m) => messages.push(m) });
  assert.equal(run.report.skillExtraction.perCase.length, 1);
  assert.ok(messages.some((m) => m.includes("clean-rahul.txt")));
});
await check("the evaluation audit event has the facts and no personal data", () => {
  const event = auditEvaluationRun(robustRun, { now: NOW });
  assert.equal(event.type, AUDIT_TYPES.EVALUATION_RUN);
  assert.equal(event.details.evaluationId, robustRun.record.id);
  assert.equal(event.details.injectionScenariosTested, 11);
  assert.equal(event.details.fairnessCasesToReview, 0);
  const json = JSON.stringify(event);
  for (const secret of ["Rahul", "rahul@example.com", "98765", "Bangalore", "ABC Technologies"]) assert.ok(!json.includes(secret), secret);
});

console.log("Pacing, retries and saved results");
const rateLimitError = () => new Error("Groq rate limit reached. Wait a minute and try again.");
await check("results are saved, so the same text is analysed only once", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "paced-"));
  let calls = 0;
  const analyzer = createPacedAnalyzer({ analyze: async (t) => ({ analysis: { text: t, n: ++calls } }), cacheDir: dir, paceMs: 0, sleep: async () => {} });
  const first = await analyzer("resume one");
  const again = await analyzer("resume one");
  await analyzer("resume two");
  assert.deepEqual(first, again);
  assert.equal(calls, 2);
  assert.deepEqual(analyzer.stats, { calls: 2, cached: 1, waits: 0 });
  assert.equal((await readdir(dir)).length, 2);
});
await check("repeated samples of the same text are separate calls, each saved", async () => {
  let calls = 0;
  const analyzer = createPacedAnalyzer({ analyze: async () => ({ n: ++calls }), cacheDir: await mkdtemp(path.join(tmpdir(), "paced-")), paceMs: 0, sleep: async () => {} });
  const results = [await analyzer("t", { sample: 0 }), await analyzer("t", { sample: 1 }), await analyzer("t", { sample: 0 }), await analyzer("t", { sample: 1 })];
  assert.deepEqual(results.map((r) => r.n), [1, 2, 1, 2]);
  assert.equal(calls, 2);
});
await check("stability and control runs ask for separate samples", async () => {
  const seen = [];
  const model = fakeModel();
  const analyze = (text, options) => {
    seen.push(options?.sample ?? 0);
    return model.analyze(text);
  };
  await runEvaluation({ analyze, resumes, jobs, truth, baseline: { "clean-rahul.txt": await model.analyze(RAHUL_TEXT) }, options: { now: NOW, components: ["stability", "fairness"], stabilityRuns: 3, variantIds: ["location"] } });
  assert.deepEqual(seen.slice(0, 3), [0, 1, 2]); // stability runs
  assert.equal(seen[seen.length - 1], 1); // the control sample
});
await check("it pauses before real calls but not for saved results", async () => {
  const pauses = [];
  const analyzer = createPacedAnalyzer({ analyze: async () => ({ ok: true }), cacheDir: await mkdtemp(path.join(tmpdir(), "paced-")), paceMs: 1234, sleep: async (ms) => pauses.push(ms) });
  await analyzer("a");
  await analyzer("a");
  assert.deepEqual(pauses, [1234]);
});
await check("a rate-limit error waits and tries again", async () => {
  const events = [];
  const pauses = [];
  let calls = 0;
  const analyzer = createPacedAnalyzer({
    analyze: async () => {
      if (++calls <= 2) throw rateLimitError();
      return { ok: true };
    },
    paceMs: 10,
    waitMs: 5000,
    sleep: async (ms) => pauses.push(ms),
    onEvent: (m) => events.push(m),
  });
  assert.deepEqual(await analyzer("x"), { ok: true });
  assert.equal(analyzer.stats.waits, 2);
  assert.equal(pauses.filter((ms) => ms === 5000).length, 2);
  assert.match(events[0], /waiting 5 s \(wait 1 of 4\)/);
});
await check("it gives up with a clear message, and other errors are not retried", async () => {
  const stubborn = createPacedAnalyzer({ analyze: async () => { throw rateLimitError(); }, paceMs: 0, maxWaits: 2, sleep: async () => {} });
  await assert.rejects(stubborn("x"), /rate limit still reached after 2 waits/);
  let calls = 0;
  const broken = createPacedAnalyzer({ analyze: async () => { calls++; throw new Error("Groq rejected the API key."); }, paceMs: 0, sleep: async () => {} });
  await assert.rejects(broken("x"), /rejected the API key/);
  assert.equal(calls, 1);
});

console.log(`\n${passed} checks passed${process.exitCode ? " (some FAILED)" : ""}`);