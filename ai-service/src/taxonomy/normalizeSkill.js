import { SKILLS } from "./skillTaxonomy.js";

// "Node.js", "node js", "NodeJS" -> "nodejs". "+" and "#" are kept so that
// "C", "C++" and "C#" stay different.
export function skillKey(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[\s._\-/]+/g, "");
}

// Words that describe how well someone knows a skill, not the skill itself.
const LEADING_ADJECTIVES = /^(?:basic|working|strong|good|solid|hands-on|practical|proficient|expert|intermediate|beginner|advanced|fundamental)\s+/i;
const LEADING_NOUNS = /^(?:experience|knowledge|understanding|familiarity|proficiency|expertise|exposure|skills?)\s+(?:in|with|of|on|using)\s+/i;
const TRAILING_NOUNS = /\s+(?:knowledge|skills?|proficiency|expertise|fundamentals|basics)$/i;
// Descriptive endings ("REST API design", "Java programming"). Only dropped when what is left is a known skill.
const DESCRIPTIVE_ENDING = /\s+(?:design|development|programming|framework|frameworks|library|libraries|concepts|principles|language|platform|tools?)$/i;

// Remove "(...)" notes, level words and trailing version numbers:
// "Python 3.11" -> "Python", "Basic machine learning knowledge" -> "machine learning"
export function cleanSkillName(raw) {
  if (typeof raw !== "string") return "";
  let cleaned = raw
    .replace(/\(.*?\)/g, " ")
    .replace(/^[\s\-*•·–]+/, "")
    .replace(/\s+/g, " ")
    .trim();

  for (let i = 0; i < 3; i++) {
    const before = cleaned;
    cleaned = cleaned.replace(LEADING_ADJECTIVES, "").replace(LEADING_NOUNS, "").replace(TRAILING_NOUNS, "").trim();
    if (cleaned === before) break;
  }

  cleaned = cleaned.replace(/\s+v?\d+(\.\d+)*\+?$/i, "").replace(/\s+/g, " ").trim();
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
  let entry = INDEX.get(skillKey(cleaned));
  if (!entry && DESCRIPTIVE_ENDING.test(cleaned)) entry = INDEX.get(skillKey(cleaned.replace(DESCRIPTIVE_ENDING, "")));
  if (entry) return { name: entry.name, category: entry.category, known: true };
  return { name: cleaned, category: null, known: false };
}

/** Every label (canonical name + aliases) a skill can be written as. */
export function aliasesFor(canonicalName) {
  return LABELS.get(canonicalName) ?? [canonicalName];
}