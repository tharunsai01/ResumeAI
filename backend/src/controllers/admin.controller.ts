import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { pingDatabase } from '../config/db';
import { AiEvaluation, Application, AuditLog, CandidateProfile, Complaint, Interview, Job, RecruiterProfile, RefreshToken, Resume, User } from '../models';
import { metricsSnapshot } from '../middleware/security';
import { aiClient } from '../services/aiClient';
import { audit, notify } from '../services/audit';
import { candidateInput, customSkills, jobInput } from '../services/matching';
import { BENCHMARK_JOB, benchmarkCandidates } from '../seed/benchmark';
import { ApiError } from '../utils/ApiError';
import { escapeRegex, ok, pageMeta } from '../utils/response';

function daysAgo(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

async function dailySeries(model: mongoose.Model<any>, since: Date, match: Record<string, unknown> = {}) {
  const rows = await model.aggregate([
    { $match: { createdAt: { $gte: since }, ...match } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
  ]);
  const map = new Map(rows.map((r) => [r._id, r.count]));
  const out = [];
  for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: map.get(key) ?? 0 });
  }
  return out;
}

export async function platformAnalytics(_req: Request, res: Response) {
  const since = daysAgo(29);
  const [users, candidates, recruiters, admins, suspended, jobs, publishedJobs, applications, resumes, flaggedResumes, interviews, openTickets, appsByStatus, regSeries, appSeries, resumeSeries, activity] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ status: 'suspended' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'published' }),
      Application.countDocuments(),
      Resume.countDocuments({ deletedAt: null }),
      Resume.countDocuments({ 'security.flagged': true, reviewStatus: 'pending' }),
      Interview.countDocuments(),
      Complaint.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      dailySeries(User, since),
      dailySeries(Application, since),
      dailySeries(Resume, since),
      AuditLog.find().sort({ createdAt: -1 }).limit(10).select('action category severity actorEmail createdAt').lean(),
    ]);
  return ok(res, {
    totals: { users, candidates, recruiters, admins, suspended, jobs, publishedJobs, applications, resumes, flaggedResumes, interviews, openTickets },
    applicationsByStatus: Object.fromEntries(appsByStatus.map((a) => [a._id, a.count])),
    series: regSeries.map((r, i) => ({ date: r.date, registrations: r.count, applications: appSeries[i]?.count ?? 0, resumes: resumeSeries[i]?.count ?? 0 })),
    recentActivity: activity,
  });
}

export async function listUsers(req: Request, res: Response) {
  const q = req.valid.query;
  const filter: Record<string, unknown> = {};
  if (q.role) filter.role = q.role;
  if (q.status) filter.status = q.status;
  if (q.q) filter.$or = [{ name: { $regex: escapeRegex(q.q), $options: 'i' } }, { email: { $regex: escapeRegex(q.q), $options: 'i' } }];
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
    User.countDocuments(filter),
  ]);
  return ok(res, items, pageMeta(q.page, q.limit, total));
}

export async function userDetails(req: Request, res: Response) {
  const user = await User.findById(req.valid.params.id).lean();
  if (!user) throw ApiError.notFound('User');
  const [profile, history, stats] = await Promise.all([
    user.role === 'candidate'
      ? CandidateProfile.findOne({ user: user._id }).select('headline location completeness totalExperienceYears skills openToRecruiters').lean()
      : user.role === 'recruiter'
        ? RecruiterProfile.findOne({ user: user._id }).lean()
        : null,
    AuditLog.find({ $or: [{ actor: user._id }, { targetId: String(user._id) }] }).sort({ createdAt: -1 }).limit(50).lean(),
    user.role === 'candidate'
      ? Promise.all([Application.countDocuments({ candidate: user._id }), Resume.countDocuments({ candidate: user._id, deletedAt: null })]).then(([applications, resumes]) => ({ applications, resumes }))
      : user.role === 'recruiter'
        ? Promise.all([Job.countDocuments({ recruiter: user._id }), Application.countDocuments({ recruiter: user._id })]).then(([jobs, applications]) => ({ jobs, applications }))
        : {},
  ]);
  return ok(res, { user, profile, history, stats });
}

export async function suspendUser(req: Request, res: Response) {
  if (req.valid.params.id === req.user!.id) throw ApiError.badRequest('You cannot suspend your own account');
  const user = await User.findById(req.valid.params.id);
  if (!user) throw ApiError.notFound('User');
  if (user.role === 'admin') throw ApiError.forbidden('Administrators cannot be suspended from the dashboard');
  user.status = 'suspended';
  user.suspendedReason = req.valid.body.reason;
  await user.save();
  await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { revokedAt: new Date() });
  await audit(req, { action: 'admin.user_suspended', category: 'admin', severity: 'warning', targetType: 'User', targetId: String(user._id), metadata: { reason: req.valid.body.reason } });
  return ok(res, user);
}

export async function reactivateUser(req: Request, res: Response) {
  const user = await User.findByIdAndUpdate(req.valid.params.id, { status: 'active', $unset: { suspendedReason: 1 } }, { new: true });
  if (!user) throw ApiError.notFound('User');
  await audit(req, { action: 'admin.user_reactivated', category: 'admin', targetType: 'User', targetId: String(user._id) });
  return ok(res, user);
}

export async function auditLogs(req: Request, res: Response) {
  const q = req.valid.query;
  const filter: Record<string, unknown> = {};
  if (q.category) filter.category = q.category;
  if (q.severity) filter.severity = q.severity;
  if (q.q) filter.$or = [{ action: { $regex: escapeRegex(q.q), $options: 'i' } }, { actorEmail: { $regex: escapeRegex(q.q), $options: 'i' } }];
  if (q.from || q.to) filter.createdAt = { ...(q.from ? { $gte: q.from } : {}), ...(q.to ? { $lte: q.to } : {}) };
  const [items, total, bySeverity] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip((q.page - 1) * q.limit).limit(q.limit).lean(),
    AuditLog.countDocuments(filter),
    AuditLog.aggregate([{ $match: { createdAt: { $gte: daysAgo(6) } } }, { $group: { _id: { category: '$category', severity: '$severity' }, count: { $sum: 1 } } }]),
  ]);
  return ok(res, items, { ...pageMeta(q.page, q.limit, total), lastWeek: bySeverity.map((b) => ({ ...b._id, count: b.count })) });
}

export async function securityEvents(_req: Request, res: Response) {
  const [flagged, events] = await Promise.all([
    Resume.find({ 'security.flagged': true, deletedAt: null }).populate('candidate', 'name email').sort({ createdAt: -1 }).limit(100).select('originalName security reviewStatus createdAt candidate').lean(),
    AuditLog.find({ category: { $in: ['ai_security', 'auth'] }, severity: { $in: ['warning', 'critical'] } }).sort({ createdAt: -1 }).limit(100).lean(),
  ]);
  return ok(res, { flaggedResumes: flagged, events });
}

export async function reviewResume(req: Request, res: Response) {
  const resume = await Resume.findById(req.valid.params.id);
  if (!resume) throw ApiError.notFound('Resume');
  resume.reviewStatus = req.valid.body.decision;
  resume.reviewedBy = req.user!.id as any;
  resume.reviewedAt = new Date();
  await resume.save();
  await audit(req, { action: `admin.resume_${req.valid.body.decision}`, category: 'ai_security', targetType: 'Resume', targetId: String(resume._id), metadata: { note: req.valid.body.note } });
  await notify(String(resume.candidate), {
    type: 'resume',
    title: req.valid.body.decision === 'cleared' ? 'Resume review complete' : 'Resume needs a new upload',
    message: req.valid.body.decision === 'cleared' ? 'Your resume passed manual review.' : 'Your resume contained content we could not accept. Please upload a clean version.',
    link: '/candidate/resumes',
  });
  return ok(res, resume);
}

export async function runEvaluation(req: Request, res: Response) {
  const { mode, jobId } = req.valid.body;
  let payload: Record<string, unknown>;
  if (mode === 'benchmark') {
    payload = { job: BENCHMARK_JOB, candidates: benchmarkCandidates(), shortlist_threshold: 60 };
  } else {
    const job = await Job.findById(jobId).lean();
    if (!job) throw ApiError.notFound('Job');
    const apps = await Application.find({ job: job._id }).select('candidate').lean();
    if (!apps.length) throw ApiError.badRequest('This job has no applicants to evaluate');
    const candidates = [];
    for (const a of apps) {
      try {
        candidates.push((await candidateInput(a.candidate)).input);
      } catch {
        /* skip */
      }
    }
    // Real applicants carry no group labels: we never collect protected characteristics.
    payload = { job: jobInput(job), candidates, shortlist_threshold: 60, custom_skills: await customSkills() };
  }
  const result = await aiClient.evaluate(payload);
  const health = await aiClient.health().catch(() => ({}) as Record<string, unknown>);
  const evaluation = await AiEvaluation.create({
    mode,
    job: mode === 'job' ? jobId : undefined,
    runBy: req.user!.id,
    candidateCount: result.candidate_count,
    summary: {
      meanScore: result.score_distribution?.mean,
      counterfactualPassed: result.counterfactual_fairness?.passed,
      stabilityPassed: result.stability?.passed,
      impactRatio: result.adverse_impact?.ratio ?? null,
      formulaValid: result.formula_validation?.all_valid,
    },
    result,
    modelVersion: (health as any).model_version,
    embeddingBackend: result.model_comparison?.active_backend,
  });
  await audit(req, { action: 'ai.evaluation_run', category: 'admin', targetType: 'AiEvaluation', targetId: String(evaluation._id), metadata: { mode } });
  return ok(res, evaluation);
}

export async function listEvaluations(_req: Request, res: Response) {
  const items = await AiEvaluation.find().select('-result.results').populate('job', 'title').populate('runBy', 'name').sort({ createdAt: -1 }).limit(50).lean();
  return ok(res, items);
}

export async function getEvaluation(req: Request, res: Response) {
  const item = await AiEvaluation.findById(req.valid.params.id).populate('job', 'title').lean();
  if (!item) throw ApiError.notFound('Evaluation');
  return ok(res, item);
}

export async function systemHealth(_req: Request, res: Response) {
  const db = await pingDatabase();
  const aiStart = Date.now();
  let ai: Record<string, unknown> = { ok: false };
  try {
    const h = await aiClient.health();
    ai = { ok: h.status === 'ok', latencyMs: Date.now() - aiStart, ...h };
  } catch {
    ai = { ok: false, latencyMs: null };
  }
  return ok(res, {
    backend: { ok: true, node: process.version, ...metricsSnapshot() },
    database: { ...db, state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] ?? 'unknown' },
    ai,
    checkedAt: new Date().toISOString(),
  });
}
