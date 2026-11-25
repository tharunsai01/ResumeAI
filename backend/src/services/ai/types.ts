import { z } from 'zod';

export const aiResumeAnalysisSchema = z.strictObject({
  summary: z.string().min(10),
  provider: z.string().optional(),
  qualityScore: z.number().min(0).max(100),
  breakdown: z.object({
    skills: z.number().min(0).max(100),
    experience: z.number().min(0).max(100),
    education: z.number().min(0).max(100),
    projects: z.number().min(0).max(100),
  }),
  skills: z.array(
    z.object({
      name: z.string(),
      score: z.number().min(0).max(100),
      category: z.string(),
    }),
  ),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  experience: z
    .array(
      z.object({
        title: z.string().default(''),
        company: z.string().default(''),
        duration: z.string().default(''),
        description: z
          .union([z.array(z.string()), z.string()])
          .transform((v) => (Array.isArray(v) ? v : v ? [v] : []))
          .default([]),
      }),
    )
    .optional()
    .default([]),
  education: z
    .array(
      z.object({
        degree: z.string().default(''),
        institution: z.string().default(''),
        duration: z.string().default(''),
      }),
    )
    .optional()
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string().default(''),
        techStack: z
          .union([z.array(z.string()), z.string()])
          .transform((v) => (Array.isArray(v) ? v : v ? [v] : []))
          .default([]),
        description: z.string().default(''),
      }),
    )
    .optional()
    .default([]),
});

export const aiJobMatchSchema = z.strictObject({
  overallScore: z.number().min(0).max(100),
  skillMatchPercentage: z.number().min(0).max(100),
  experienceMatch: z.number().min(0).max(100).nullish(),
  roleSimilarity: z.number().min(0).max(100).nullish(),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  experienceCompatibility: z.string(),
  educationCompatibility: z.string(),
  strengths: z.array(z.string()),
  potentialGaps: z.array(z.string()),
  actionableRecommendations: z.array(z.string()),
  explanation: z.string(),
});

export const aiScreeningSchema = z.strictObject({
  overallScore: z.number().min(0).max(100),
  skillsScore: z.number().min(0).max(100),
  experienceScore: z.number().min(0).max(100),
  educationScore: z.number().min(0).max(100),
  recommendation: z.enum([
    'strong_match',
    'potential_match',
    'weak_match',
    'insufficient_info',
  ]),
  matchedRequirements: z.array(z.string()),
  missingRequirements: z.array(z.string()),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  explanation: z.string(),
  actionableSuggestions: z.array(z.string()),
});

export type AIResumeAnalysisOutput = z.infer<typeof aiResumeAnalysisSchema>;
export type AIJobMatchOutput = z.infer<typeof aiJobMatchSchema>;
export type AICandidateScreeningOutput = z.infer<typeof aiScreeningSchema>;
