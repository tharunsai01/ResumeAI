import { callJsonModel, LlmError } from "../llm/jsonCall.js";
import { config } from "../config.js";
import { cleanText } from "../parsing/cleanText.js";
import { scanForInjection } from "../security/injectionScan.js";
import { normalizeSkill } from "../taxonomy/normalizeSkill.js";
import { parseExperienceRange } from "../matching/parsers.js";
import { JobFactsSchema, JOB_SYSTEM_PROMPT, buildJobUserPrompt } from "./jobFacts.js";

const MAX_CHARS = 12000;
const MIN_CHARS = 30;

/** Pure function: validated facts -> a job in the shape matching understands. */
export function buildJobFromFacts(facts) {
  const seen = new Set();
  const unknown = [];
  const take = (names) => {
    const out = [];
    for (const name of names) {
      const skill = normalizeSkill(name);
      if (!skill || seen.has(skill.name)) continue;
      seen.add(skill.name); // a skill listed as required is not repeated as preferred
      out.push(skill.name);
      if (!skill.known) unknown.push(skill.name);
    }
    return out;
  };

  const requiredSkills = take(facts.requiredSkills);
  const preferredSkills = take(facts.preferredSkills);

  return {
    title: facts.title,
    requiredSkills,
    preferredSkills,
    experience: facts.experience,
    experienceRange: parseExperienceRange(facts.experience),
    education: facts.education,
    description: facts.description,
    responsibilities: facts.responsibilities,
    unknownSkills: unknown,
  };
}

/**
 * Pasted job description -> structured job (required and preferred skills, experience, education).
 * The text is cleaned and scanned for prompt injection first, like a resume.
 * options.client lets tests inject a fake Groq client.
 */
export async function extractJobFromText(jobText, options = {}) {
  const startedAt = Date.now();
  const { text: cleaned, invisibleCount } = cleanText(String(jobText ?? "").slice(0, MAX_CHARS));
  if (cleaned.length < MIN_CHARS) {
    throw new LlmError("EMPTY_TEXT", "The job description is too short to analyse.");
  }

  const scan = scanForInjection(cleaned, { invisibleCount });
  const { data, attempts } = await callJsonModel({
    system: JOB_SYSTEM_PROMPT,
    user: buildJobUserPrompt(scan.sanitizedText),
    schema: JobFactsSchema,
    client: options.client,
  });

  return {
    job: buildJobFromFacts(data),
    security: { riskLevel: scan.riskLevel, findings: scan.findings, invisibleCount },
    meta: { model: config.groq.model, attempts, ms: Date.now() - startedAt },
  };
}