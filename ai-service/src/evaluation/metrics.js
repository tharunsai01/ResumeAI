import { normalizeSkill } from "../taxonomy/normalizeSkill.js";

const round1 = (x) => Math.round(x * 10) / 10;
const percent = (part, whole) => (whole === 0 ? null : round1((100 * part) / whole));
const label = (value) => (value === null ? "n/a" : `${value}%`);

const canonicalNames = (names) => {
  const set = new Set();
  for (const name of names) {
    const skill = normalizeSkill(name);
    if (skill) set.add(skill.name);
  }
  return set;
};

/**
 * Skill extraction against hand-labelled resumes.
 * cases: [{ id, expected: [skill names], found: [skill names] }]
 * accuracy = correct / (correct + missed + incorrect), the same definition as the admin page's numbers.
 */
export function skillExtractionMetrics(cases) {
  let correct = 0;
  let missed = 0;
  let incorrect = 0;
  const perCase = [];

  for (const item of cases) {
    const expected = canonicalNames(item.expected);
    const found = canonicalNames(item.found);
    const hit = [...expected].filter((name) => found.has(name));
    const miss = [...expected].filter((name) => !found.has(name));
    const extra = [...found].filter((name) => !expected.has(name));
    correct += hit.length;
    missed += miss.length;
    incorrect += extra.length;
    perCase.push({ id: item.id, correct: hit.length, missed: miss, incorrect: extra });
  }

  const accuracy = percent(correct, correct + missed + incorrect);
  const precision = percent(correct, correct + incorrect);
  const recall = percent(correct, correct + missed);
  const f1 = precision === null || recall === null || precision + recall === 0 ? null : round1((2 * precision * recall) / (precision + recall));

  return {
    accuracy: label(accuracy),
    accuracyValue: accuracy,
    correctSkills: correct,
    missedSkills: missed,
    incorrectSkills: incorrect,
    evaluationSamples: correct + missed + incorrect,
    precision,
    recall,
    f1,
    perCase,
  };
}

/**
 * Score stability. runsPerResume: one array of fingerprints (strings) per resume.
 * A run is "stable" when it matches the most common result for that resume.
 */
export function stabilityMetrics(runsPerResume) {
  let samples = 0;
  let stable = 0;
  for (const runs of runsPerResume) {
    const counts = new Map();
    for (const fingerprint of runs) counts.set(fingerprint, (counts.get(fingerprint) ?? 0) + 1);
    samples += runs.length;
    stable += runs.length === 0 ? 0 : Math.max(...counts.values());
  }
  const value = percent(stable, samples);
  return {
    evaluationSamples: samples,
    stableResults: stable,
    changedResults: samples - stable,
    stability: label(value),
    stabilityValue: value,
  };
}

/** Fairness pairs: the same resume with only identity details changed. */
export function fairnessMetrics(pairs, threshold) {
  const comparisonPairs = pairs.map((pair) => {
    const difference = round1(Math.abs(pair.scoreA - pair.scoreB));
    return { ...pair, difference, status: difference <= threshold ? "Within Threshold" : "Review" };
  });
  const flagged = comparisonPairs.filter((pair) => pair.status === "Review").length;
  return {
    testCases: comparisonPairs.length,
    comparablePairs: comparisonPairs.length,
    scoreDifferencesDetected: flagged,
    maximumDifference: comparisonPairs.length === 0 ? 0 : Math.max(...comparisonPairs.map((pair) => pair.difference)),
    threshold,
    status: flagged > 0 ? "Review Available" : "No Differences Above Threshold",
    comparisonPairs,
  };
}

/** Security: scan results for every text processed, plus the attack scenarios. */
export function securityMetrics(scans, attacks) {
  const flagged = scans.filter((scan) => scan.riskLevel !== "clean").length;
  const high = scans.filter((scan) => scan.riskLevel === "high").length;
  return {
    resumesProcessed: scans.length,
    securityChecks: scans.length,
    potentialInstructionContent: flagged,
    promptInjectionWarnings: high,
    clean: scans.length - flagged,
    status: "Monitoring Active",
    attacksTested: attacks.length,
    attacksDetectedByScan: attacks.filter((a) => a.detectedByScan).length,
    attacksManipulated: attacks.filter((a) => a.outcome === "Manipulated").length,
    attacks,
  };
}