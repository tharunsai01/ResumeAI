import { z } from "zod";

// The LLM output is untrusted too: every field is coerced into a safe shape,
// unknown keys are dropped and list sizes are capped.

const text = z
  .string()
  .nullish()
  .transform((v) => (v ?? "").trim().slice(0, 300));

const year = z.preprocess(
  (v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  },
  z.number().min(1950).max(2100).nullable()
);

const years = z.preprocess(
  (v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  },
  z.number().min(0).max(60).nullable()
);

const flag = z.preprocess((v) => v === true || v === "true", z.boolean());

const strList = (max) =>
  z
    .array(text)
    .nullish()
    .transform((v) => (v ?? []).filter(Boolean).slice(0, max));

const list = (item, max) =>
  z
    .array(item)
    .nullish()
    .transform((v) => (v ?? []).slice(0, max));

const Experience = z.object({
  title: text,
  company: text,
  startYear: year,
  endYear: year,
  isCurrent: flag,
  bullets: strList(12),
  technologies: strList(30),
});

const Education = z.object({
  degree: text,
  institution: text,
  startYear: year,
  endYear: year,
});

const Project = z.object({
  name: text,
  techStack: strList(20),
  description: z
    .string()
    .nullish()
    .transform((v) => (v ?? "").trim().slice(0, 500)),
});

export const ExtractionSchema = z.object({
  candidate: z
    .object({ name: text, email: text, location: text })
    .nullish()
    .transform((v) => v ?? { name: "", email: "", location: "" }),
  statedExperienceYears: years,
  skillsSection: strList(80),
  experience: list(Experience, 15),
  education: list(Education, 10),
  projects: list(Project, 15),
});