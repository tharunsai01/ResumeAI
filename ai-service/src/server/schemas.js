import { z } from "zod";

// Request bodies. The AI service only sends and accepts the shapes below.

const str = z.string();
const nullableYear = z.number().nullable();

export const AnalysisSchema = z.object({
  candidate: z.object({ name: str, email: str, location: str }),
  experienceYears: z.object({ stated: z.number().nullable(), computed: z.number() }),
  skills: z
    .array(
      z.object({
        name: str,
        category: str.nullable(),
        known: z.boolean(),
        score: z.number(),
        level: str,
        evidence: z.object({
          inSkillsSection: z.boolean(),
          experienceRoles: z.number(),
          projects: z.number(),
          years: z.number(),
        }),
      })
    )
    .max(300),
  unknownSkills: z.array(str).max(300),
  experience: z
    .array(
      z.object({
        title: str,
        company: str,
        duration: str,
        startYear: nullableYear,
        endYear: nullableYear,
        isCurrent: z.boolean(),
        description: z.array(str),
        technologies: z.array(str),
      })
    )
    .max(30),
  education: z.array(z.object({ degree: str, institution: str, duration: str })).max(20),
  projects: z.array(z.object({ name: str, techStack: z.array(str), description: str })).max(30),
});

const Resume = z.object({ analysis: AnalysisSchema, text: str.max(60000).optional() });
const Job = z.record(str, z.unknown()); // matching validates the job itself (INVALID_JOB)
const Weights = z
  .object({
    skills: z.number().min(0),
    experience: z.number().min(0),
    education: z.number().min(0),
    roleSimilarity: z.number().min(0),
  })
  .partial();
const Ref = str.max(100).optional();
const Semantic = z.boolean().optional();

export const AnalyzeTextBody = z.object({ text: str.min(1).max(60000), resumeRef: Ref });

export const MatchBody = z.object({
  resume: Resume,
  job: Job,
  weights: Weights.optional(),
  threshold: z.number().min(0).max(100).optional(),
  semantic: Semantic,
  resumeRef: Ref,
});

export const ScreenBody = z.object({
  candidates: z.array(z.object({ id: z.union([str.max(100), z.number()]), analysis: AnalysisSchema, text: str.max(60000).optional() })).min(1).max(1000),
  job: Job,
  weights: Weights.optional(),
  threshold: z.number().min(0).max(100).optional(),
  semantic: Semantic,
  jobRef: Ref,
});

export const RecommendBody = z.object({
  resume: Resume,
  jobs: z.array(Job).min(1).max(500),
  limit: z.number().int().min(1).max(100).optional(),
  minScore: z.number().min(0).max(100).optional(),
  weights: Weights.optional(),
  semantic: Semantic,
});

export const ReportBody = z.object({ analysis: AnalysisSchema });
export const SkillGapBody = z.object({ analysis: AnalysisSchema, jobs: z.array(Job).max(500).optional() });
export const BlindProfileBody = z.object({ analysis: AnalysisSchema, id: z.union([str.max(100), z.number()]), keepEducationDates: z.boolean().optional() });
export const UnknownSkillsBody = z.object({
  analyses: z.array(z.object({ unknownSkills: z.array(str) })).max(5000).optional(),
  jobs: z.array(z.object({ unknownSkills: z.array(str) })).max(5000).optional(),
});
export const JobExtractBody = z.object({ text: str.min(1).max(12000), jobRef: Ref });

export const EvaluationBody = z.object({
  resumes: z.array(z.object({ id: str.max(100), text: str.min(1).max(60000) })).min(1).max(20),
  jobs: z.array(Job).min(1).max(50),
  truth: z.object({ resumes: z.array(z.object({ id: str, skills: z.array(str) })) }).optional(),
  baseline: z.record(str, z.object({ analysis: AnalysisSchema })).optional(),
  options: z
    .object({
      components: z.array(z.enum(["skills", "stability", "fairness", "security", "blind"])).optional(),
      stabilityRuns: z.number().int().min(1).max(10).optional(),
      fairnessResumes: z.number().int().min(1).max(3).optional(),
      fairnessThreshold: z.number().min(0).optional(),
      attackTolerance: z.number().min(0).optional(),
      variantIds: z.array(str).optional(),
      attackIds: z.array(str).optional(),
      datasetName: str.max(100).optional(),
    })
    .optional(),
});