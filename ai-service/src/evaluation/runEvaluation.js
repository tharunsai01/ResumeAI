import { config } from "../config.js";
import { SEMANTIC } from "../semantic/semanticConfig.js";
import { cleanText } from "../parsing/cleanText.js";
import { scanForInjection } from "../security/injectionScan.js";
import { scoreMatch } from "../matching/scoreMatch.js";
import { MATCH } from "../matching/matchConfig.js";
import { buildBlindProfile } from "../blind/blindProfile.js";
import { EVAL } from "./evaluationConfig.js";
import { skillExtractionMetrics, stabilityMetrics, fairnessMetrics, securityMetrics } from "./metrics.js";
import { buildVariants } from "./fairnessVariants.js";
import { ATTACKS } from "./attacks.js";

export const COMPONENTS = ["skills", "stability", "fairness", "security", "blind"];
const COMPONENT_LABELS = {
  skills: "Skill",
  stability: "Stability",
  fairness: "Fairness",
  security: "Security",
  blind: "Blind Screening",
};
const REPORT_KEYS = {
  skills: "skillExtraction",
  stability: "scoreStability",
  fairness: "fairness",
  security: "security",
  blind: "blindScreening",
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const round1 = (x) => Math.round(x * 10) / 10;
const pad = (n) => String(n).padStart(2, "0");
const formatDate = (d) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const evaluationId = (d) =>
  `EVAL-${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;

/** Average overall match of one analysis across the evaluation jobs. */
function meanScore(analysis, jobs) {
  if (jobs.length === 0) return 0;
  const total = jobs.reduce((sum, job) => sum + scoreMatch({ analysis }, job).overallMatch, 0);
  return round1(total / jobs.length);
}

function fingerprint(analysis, jobs) {
  return JSON.stringify({
    skills: analysis.skills.map((s) => [s.name, s.score]),
    matches: jobs.map((job) => scoreMatch({ analysis }, job).overallMatch),
  });
}

const strongSkills = (analysis) =>
  new Set(analysis.skills.filter((s) => s.score >= MATCH.matchedMinScore).map((s) => s.name));

function skillDifferences(a, b) {
  const namesA = new Set(a.skills.map((s) => s.name));
  const namesB = new Set(b.skills.map((s) => s.name));
  return {
    onlyA: [...namesA].filter((name) => !namesB.has(name)),
    onlyB: [...namesB].filter((name) => !namesA.has(name)),
  };
}

/** Checks that no identifying detail survives in the blind profile of each resume. */
function blindScreeningCheck(baseEntries) {
  const failures = [];
  let hidden = [];
  for (const [index, { id, analysis }] of baseEntries.entries()) {
    // the profile shows the id it is given, so use a neutral one (a real candidate id is opaque too)
    const profile = buildBlindProfile(analysis, { id: `case-${index + 1}` });
    hidden = profile.hidden;
    const json = JSON.stringify(profile).toLowerCase();
    const secrets = [
      analysis.candidate.email,
      ...String(analysis.candidate.name).split(/\s+/).filter((part) => part.length >= 3),
      analysis.candidate.location,
      ...String(analysis.candidate.location).split(/[,/]/).map((part) => part.trim()).filter((part) => part.length >= 3),
      ...analysis.experience.map((role) => role.company),
      ...analysis.education.map((item) => item.institution),
    ].filter(Boolean);
    for (const secret of secrets) {
      if (json.includes(secret.toLowerCase())) failures.push({ id, leaked: secret });
    }
  }
  return {
    status: failures.length === 0 ? "Configured" : "Needs Attention",
    identityFieldsHidden: hidden,
    testCoverage: `${baseEntries.length} evaluation cases`,
    failures,
  };
}

function buildFindings(report) {
  const findings = [];
  const flags = [];
  const warn = EVAL.warnBelow;

  if (report.skillExtraction) {
    const value = report.skillExtraction.accuracyValue;
    if (value !== null && value < warn.skillAccuracy) {
      findings.push({ text: `Skill extraction accuracy is ${report.skillExtraction.accuracy}, below ${warn.skillAccuracy}%.`, type: "warning" });
      flags.push({ message: `Skill extraction accuracy is ${report.skillExtraction.accuracy}.`, type: "Accuracy" });
    } else {
      findings.push({ text: "Skill extraction evaluation completed.", type: "success" });
    }
  }
  if (report.scoreStability) {
    const value = report.scoreStability.stabilityValue;
    if (value !== null && value < warn.stability) {
      findings.push({ text: `Score stability is ${report.scoreStability.stability}, below ${warn.stability}%.`, type: "warning" });
      flags.push({ message: `Score stability is ${report.scoreStability.stability}.`, type: "Stability" });
    } else {
      findings.push({ text: "Score stability evaluation completed.", type: "success" });
    }
  }
  if (report.fairness) {
    const n = report.fairness.scoreDifferencesDetected;
    if (n > 0) {
      findings.push({ text: "Fairness comparison contains cases requiring review.", type: "warning" });
      flags.push({ message: `${n} fairness comparison ${n === 1 ? "case requires" : "cases require"} review.`, type: "Fairness" });
    } else {
      findings.push({ text: "No fairness comparison exceeded the threshold.", type: "success" });
    }
  }
  if (report.blindScreening) {
    findings.push(
      report.blindScreening.status === "Configured"
        ? { text: "Blind screening configuration available.", type: "success" }
        : { text: "Blind screening left identifying details in some profiles.", type: "warning" }
    );
    if (report.blindScreening.status !== "Configured") {
      flags.push({ message: "Blind screening profiles leaked identifying details.", type: "Blind Screening" });
    }
  }
  if (report.security) {
    const n = report.security.attacksManipulated;
    if (n > 0) {
      findings.push({ text: `${n} of ${report.security.attacksTested} injection scenarios changed scores.`, type: "warning" });
      flags.push({ message: `${n} injection ${n === 1 ? "scenario changed" : "scenarios changed"} scores.`, type: "Security" });
    } else {
      findings.push({ text: "No injection scenario changed scores.", type: "success" });
    }
  }
  return { findings, reviewFlags: flags };
}

/**
 * Runs the evaluation and returns data shaped like the admin "AI Evaluation" page.
 *
 * input:
 *   analyze(text)   async -> { analysis, security }  (use analyzeResumeText)
 *   resumes         [{ id, text }]
 *   jobs            structured jobs the scores are measured against
 *   truth           optional { resumes: [{ id, skills: [...] }] } hand-labelled skills
 *   baseline        optional { [resumeId]: { analysis, security? } } to avoid re-analysing
 *   options         { components, stabilityRuns, fairnessResumes, fairnessThreshold, attackTolerance,
 *                     variantIds, attackIds, datasetName, now, onProgress }
 */
export async function runEvaluation(input) {
  const { analyze, resumes, jobs, truth = null, baseline = {} } = input;
  const o = input.options ?? {};
  const settings = {
    components: o.components ?? COMPONENTS,
    stabilityRuns: o.stabilityRuns ?? EVAL.stability.runs,
    stabilityResumes: o.stabilityResumes ?? EVAL.stability.resumes,
    fairnessResumes: o.fairnessResumes ?? EVAL.fairness.resumes,
    fairnessThreshold: o.fairnessThreshold ?? EVAL.fairness.reviewAbove,
    securityResumes: o.securityResumes ?? EVAL.security.resumes,
    attackTolerance: o.attackTolerance ?? EVAL.security.tolerance,
    variantIds: o.variantIds ?? null,
    attackIds: o.attackIds ?? null,
    datasetName: o.datasetName ?? EVAL.datasetName,
    now: o.now ?? new Date(),
    onProgress: o.onProgress ?? (() => {}),
  };
  const run = (name) => settings.components.includes(name);
  const say = settings.onProgress;

  // ---- baseline analysis of every resume ----
  const base = [];
  for (const resume of resumes) {
    let entry = baseline[resume.id];
    if (!entry) {
      say(`analysing ${resume.id}`);
      entry = await analyze(resume.text);
    }
    const security =
      entry.security ??
      (() => {
        const { text, invisibleCount } = cleanText(resume.text);
        const scan = scanForInjection(text, { invisibleCount });
        return { riskLevel: scan.riskLevel, findings: scan.findings, invisibleCount };
      })();
    base.push({ id: resume.id, text: resume.text, analysis: entry.analysis, security });
  }

  const report = {};

  // ---- skill extraction ----
  if (run("skills") && truth) {
    const cases = truth.resumes
      .map((item) => ({ item, entry: base.find((b) => b.id === item.id) }))
      .filter(({ entry }) => entry)
      .map(({ item, entry }) => ({ id: item.id, expected: item.skills, found: entry.analysis.skills.map((s) => s.name) }));
    report.skillExtraction = skillExtractionMetrics(cases);
  }

  // ---- score stability ----
  if (run("stability")) {
    const runsPerResume = [];
    for (const entry of base.slice(0, settings.stabilityResumes)) {
      const prints = [];
      for (let i = 0; i < settings.stabilityRuns; i++) {
        say(`stability: ${entry.id} run ${i + 1}/${settings.stabilityRuns}`);
        prints.push(fingerprint((await analyze(entry.text, { sample: i })).analysis, jobs));
      }
      runsPerResume.push(prints);
    }
    report.scoreStability = stabilityMetrics(runsPerResume);
  }

  // ---- fairness ----
  if (run("fairness")) {
    const pairs = [];
    const controls = [];
    let counter = 0;
    for (const entry of base.slice(0, settings.fairnessResumes)) {
      const meanBase = meanScore(entry.analysis, jobs);

      let variants = buildVariants(entry.text, entry.analysis);
      if (settings.variantIds) variants = variants.filter((v) => settings.variantIds.includes(v.id));

      for (const variant of variants) {
        say(`fairness: ${entry.id} / ${variant.id}`);
        const a = variant.textA === entry.text ? entry.analysis : (await analyze(variant.textA)).analysis;
        const b = (await analyze(variant.textB)).analysis;
        counter++;
        pairs.push({
          id: `PAIR-${String(counter).padStart(3, "0")}`,
          group: variant.group,
          label: variant.label,
          resume: entry.id,
          scoreA: meanScore(a, jobs),
          scoreB: meanScore(b, jobs),
          skillDifferences: skillDifferences(a, b),
        });
      }

      // control: the unchanged resume analysed a second time shows how much the model varies by itself
      say(`fairness: ${entry.id} / control`);
      const again = (await analyze(entry.text, { sample: 1 })).analysis;
      controls.push({
        id: `CONTROL-${entry.id}`,
        scoreA: meanBase,
        scoreB: meanScore(again, jobs),
      });
    }
    report.fairness = fairnessMetrics(pairs, settings.fairnessThreshold);
    report.fairness.noiseFloor = {
      pairs: controls.map((c) => ({ ...c, difference: round1(Math.abs(c.scoreA - c.scoreB)) })),
      maximumDifference: controls.length === 0 ? 0 : Math.max(...controls.map((c) => round1(Math.abs(c.scoreA - c.scoreB)))),
    };
  }

  // ---- security ----
  if (run("security")) {
    const scans = base.map((b) => b.security);
    const attackRows = [];
    let attacks = ATTACKS;
    if (settings.attackIds) attacks = attacks.filter((a) => settings.attackIds.includes(a.id));

    for (const entry of base.slice(0, settings.securityResumes)) {
      const baseMean = meanScore(entry.analysis, jobs);
      const baseStrong = strongSkills(entry.analysis);
      for (const attack of attacks) {
        say(`security: ${entry.id} / ${attack.id}`);
        const result = await analyze(attack.build(entry.text));
        const mean = meanScore(result.analysis, jobs);
        const newStrong = [...strongSkills(result.analysis)].filter((name) => !baseStrong.has(name));
        const delta = round1(mean - baseMean);
        attackRows.push({
          id: attack.id,
          category: attack.category,
          label: attack.label,
          resume: entry.id,
          detectedByScan: result.security.riskLevel !== "clean",
          scanRisk: result.security.riskLevel,
          baseScore: baseMean,
          attackScore: mean,
          delta,
          newStrongSkills: newStrong,
          outcome: delta > settings.attackTolerance || newStrong.length > 0 ? "Manipulated" : "Resisted",
        });
      }
    }
    report.security = securityMetrics(scans, attackRows);
    report.security.tolerance = settings.attackTolerance;
  }

  // ---- blind screening ----
  if (run("blind")) report.blindScreening = blindScreeningCheck(base);

  // ---- summary, model info, record ----
  const { findings, reviewFlags } = buildFindings(report);
  const components = settings.components.filter((name) => report[REPORT_KEYS[name]]);
  const labels = components.map((name) => COMPONENT_LABELS[name]);
  const date = formatDate(settings.now);

  const summary = {
    skillExtractionAccuracy: report.skillExtraction?.accuracy ?? null,
    scoreStability: report.scoreStability?.stability ?? null,
    fairnessTest: report.fairness?.status ?? null,
    promptInjectionChecks: report.security?.securityChecks ?? null,
    lastEvaluation: date,
  };
  const modelInfo = {
    modelVersion: config.groq.model,
    embeddingModel: SEMANTIC.model,
    evaluationDataset: settings.datasetName,
    lastEvaluation: date,
    status: "Available",
    components: labels,
  };

  const metrics = {};
  if (report.skillExtraction) metrics.skillExtraction = report.skillExtraction.accuracy;
  if (report.scoreStability) metrics.scoreStability = report.scoreStability.stability;
  if (report.fairness) metrics.fairness = `Maximum Difference ${report.fairness.maximumDifference}`;
  if (report.security) {
    const n = report.security.attacksManipulated;
    metrics.security = n === 0 ? "No Injection Scenario Changed Scores" : `${n} Injection ${n === 1 ? "Scenario" : "Scenarios"} Changed Scores`;
  }
  const record = {
    id: evaluationId(settings.now),
    modelVersion: config.groq.model,
    dataset: settings.datasetName,
    components: labels.join(" + "),
    date,
    status: "Completed",
    metrics,
  };

  return {
    report: { summary, modelInfo, ...report, findings, reviewFlags },
    record,
  };
}