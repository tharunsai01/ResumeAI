import type { Request, Response } from 'express';
import { Application, CandidateProfile, Job, MatchResult, ScreeningSettings } from '../models';
import { MATCH_WEIGHTS } from '../constants';
import { aiClient } from '../services/aiClient';
import { audit } from '../services/audit';
import { candidateInput, customSkills, hashInputs, jobInput, matchCandidateToJob, saveMatch } from '../services/matching';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/response';

export async function matchJob(req: Request, res: Response) {
  const job = await Job.findOne({ _id: req.valid.params.jobId, status: 'published' }).select('_id').lean();
  if (!job) throw ApiError.notFound('Job');
  const result = await matchCandidateToJob(req.user!.id, String(job._id), { narrative: req.query.narrative === 'true' });
  return ok(res, result);
}

export async function myMatches(req: Request, res: Response) {
  const items = await MatchResult.find({ candidate: req.user!.id })
    .populate('job', 'title company status workMode location')
    .sort({ overallScore: -1 })
    .limit(50)
    .lean();
  return ok(res, items.filter((m: any) => m.job));
}

/** Rank open jobs for the candidate and cache the results. */
export async function recommendations(req: Request, res: Response) {
  const limit = Math.min(20, Number(req.query.limit) || 6);
  const { input, resumeId } = await candidateInput(req.user!.id);
  if (!input.skills.length && !input.job_titles.length) return ok(res, [], { reason: 'profile_empty' });
  const jobs = await Job.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(200).lean();
  if (!jobs.length) return ok(res, []);
  const custom = await customSkills();
  const ai = await aiClient.recommend({ candidate: input, jobs: jobs.map(jobInput), limit, custom_skills: custom });
  const byId = new Map(jobs.map((j) => [String(j._id), j]));
  const out = [];
  for (const r of ai.results) {
    const job = byId.get(String(r.job_id));
    if (!job) continue;
    const saved = await saveMatch(req.user!.id, job._id, r, hashInputs(input, jobInput(job), custom), resumeId);
    const { security: _s, ...publicJob } = job;
    out.push({ job: publicJob, match: { score: saved.overallScore, category: saved.category, components: saved.components, matchedSkills: saved.matchedSkills, missingSkills: saved.missingSkills } });
  }
  return ok(res, out);
}

export async function skillGap(req: Request, res: Response) {
  const { input } = await candidateInput(req.user!.id);
  const applied = await Application.find({ candidate: req.user!.id }).select('job').lean();
  const profile = await CandidateProfile.findOne({ user: req.user!.id }).select('bookmarkedJobs').lean();
  const ids = [...applied.map((a) => a.job), ...(profile?.bookmarkedJobs ?? [])];
  let jobs = await Job.find({ _id: { $in: ids } }).limit(50).lean();
  if (jobs.length < 5) {
    const more = await Job.find({ status: 'published', _id: { $nin: jobs.map((j) => j._id) } }).sort({ publishedAt: -1 }).limit(20 - jobs.length).lean();
    jobs = jobs.concat(more);
  }
  if (!jobs.length) return ok(res, { gaps: [], candidate_categories: {}, learning_recommendations: [], jobs_analysed: 0 });
  const result = await aiClient.skillGap({ candidate: input, jobs: jobs.map(jobInput), custom_skills: await customSkills() });
  return ok(res, result);
}

// --- recruiter screening ---------------------------------------------------------

async function ownedJob(req: Request) {
  const job = await Job.findById(req.valid.params.jobId).lean();
  if (!job) throw ApiError.notFound('Job');
  if (req.user!.role !== 'admin' && String(job.recruiter) !== req.user!.id) throw ApiError.forbidden();
  return job;
}

/** Score every active applicant. The AI only marks applicants as screened; people decide the rest. */
export async function runScreening(req: Request, res: Response) {
  const job = await ownedJob(req);
  const apps = await Application.find({ job: job._id, status: { $nin: ['withdrawn'] } }).lean();
  if (!apps.length) return ok(res, { screened: 0, results: [] });
  const inputs = [];
  for (const a of apps) {
    try {
      inputs.push({ app: a, ...(await candidateInput(a.candidate)) });
    } catch {
      /* candidate profile missing: skip */
    }
  }
  const custom = await customSkills();
  const jInput = jobInput(job);
  const ai = await aiClient.screen({ job: jInput, candidates: inputs.map((i) => i.input), custom_skills: custom });
  const byCandidate = new Map(inputs.map((i) => [String(i.app.candidate), i]));
  let screened = 0;
  for (const r of ai.results) {
    const entry = byCandidate.get(String(r.candidate_id));
    if (!entry) continue;
    const saved = await saveMatch(entry.app.candidate, job._id, r, hashInputs(entry.input, jInput, custom), entry.resumeId);
    const update: Record<string, any> = { matchResult: saved._id, matchScore: saved.overallScore, matchCategory: saved.category };
    const push = entry.app.status === 'applied' ? { statusHistory: { from: 'applied', to: 'screened', actor: 'system', note: 'AI screening completed', at: new Date() } } : undefined;
    if (entry.app.status === 'applied') {
      update.status = 'screened';
      screened += 1;
    }
    await Application.updateOne({ _id: entry.app._id }, { $set: update, ...(push ? { $push: push } : {}) });
  }
  await audit(req, { action: 'screening.run', category: 'application', targetType: 'Job', targetId: String(job._id), metadata: { candidates: ai.count } });
  return ok(res, { screened, total: ai.count });
}

export async function screeningResults(req: Request, res: Response) {
  const job = await ownedJob(req);
  const settings = (await ScreeningSettings.findOne({ job: job._id }).lean()) ?? { autoScreenOnApply: true, highlightThreshold: 80, blindReview: false };
  const apps = await Application.find({ job: job._id, status: { $ne: 'withdrawn' } })
    .populate('candidate', 'name email')
    .populate('matchResult')
    .populate('resume', 'originalName security.flagged reviewStatus')
    .lean();
  const ranked = apps
    .sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1))
    .map((a, i) => {
      const candidate = a.candidate as any;
      return {
        applicationId: a._id,
        rank: a.matchScore !== undefined && a.matchScore !== null ? i + 1 : null,
        status: a.status,
        candidate: settings.blindReview ? { _id: candidate._id, name: `Candidate ${String(candidate._id).slice(-4).toUpperCase()}` } : candidate,
        resume: a.resume,
        match: a.matchResult,
        appliedAt: a.createdAt,
      };
    });
  return ok(res, { job: { _id: job._id, title: job.title, requiredSkills: job.requiredSkills, preferredSkills: job.preferredSkills, minExperienceYears: job.minExperienceYears }, settings, weights: MATCH_WEIGHTS, results: ranked });
}

export async function getScreeningSettings(req: Request, res: Response) {
  const job = await ownedJob(req);
  const settings = (await ScreeningSettings.findOne({ job: job._id }).lean()) ?? { job: job._id, autoScreenOnApply: true, highlightThreshold: 80, blindReview: false };
  return ok(res, { ...settings, weights: MATCH_WEIGHTS, weightsEditable: false });
}

export async function updateScreeningSettings(req: Request, res: Response) {
  const job = await ownedJob(req);
  const settings = await ScreeningSettings.findOneAndUpdate({ job: job._id }, { ...req.valid.body, job: job._id, updatedBy: req.user!.id }, { upsert: true, new: true }).lean();
  return ok(res, { ...settings, weights: MATCH_WEIGHTS, weightsEditable: false });
}
