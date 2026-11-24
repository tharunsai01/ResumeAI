/**
 * Builds AI-service inputs from database records, caches match results, and
 * independently re-validates every score against the official formula.
 */
import crypto from 'node:crypto';
import type { Types } from 'mongoose';
import { CandidateProfile, Job, MatchResult, Resume, Skill } from '../models';
import { MATCH_WEIGHTS } from '../constants';
import { ApiError } from '../utils/ApiError';
import { aiClient, type AiMatchResult } from './aiClient';

type Id = string | Types.ObjectId;

export function categoryFor(score: number) {
  return score >= 80 ? 'Strong Match' : score >= 60 ? 'Potential Match' : 'Low Match';
}

/** Second, independent check of the AI service's arithmetic. */
export function verifyOfficialScore(result: Pick<AiMatchResult, 'overall_score' | 'components' | 'category'>): boolean {
  const c = result.components;
  if (!c) return false;
  const values = [c.skills, c.experience, c.education, c.role];
  if (values.some((v) => typeof v !== 'number' || Number.isNaN(v) || v < 0 || v > 100)) return false;
  const expected =
    Math.round((c.skills * MATCH_WEIGHTS.skills + c.experience * MATCH_WEIGHTS.experience + c.education * MATCH_WEIGHTS.education + c.role * MATCH_WEIGHTS.role) * 100) / 100;
  return Math.abs(expected - result.overall_score) < 0.011 && result.category === categoryFor(result.overall_score);
}

export async function customSkills() {
  const skills = await Skill.find({ status: 'approved', source: { $ne: 'seed' } }).select('name category aliases related').lean();
  return skills.map((s) => ({ name: s.name, category: s.category, aliases: s.aliases, related: s.related }));
}

function monthsBetween(start?: Date | null, end?: Date | null) {
  if (!start) return 0;
  const e = end ?? new Date();
  return Math.max(0, (e.getFullYear() - start.getFullYear()) * 12 + (e.getMonth() - start.getMonth()) + 1);
}

export async function candidateInput(userId: Id) {
  const profile = await CandidateProfile.findOne({ user: userId }).lean();
  if (!profile) throw ApiError.notFound('Candidate profile');
  const resume = profile.activeResume
    ? await Resume.findOne({ _id: profile.activeResume, status: 'completed', deletedAt: null }).select('analysis').lean()
    : null;
  const parsed = (resume?.analysis as any)?.profile ?? {};

  const skills = new Set<string>(profile.skills.map((s) => s.name));
  for (const s of parsed.skills ?? []) skills.add(s.name);

  const titles = new Set<string>(profile.experience.map((e) => e.title).filter(Boolean));
  for (const t of parsed.job_titles ?? []) titles.add(t);

  const experience = profile.experience.length
    ? profile.experience.map((e) => ({ title: e.title, months: monthsBetween(e.startDate, e.current ? null : e.endDate) }))
    : (parsed.experience ?? []).map((e: any) => ({ title: e.title, months: e.months }));
  const profileYears = profile.experience.length ? experience.reduce((a: number, e: any) => a + e.months, 0) / 12 : 0;
  const years = profile.totalExperienceYears || Math.round(profileYears * 10) / 10 || parsed.total_experience_years || 0;
  const eduLevel = Math.max(profile.highestEducationLevel || 0, ...profile.education.map((e) => e.level || 0), parsed.highest_education_level || 0);

  const input = {
    id: String(userId),
    headline: profile.headline || parsed.headline || '',
    summary: profile.summary || parsed.summary || '',
    skills: [...skills].slice(0, 150),
    job_titles: [...titles].slice(0, 20),
    total_experience_years: Math.min(60, years),
    experience: experience.slice(0, 30),
    highest_education_level: Math.min(5, eduLevel),
    education_field: profile.education[0]?.field || '',
  };
  return { input, resumeId: resume?._id };
}

export function jobInput(job: any) {
  return {
    id: String(job._id),
    title: job.title,
    description: job.description,
    required_skills: job.requiredSkills,
    preferred_skills: job.preferredSkills,
    min_experience_years: job.minExperienceYears,
    education_level: job.educationLevel,
    education_required: job.educationRequired,
  };
}

function hashInputs(...parts: unknown[]) {
  return crypto.createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}

export async function saveMatch(candidateId: Id, jobId: Id, result: AiMatchResult, inputHash: string, resumeId?: Id) {
  if (!verifyOfficialScore(result) || !result.validated) {
    throw new ApiError(502, 'AI service returned a score that failed formula validation', 'SCORE_VALIDATION_FAILED');
  }
  return MatchResult.findOneAndUpdate(
    { candidate: candidateId, job: jobId },
    {
      candidate: candidateId,
      job: jobId,
      resume: resumeId,
      inputHash,
      overallScore: result.overall_score,
      category: result.category,
      components: result.components,
      matchedSkills: result.matched_skills,
      relatedSkills: result.related_skills,
      missingSkills: result.missing_skills,
      strengths: result.strengths,
      gaps: result.gaps,
      explanation: result.explanation,
      narrative: result.narrative,
      recommendations: result.recommendations,
      details: result.details,
      modelVersion: result.model_version,
      embeddingBackend: result.embedding_backend,
      llmUsed: result.llm_used,
      validated: true,
      computedAt: new Date(result.timestamp || Date.now()),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}

/** Return a cached match when inputs are unchanged, otherwise ask the AI service. */
export async function matchCandidateToJob(candidateId: Id, jobId: Id, opts: { narrative?: boolean } = {}) {
  const job = await Job.findById(jobId).lean();
  if (!job) throw ApiError.notFound('Job');
  const { input, resumeId } = await candidateInput(candidateId);
  const jInput = jobInput(job);
  const custom = await customSkills();
  const inputHash = hashInputs(input, jInput, custom);
  const cached = await MatchResult.findOne({ candidate: candidateId, job: jobId }).lean();
  if (cached && cached.inputHash === inputHash && (!opts.narrative || cached.narrative || cached.llmUsed === false)) return cached;
  const result = await aiClient.match({ candidate: input, job: jInput, custom_skills: custom, include_narrative: !!opts.narrative });
  return saveMatch(candidateId, jobId, result, inputHash, resumeId);
}

export { hashInputs };
