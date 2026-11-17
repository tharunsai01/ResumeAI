import Groq from "groq-sdk";
import { config } from "../config.js";
import { ExtractionSchema } from "./schema.js";
import { SYSTEM_PROMPT, buildUserPrompt, buildRetryPrompt } from "./prompt.js";
import { normalizeSkill } from "../taxonomy/normalizeSkill.js";

export class ExtractionError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ExtractionError";
    this.code = code;
  }
}

let sharedClient = null;
function getClient() {
  if (!config.groq.apiKey) {
    throw new ExtractionError(
      "NO_API_KEY",
      "GROQ_API_KEY is missing. Create ai-service/.env (see .env.example)."
    );
  }
  sharedClient ??= new Groq({ apiKey: config.groq.apiKey, timeout: config.groq.timeoutMs });
  return sharedClient;
}

function explainApiError(err) {
  const status = err?.status;
  if (status === 401) return "Groq rejected the API key. Check GROQ_API_KEY in .env.";
  if (status === 429) return "Groq rate limit reached. Wait a minute and try again.";
  if (status === 400 || status === 404) {
    return `Groq rejected the request (${err.message}). If the model was retired, set GROQ_MODEL in .env (see console.groq.com/docs/models).`;
  }
  return `Groq request failed: ${err?.message ?? "unknown error"}`;
}

function parseJson(raw) {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  return JSON.parse(cleaned);
}

function issuesToText(error) {
  return error.issues
    .slice(0, 5)
    .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("; ");
}

/** Calls the LLM and returns validated raw facts. Retries once on invalid output. */
async function requestFacts(resumeText, client) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserPrompt(resumeText) },
  ];

  let lastProblem = "";
  const maxAttempts = 1 + config.groq.retries;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let content;
    try {
      const completion = await client.chat.completions.create({
        model: config.groq.model,
        messages,
        temperature: config.groq.temperature,
        seed: config.groq.seed,
        max_tokens: config.groq.maxTokens,
        response_format: { type: "json_object" },
      });
      content = completion.choices?.[0]?.message?.content ?? "";
    } catch (err) {
      throw new ExtractionError("API_ERROR", explainApiError(err));
    }

    let problem = "";
    try {
      const parsed = ExtractionSchema.safeParse(parseJson(content));
      if (parsed.success) return { facts: parsed.data, attempts: attempt };
      problem = issuesToText(parsed.error);
    } catch {
      problem = "the output was not valid JSON";
    }

    lastProblem = problem;
    messages.push({ role: "assistant", content });
    messages.push({ role: "user", content: buildRetryPrompt(problem) });
  }

  throw new ExtractionError(
    "INVALID_MODEL_OUTPUT",
    `The model did not return valid JSON after ${maxAttempts} attempts (${lastProblem}).`
  );
}

// ---------- deterministic part: facts -> skills, scores, years ----------

function formatDuration(startYear, endYear, isCurrent) {
  const start = startYear ?? "";
  const end = isCurrent ? "Present" : (endYear ?? "");
  return [start, end].filter((part) => part !== "").join(" – ");
}

function roleInterval(role, nowYear) {
  if (role.startYear == null) return null;
  const end = role.isCurrent ? nowYear : (role.endYear ?? role.startYear);
  return end >= role.startYear ? [role.startYear, end] : null;
}

// Total length of the union of year ranges, so overlapping roles count once.
function unionLength(intervals) {
  const sorted = intervals.filter(Boolean).sort((a, b) => a[0] - b[0]);
  let total = 0;
  let current = null;
  for (const [start, end] of sorted) {
    if (current && start <= current[1]) {
      current[1] = Math.max(current[1], end);
    } else {
      if (current) total += current[1] - current[0];
      current = [start, end];
    }
  }
  if (current) total += current[1] - current[0];
  return total;
}

function levelFor(score) {
  const { expert, advanced, intermediate } = config.levels;
  if (score >= expert) return "Expert";
  if (score >= advanced) return "Advanced";
  if (score >= intermediate) return "Intermediate";
  return "Beginner";
}

function scoreSkill(evidence, years) {
  const s = config.skillScoring;
  let score = s.mentioned;
  if (evidence.inSkillsSection) score += s.listed;
  score += Math.min(s.maxExperience, evidence.experienceRoles * s.perExperienceRole);
  score += Math.min(s.maxProjects, evidence.projects * s.perProject);
  score += Math.min(s.maxYears, years * s.perYear);
  return Math.min(100, Math.round(score));
}

/** Pure function: validated facts -> analysis. No network, easy to test. */
export function buildAnalysis(facts, { now = new Date() } = {}) {
  const nowYear = now.getFullYear();
  const registry = new Map();

  function track(rawName) {
    const skill = normalizeSkill(rawName);
    if (!skill) return null;
    if (!registry.has(skill.name)) {
      registry.set(skill.name, {
        ...skill,
        inSkillsSection: false,
        roles: new Set(),
        projects: new Set(),
        intervals: [],
      });
    }
    return registry.get(skill.name);
  }

  for (const name of facts.skillsSection) {
    const entry = track(name);
    if (entry) entry.inSkillsSection = true;
  }

  const experience = facts.experience.map((role, index) => {
    const interval = roleInterval(role, nowYear);
    const technologies = [];
    for (const name of role.technologies) {
      const entry = track(name);
      if (!entry) continue;
      if (!technologies.includes(entry.name)) technologies.push(entry.name);
      entry.roles.add(index);
      if (interval) entry.intervals.push(interval);
    }
    return {
      title: role.title,
      company: role.company,
      duration: formatDuration(role.startYear, role.endYear, role.isCurrent),
      startYear: role.startYear,
      endYear: role.isCurrent ? null : role.endYear,
      isCurrent: role.isCurrent,
      description: role.bullets,
      technologies,
    };
  });

  const projects = facts.projects.map((project, index) => {
    const techStack = [];
    for (const name of project.techStack) {
      const entry = track(name);
      if (!entry) continue;
      if (!techStack.includes(entry.name)) techStack.push(entry.name);
      entry.projects.add(index);
    }
    return { name: project.name, techStack, description: project.description };
  });

  const education = facts.education.map((item) => ({
    degree: item.degree,
    institution: item.institution,
    duration: formatDuration(item.startYear, item.endYear, false),
  }));

  const skills = [...registry.values()]
    .map((entry) => {
      const years = unionLength(entry.intervals);
      const evidence = {
        inSkillsSection: entry.inSkillsSection,
        experienceRoles: entry.roles.size,
        projects: entry.projects.size,
        years,
      };
      const score = scoreSkill(evidence, years);
      return {
        name: entry.name,
        category: entry.category,
        known: entry.known,
        score,
        level: levelFor(score),
        evidence,
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return {
    candidate: facts.candidate,
    experienceYears: {
      stated: facts.statedExperienceYears,
      computed: unionLength(facts.experience.map((role) => roleInterval(role, nowYear))),
    },
    skills,
    unknownSkills: skills.filter((skill) => !skill.known).map((skill) => skill.name),
    experience,
    education,
    projects,
  };
}

/**
 * Resume text (already sanitised by Phase 1) -> structured analysis.
 * options.client lets tests inject a fake Groq client; options.now fixes the date.
 */
export async function extractResume(resumeText, options = {}) {
  const startedAt = Date.now();
  const text = String(resumeText ?? "").slice(0, config.extraction.maxResumeChars);
  if (text.trim().length === 0) {
    throw new ExtractionError("EMPTY_TEXT", "There is no resume text to analyse.");
  }

  const client = options.client ?? getClient();
  const { facts, attempts } = await requestFacts(text, client);
  const analysis = buildAnalysis(facts, { now: options.now });

  return {
    analysis,
    meta: { model: config.groq.model, attempts, ms: Date.now() - startedAt },
  };
}