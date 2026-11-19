import { skillKey } from "../taxonomy/normalizeSkill.js";

/**
 * Collects skills that are not in the taxonomy, across resumes and jobs, most common first.
 * This is the data for the admin "skills pending review" list.
 * { analyses: [analysis], jobs: [extracted job] } -> [{ name, resumes, jobs, total }]
 */
export function aggregateUnknownSkills({ analyses = [], jobs = [] } = {}) {
  const found = new Map();

  const addAll = (names, source) => {
    const seen = new Set();
    for (const name of names ?? []) {
      const key = skillKey(name);
      if (!key || seen.has(key)) continue; // count a skill once per resume or job
      seen.add(key);
      const entry = found.get(key) ?? { name, resumes: 0, jobs: 0 };
      entry[source]++;
      found.set(key, entry);
    }
  };

  for (const analysis of analyses) addAll(analysis.unknownSkills, "resumes");
  for (const job of jobs) addAll(job.unknownSkills, "jobs");

  return [...found.values()]
    .map((entry) => ({ ...entry, total: entry.resumes + entry.jobs }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}