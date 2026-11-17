// "Role similarity" and "keyword match".
// Phase 3 uses simple, explainable rules. Phase 4 can swap roleSimilarity for embeddings
// without changing the function signature.
import { aliasesFor } from "../taxonomy/normalizeSkill.js";

const STOP = new Set([
  "senior", "junior", "jr", "sr", "lead", "intern", "trainee", "associate",
  "principal", "staff", "i", "ii", "iii", "the", "of", "and", "a", "an", "for", "at",
]);
const SYNONYMS = { developer: "engineer", programmer: "engineer", sde: "engineer", swe: "engineer", dev: "engineer" };

function titleTokens(title) {
  const s = String(title)
    .toLowerCase()
    .replace(/front[\s-]?end/g, "frontend")
    .replace(/back[\s-]?end/g, "backend")
    .replace(/full[\s-]?stack/g, "fullstack");
  return new Set(
    s
      .split(/[^a-z0-9+#]+/)
      .filter((t) => t && !STOP.has(t))
      .map((t) => SYNONYMS[t] ?? t)
  );
}

function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const x of a) if (b.has(x)) shared++;
  return shared / (a.size + b.size - shared);
}

function titleSimilarity(candidateTitles, jobTitle) {
  const job = titleTokens(jobTitle);
  if (job.size === 0 || candidateTitles.length === 0) return null;
  return Math.round(100 * Math.max(...candidateTitles.map((t) => jaccard(titleTokens(t), job))));
}

// Share of the job's skill categories in which the candidate has solid skills.
function categoryCoverage(candidateSkills, requiredSkills, matchedMinScore) {
  const wanted = new Set(requiredSkills.map((s) => s.category).filter(Boolean));
  if (wanted.size === 0) return null;
  const have = new Set(
    candidateSkills.filter((s) => s.score >= matchedMinScore && s.category).map((s) => s.category)
  );
  let hits = 0;
  for (const category of wanted) if (have.has(category)) hits++;
  return Math.round((100 * hits) / wanted.size);
}

/** 0-100 or null: how close the candidate's roles and skill areas are to the job. */
export function roleSimilarity(analysis, job, matchedMinScore) {
  const parts = [
    titleSimilarity(
      analysis.experience.map((role) => role.title).filter(Boolean),
      job.title
    ),
    categoryCoverage(analysis.skills, job.required, matchedMinScore),
  ].filter((value) => value !== null);
  if (parts.length === 0) return null;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function textMentions(text, lowerText, skillName) {
  for (const label of aliasesFor(skillName)) {
    if (label.length <= 2) {
      // very short names (C, R, Go) must match exactly, otherwise "go" matches ordinary words
      if (label === skillName && new RegExp(`(?<![A-Za-z0-9+#.])${escapeRegex(label)}(?![A-Za-z0-9+#])`).test(text)) {
        return true;
      }
      continue;
    }
    const re = new RegExp(`(?<![a-z0-9+#.])${escapeRegex(label.toLowerCase())}(?![a-z0-9+#])`);
    if (re.test(lowerText)) return true;
  }
  return false;
}

/** 0-100 or null: share of the job's skills that appear anywhere in the resume. */
export function keywordMatch(resumeText, analysisSkills, jobSkills) {
  if (jobSkills.length === 0) return null;
  const lower = resumeText.toLowerCase();
  const have = new Set(analysisSkills.map((s) => s.name));
  let hits = 0;
  for (const skill of jobSkills) {
    if (have.has(skill.name) || (resumeText && textMentions(resumeText, lower, skill.name))) hits++;
  }
  return Math.round((100 * hits) / jobSkills.length);
}