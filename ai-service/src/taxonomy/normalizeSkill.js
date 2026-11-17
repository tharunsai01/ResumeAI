import { SKILLS } from "./skillTaxonomy.js";

// "Node.js", "node js", "NodeJS" -> "nodejs". "+" and "#" are kept so that
// "C", "C++" and "C#" stay different.
export function skillKey(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[\s._\-/]+/g, "");
}

// Remove "(...)" notes and trailing version numbers: "Python 3.11" -> "Python"
export function cleanSkillName(raw) {
  if (typeof raw !== "string") return "";
  const cleaned = raw
    .replace(/\(.*?\)/g, " ")
    .replace(/^[\s\-*•·–]+/, "")
    .replace(/\s+v?\d+(\.\d+)*\+?$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length === 0 || cleaned.length > 60 || !/[a-z]/i.test(cleaned)) return "";
  return cleaned;
}

const INDEX = new Map();
const LABELS = new Map();
for (const [name, category, aliases] of SKILLS) {
  const entry = { name, category };
  LABELS.set(name, [name, ...aliases]);
  for (const label of [name, ...aliases]) {
    const key = skillKey(label);
    const existing = INDEX.get(key);
    if (existing && existing.name !== name) {
      console.warn(`[taxonomy] "${label}" is used by both "${existing.name}" and "${name}"`);
      continue;
    }
    INDEX.set(key, entry);
  }
}

/**
 * Maps a raw skill string to the taxonomy.
 * Unknown skills are kept (known: false) so an admin can review them later.
 */
export function normalizeSkill(raw) {
  const cleaned = cleanSkillName(raw);
  if (!cleaned) return null;
  const entry = INDEX.get(skillKey(cleaned));
  if (entry) return { name: entry.name, category: entry.category, known: true };
  return { name: cleaned, category: null, known: false };
}

/** Every label (canonical name + aliases) a skill can be written as. */
export function aliasesFor(canonicalName) {
  return LABELS.get(canonicalName) ?? [canonicalName];
}