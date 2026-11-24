import type { Request, Response } from 'express';
import { Application, CandidateProfile, Job, MatchResult, RecruiterProfile } from '../models';
import { aiClient } from '../services/aiClient';
import { audit } from '../services/audit';
import { customSkills } from '../services/matching';
import { ApiError } from '../utils/ApiError';
import { created, escapeRegex, ok, pageMeta } from '../utils/response';

async function scanJob(title: string, description: string) {
  try {
    const r = await aiClient.extractJob(title, description, []);
    return { flagged: !!r.security?.flagged, riskScore: r.security?.risk_score ?? 0, findings: r.security?.findings ?? [] };
  } catch {
    return undefined; // AI down: the job is still saved; scan runs on next edit
  }
}

async function ownJob(req: Request) {
  const job = await Job.findById(req.valid.params.id);
  if (!job) throw ApiError.notFound('Job');
  if (req.user!.role !== 'admin' && String(job.recruiter) !== req.user!.id) throw ApiError.forbidden('You do not own this job');
  return job;
}

export async function listPublicJobs(req: Request, res: Response) {
  const q = req.valid.query;
  const filter: Record<string, unknown> = { status: 'published' };
  if (q.q) filter.$or = [{ title: { $regex: escapeRegex(q.q), $options: 'i' } }, { company: { $regex: escapeRegex(q.q), $options: 'i' } }, { requiredSkills: { $regex: escapeRegex(q.q), $options: 'i' } }];
  if (q.workMode) filter.workMode = q.workMode;
  if (q.employmentType) filter.employmentType = q.employmentType;
  if (q.location) filter.location = { $regex: escapeRegex(q.location), $options: 'i' };
  if (q.minSalary) filter['salary.max'] = { $gte: q.minSalary };
  if (q.maxExperience !== undefined) filter.minExperienceYears = { $lte: q.maxExperience };
  if (q.skills) {
    const skills = String(q.skills).split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10);
    if (skills.length) filter.requiredSkills = { $in: skills.map((s) => new RegExp(`^${escapeRegex(s)}$`, 'i')) };
  }
  const sort: Record<string, 1 | -1> = q.sort === 'salary' ? { 'salary.max': -1 } : { publishedAt: -1 };
  const [items, total] = await Promise.all([
    Job.find(filter).sort(sort).skip((q.page - 1) * q.limit).limit(q.limit).select('-security').lean(),
    Job.countDocuments(filter),
  ]);

  // Attach cached match scores and bookmark state for signed-in candidates
  if (req.user?.role === 'candidate' && items.length) {
    const [matches, profile] = await Promise.all([
      MatchResult.find({ candidate: req.user.id, job: { $in: items.map((j) => j._id) } }).select('job overallScore category').lean(),
      CandidateProfile.findOne({ user: req.user.id }).select('bookmarkedJobs').lean(),
    ]);
    const byJob = new Map(matches.map((m) => [String(m.job), m]));
    const bookmarks = new Set((profile?.bookmarkedJobs ?? []).map(String));
    for (const item of items as any[]) {
      const m = byJob.get(String(item._id));
      item.match = m ? { score: m.overallScore, category: m.category } : null;
      item.bookmarked = bookmarks.has(String(item._id));
    }
  }
  return ok(res, items, pageMeta(q.page, q.limit, total));
}

export async function getJob(req: Request, res: Response) {
  const job = await Job.findById(req.valid.params.id).lean();
  if (!job) throw ApiError.notFound('Job');
  const isOwner = req.user && (req.user.role === 'admin' || String(job.recruiter) === req.user.id);
  if (job.status !== 'published' && !isOwner) throw ApiError.notFound('Job');
  if (!isOwner) await Job.updateOne({ _id: job._id }, { $inc: { views: 1 } });
  const recruiter = await RecruiterProfile.findOne({ user: job.recruiter }).select('company companyWebsite industry companySize about location').lean();
  let extra: Record<string, unknown> = {};
  if (req.user?.role === 'candidate') {
    const [application, profile] = await Promise.all([
      Application.findOne({ job: job._id, candidate: req.user.id }).select('status createdAt').lean(),
      CandidateProfile.findOne({ user: req.user.id }).select('bookmarkedJobs').lean(),
    ]);
    extra = { application, bookmarked: (profile?.bookmarkedJobs ?? []).some((b) => String(b) === String(job._id)) };
  }
  const { security, ...rest } = job;
  return ok(res, { ...rest, ...(isOwner ? { security } : {}), companyProfile: recruiter, ...extra });
}

export async function myJobs(req: Request, res: Response) {
  const q = req.valid.query;
  const filter: Record<string, unknown> = { recruiter: req.user!.id };
  if (q.status) filter.status = q.status;
  if (q.q) filter.title = { $regex: escapeRegex(q.q), $options: 'i' };
  const [items, total] = await Promise.all([
    Job.find(filter).sort({ updatedAt: -1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
    Job.countDocuments(filter),
  ]);
  return ok(res, items, pageMeta(q.page, q.limit, total));
}

export async function createJob(req: Request, res: Response) {
  const { publish, ...data } = req.valid.body;
  const recruiter = await RecruiterProfile.findOne({ user: req.user!.id }).lean();
  const company = data.company || recruiter?.company;
  if (!company) throw ApiError.badRequest('Set your company name in your profile or on the job');
  const job = await Job.create({
    ...data,
    company,
    recruiter: req.user!.id,
    status: publish ? 'published' : 'draft',
    publishedAt: publish ? new Date() : undefined,
    security: await scanJob(data.title, data.description),
  });
  await audit(req, { action: publish ? 'job.published' : 'job.created', category: 'job', targetType: 'Job', targetId: String(job._id) });
  return created(res, job);
}

export async function updateJob(req: Request, res: Response) {
  const job = await ownJob(req);
  if (job.status === 'closed') throw ApiError.badRequest('Closed jobs cannot be edited. Reopen by publishing again.');
  job.set(req.valid.body);
  if (req.valid.body.title || req.valid.body.description) {
    const scan = await scanJob(job.title, job.description);
    if (scan) job.security = scan as any;
  }
  await job.save();
  await audit(req, { action: 'job.updated', category: 'job', targetType: 'Job', targetId: String(job._id) });
  return ok(res, job);
}

export async function publishJob(req: Request, res: Response) {
  const job = await ownJob(req);
  if (job.status === 'published') return ok(res, job);
  if (!job.requiredSkills.length) throw ApiError.badRequest('Add at least one required skill before publishing');
  job.status = 'published';
  job.publishedAt = new Date();
  job.closedAt = undefined;
  await job.save();
  await audit(req, { action: 'job.published', category: 'job', targetType: 'Job', targetId: String(job._id) });
  return ok(res, job);
}

export async function closeJob(req: Request, res: Response) {
  const job = await ownJob(req);
  job.status = 'closed';
  job.closedAt = new Date();
  await job.save();
  await audit(req, { action: 'job.closed', category: 'job', targetType: 'Job', targetId: String(job._id) });
  return ok(res, job);
}

export async function deleteJob(req: Request, res: Response) {
  const job = await ownJob(req);
  if (job.status !== 'draft' || job.applicationsCount > 0) throw ApiError.badRequest('Only drafts without applications can be deleted. Close the job instead.');
  await job.deleteOne();
  await audit(req, { action: 'job.deleted', category: 'job', targetType: 'Job', targetId: String(job._id) });
  return ok(res, { deleted: true });
}

export async function jobAnalytics(req: Request, res: Response) {
  const job = await ownJob(req);
  const [byStatus, scores, timeline] = await Promise.all([
    Application.aggregate([{ $match: { job: job._id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Application.find({ job: job._id, matchScore: { $ne: null } }).select('matchScore').lean(),
    Application.aggregate([
      { $match: { job: job._id } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  const buckets = [0, 0, 0, 0, 0];
  for (const s of scores) buckets[Math.min(4, Math.floor((s.matchScore ?? 0) / 20))] += 1;
  return ok(res, {
    views: job.views,
    applications: job.applicationsCount,
    byStatus: Object.fromEntries(byStatus.map((b) => [b._id, b.count])),
    scoreDistribution: buckets.map((count, i) => ({ range: `${i * 20}-${i * 20 + 19}`, count })),
    averageScore: scores.length ? Math.round((scores.reduce((a, s) => a + (s.matchScore ?? 0), 0) / scores.length) * 10) / 10 : null,
    timeline: timeline.map((t) => ({ date: t._id, count: t.count })),
  });
}

/** Ask the AI service to pull skills, experience and education from a job description. */
export async function extractJob(req: Request, res: Response) {
  const result = await aiClient.extractJob(req.valid.body.title, req.valid.body.description, await customSkills());
  return ok(res, result);
}

export async function toggleBookmark(req: Request, res: Response) {
  const job = await Job.findOne({ _id: req.valid.params.id, status: 'published' }).select('_id').lean();
  if (!job) throw ApiError.notFound('Job');
  const op = req.method === 'DELETE' ? { $pull: { bookmarkedJobs: job._id } } : { $addToSet: { bookmarkedJobs: job._id } };
  await CandidateProfile.updateOne({ user: req.user!.id }, op);
  return ok(res, { bookmarked: req.method !== 'DELETE' });
}

export async function bookmarks(req: Request, res: Response) {
  const profile = await CandidateProfile.findOne({ user: req.user!.id }).select('bookmarkedJobs').lean();
  const jobs = await Job.find({ _id: { $in: profile?.bookmarkedJobs ?? [] } }).select('-security').lean();
  return ok(res, jobs.map((j) => ({ ...j, bookmarked: true })));
}
