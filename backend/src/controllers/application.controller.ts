import type { Request, Response } from 'express';
import { Application, CandidateProfile, Job, Resume, ScreeningSettings, User } from '../models';
import { canTransition, type ApplicationStatus } from '../constants';
import { audit, notify } from '../services/audit';
import { matchCandidateToJob } from '../services/matching';
import { ApiError } from '../utils/ApiError';
import { created, escapeRegex, ok, pageMeta } from '../utils/response';
import { logger } from '../utils/logger';

const STATUS_COPY: Record<string, string> = {
  screened: 'Your application has been reviewed',
  shortlisted: 'You have been shortlisted',
  interview: 'You are moving to interviews',
  hired: 'Congratulations, you received an offer',
  rejected: 'Update on your application',
  applied: 'Your application is back under review',
};

export async function apply(req: Request, res: Response) {
  const { jobId, coverLetter, resumeId } = req.valid.body;
  const job = await Job.findOne({ _id: jobId, status: 'published' });
  if (!job) throw ApiError.notFound('Open job');
  if (job.deadline && job.deadline < new Date()) throw ApiError.badRequest('The application deadline has passed');
  if (await Application.exists({ job: jobId, candidate: req.user!.id })) throw ApiError.conflict('You have already applied to this job');

  const profile = await CandidateProfile.findOne({ user: req.user!.id }).lean();
  const resumeRef = resumeId ?? profile?.activeResume;
  if (resumeRef) {
    const resume = await Resume.findOne({ _id: resumeRef, candidate: req.user!.id, status: 'completed', deletedAt: null }).lean();
    if (!resume) throw ApiError.badRequest('Select a fully analysed resume');
    if (resume.reviewStatus === 'rejected') throw ApiError.badRequest('This resume was rejected in security review. Upload a new one.');
  } else if (!profile?.skills?.length) {
    throw ApiError.badRequest('Upload a resume or add skills to your profile before applying');
  }

  const application = await Application.create({
    job: job._id,
    candidate: req.user!.id,
    recruiter: job.recruiter,
    resume: resumeRef,
    coverLetter,
    status: 'applied',
    statusHistory: [{ from: null, to: 'applied', by: req.user!.id, actor: 'candidate', at: new Date() }],
  });
  await Job.updateOne({ _id: job._id }, { $inc: { applicationsCount: 1 } });

  // Score right away when the recruiter has auto-screening on. Failure never blocks the application.
  const settings = await ScreeningSettings.findOne({ job: job._id }).lean();
  if (settings?.autoScreenOnApply ?? true) {
    try {
      const match = await matchCandidateToJob(req.user!.id, String(job._id));
      application.matchResult = match._id;
      application.matchScore = match.overallScore;
      application.matchCategory = match.category;
      await application.save();
    } catch (err) {
      logger.warn({ err: (err as Error).message }, 'Auto-scoring on apply failed');
    }
  }

  await notify(String(job.recruiter), { type: 'application', title: 'New application', message: `${req.user!.name} applied for ${job.title}`, link: `/recruiter/screening?job=${job._id}` });
  await audit(req, { action: 'application.created', category: 'application', targetType: 'Application', targetId: String(application._id) });
  return created(res, application);
}

export async function myApplications(req: Request, res: Response) {
  const items = await Application.find({ candidate: req.user!.id })
    .populate('job', 'title company location workMode employmentType status salary')
    .select('-recruiterNotes')
    .sort({ createdAt: -1 })
    .lean();
  return ok(res, items);
}

export async function withdraw(req: Request, res: Response) {
  const app = await Application.findOne({ _id: req.valid.params.id, candidate: req.user!.id });
  if (!app) throw ApiError.notFound('Application');
  if (['hired', 'rejected', 'withdrawn'].includes(app.status)) throw ApiError.badRequest('This application can no longer be withdrawn');
  app.statusHistory.push({ from: app.status, to: 'withdrawn', by: req.user!.id as any, actor: 'candidate', at: new Date() });
  app.status = 'withdrawn';
  await app.save();
  await notify(String(app.recruiter), { type: 'application', title: 'Application withdrawn', message: `${req.user!.name} withdrew an application`, link: '/recruiter/pipeline' });
  return ok(res, app);
}

export async function getApplication(req: Request, res: Response) {
  const app = await Application.findById(req.valid.params.id)
    .populate('job', 'title company location requiredSkills preferredSkills')
    .populate('candidate', 'name email')
    .populate('matchResult')
    .lean();
  if (!app) throw ApiError.notFound('Application');
  const { id, role } = req.user!;
  const isCandidate = String((app.candidate as any)._id) === id;
  if (role !== 'admin' && !isCandidate && String(app.recruiter) !== id) throw ApiError.forbidden();
  if (isCandidate) delete (app as any).recruiterNotes;
  return ok(res, app);
}

/** Recruiter listing used by the screening hub and the Kanban pipeline. */
export async function recruiterApplications(req: Request, res: Response) {
  const q = req.valid.query;
  const filter: Record<string, unknown> = { recruiter: req.user!.id };
  if (q.jobId) filter.job = q.jobId;
  if (q.status) filter.status = q.status;
  else filter.status = { $ne: 'withdrawn' };
  if (q.minScore !== undefined) filter.matchScore = { $gte: q.minScore };
  if (q.q) {
    const users = await User.find({ name: { $regex: escapeRegex(q.q), $options: 'i' }, role: 'candidate' }).select('_id').limit(200).lean();
    filter.candidate = { $in: users.map((u) => u._id) };
  }
  const [items, total] = await Promise.all([
    Application.find(filter)
      .populate('job', 'title company')
      .populate('candidate', 'name email')
      .populate('matchResult', 'overallScore category components matchedSkills missingSkills')
      .sort({ matchScore: -1, createdAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .lean(),
    Application.countDocuments(filter),
  ]);
  return ok(res, items, pageMeta(q.page, q.limit, total));
}

/** Human decision: move a candidate through the pipeline. */
export async function updateStatus(req: Request, res: Response) {
  const { status, note } = req.valid.body as { status: ApplicationStatus; note?: string };
  const app = await Application.findById(req.valid.params.id).populate('job', 'title');
  if (!app) throw ApiError.notFound('Application');
  if (req.user!.role !== 'admin' && String(app.recruiter) !== req.user!.id) throw ApiError.forbidden();
  const from = app.status as ApplicationStatus;
  if (!canTransition(from, status)) throw ApiError.badRequest(`Cannot move an application from ${from} to ${status}`);
  app.statusHistory.push({ from, to: status, by: req.user!.id as any, actor: req.user!.role === 'admin' ? 'admin' : 'recruiter', note, at: new Date() });
  app.status = status;
  await app.save();
  const jobTitle = (app.job as any)?.title ?? 'a job';
  await notify(String(app.candidate), { type: 'application_status', title: STATUS_COPY[status] ?? 'Application update', message: `${jobTitle}: status changed to ${status}.`, link: '/candidate/applications' });
  await audit(req, { action: 'application.status_changed', category: 'application', targetType: 'Application', targetId: String(app._id), metadata: { from, to: status } });
  return ok(res, app);
}

export async function updateNotes(req: Request, res: Response) {
  const app = await Application.findOneAndUpdate({ _id: req.valid.params.id, recruiter: req.user!.id }, { recruiterNotes: req.valid.body.recruiterNotes }, { new: true });
  if (!app) throw ApiError.notFound('Application');
  return ok(res, app);
}
