import { z } from "zod";
import { normalizeSkill } from "../taxonomy/normalizeSkill.js";

export class MatchError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "MatchError";
    this.code = code;
  }
}

const text = z
  .string()
  .nullish()
  .transform((v) => (v ?? "").trim());

const skillList = z
  .array(z.string())
  .nullish()
  .transform((v) => v ?? []);

const JobSchema = z.object({
  id: z
    .union([z.string(), z.number()])
    .nullish()
    .transform((v) => (v == null ? "" : String(v))),
  title: text,
  requiredSkills: skillList,
  preferredSkills: skillList,
  experience: text, // e.g. "2–4 years", "Fresher"
  education: text, // e.g. "B.Tech/B.E. in Computer Science or equivalent"
});

/** Validates a job and maps its skills to the taxonomy. Same shape as the frontend's jobRequirements. */
export function normalizeJob(rawJob) {
  const parsed = JobSchema.safeParse(rawJob);
  if (!parsed.success) {
    throw new MatchError("INVALID_JOB", "The job must be an object with title and skill lists.");
  }
  const job = parsed.data;

  const seen = new Set();
  const take = (names) => {
    const out = [];
    for (const name of names) {
      const skill = normalizeSkill(name);
      if (!skill || seen.has(skill.name)) continue;
      seen.add(skill.name);
      out.push(skill);
    }
    return out;
  };

  const required = take(job.requiredSkills);
  const preferred = take(job.preferredSkills); // a skill listed as required is not counted again
  return {
    id: job.id,
    title: job.title,
    required,
    preferred,
    experience: job.experience,
    education: job.education,
  };
}