import type { Request, Response } from 'express';
import { Application, Interview } from '../models';
import { canTransition } from '../constants';
import { audit, notify } from '../services/audit';
import { ApiError } from '../utils/ApiError';
import { created, ok } from '../utils/response';

export async function scheduleInterview(req: Request, res: Response) {
  const { applicationId, ...data } = req.valid.body;
  const app = await Application.findById(applicationId).populate('job', 'title');
  if (!app) throw ApiError.notFound('Application');
  if (String(app.recruiter) !== req.user!.id) throw ApiError.forbidden();
  if (['hired', 'rejected', 'withdrawn'].includes(app.status)) throw ApiError.badRequest(`Cannot schedule an interview for a ${app.status} application`);

  // Overlap check for the recruiter's calendar
  const start = new Date(data.scheduledAt);
  const end = new Date(start.getTime() + data.durationMinutes * 60000);
  const clashes = await Interview.find({ recruiter: req.user!.id, status: 'scheduled', scheduledAt: { $lt: end, $gte: new Date(start.getTime() - 8 * 3600000) } }).lean();
  if (clashes.some((i) => new Date(i.scheduledAt).getTime() + i.durationMinutes * 60000 > start.getTime())) {
    throw ApiError.conflict('You already have an interview at that time');
  }

  const interview = await Interview.create({ ...data, application: app._id, job: app.job, candidate: app.candidate, recruiter: req.user!.id });
  if (app.status !== 'interview') {
    if (!canTransition(app.status as any, 'interview')) {
      // allow scheduling from applied/screened by passing through shortlisted
      app.statusHistory.push({ from: app.status, to: 'shortlisted', by: req.user!.id as any, actor: 'recruiter', note: 'Shortlisted when interview was scheduled', at: new Date() });
      app.status = 'shortlisted';
    }
    app.statusHistory.push({ from: app.status, to: 'interview', by: req.user!.id as any, actor: 'recruiter', note: 'Interview scheduled', at: new Date() });
    app.status = 'interview';
    await app.save();
  }
  const when = start.toUTCString().replace(' GMT', ' UTC');
  await notify(String(app.candidate), { type: 'interview', title: 'Interview scheduled', message: `${(app.job as any).title}: ${data.type} interview on ${when}.`, link: '/candidate/applications' });
  await audit(req, { action: 'interview.scheduled', category: 'interview', targetType: 'Interview', targetId: String(interview._id) });
  return created(res, interview);
}

export async function listInterviews(req: Request, res: Response) {
  const q = req.valid.query;
  const filter: Record<string, unknown> = req.user!.role === 'candidate' ? { candidate: req.user!.id } : req.user!.role === 'recruiter' ? { recruiter: req.user!.id } : {};
  if (q.from || q.to) filter.scheduledAt = { ...(q.from ? { $gte: q.from } : {}), ...(q.to ? { $lte: q.to } : {}) };
  if (q.status) filter.status = q.status;
  const items = await Interview.find(filter)
    .populate('job', 'title company')
    .populate('candidate', 'name email')
    .populate('recruiter', 'name')
    .sort({ scheduledAt: 1 })
    .limit(500)
    .lean();
  if (req.user!.role === 'candidate') for (const i of items as any[]) delete i.feedback;
  return ok(res, items);
}

export async function updateInterview(req: Request, res: Response) {
  const interview = await Interview.findOne({ _id: req.valid.params.id, recruiter: req.user!.id });
  if (!interview) throw ApiError.notFound('Interview');
  const before = { scheduledAt: interview.scheduledAt, status: interview.status };
  interview.set(req.valid.body);
  await interview.save();
  if (req.valid.body.scheduledAt || req.valid.body.status === 'cancelled') {
    await notify(String(interview.candidate), {
      type: 'interview',
      title: req.valid.body.status === 'cancelled' ? 'Interview cancelled' : 'Interview rescheduled',
      message: req.valid.body.status === 'cancelled' ? 'Your interview was cancelled by the recruiter.' : `New time: ${new Date(interview.scheduledAt).toUTCString()}`,
      link: '/candidate/applications',
    });
  }
  await audit(req, { action: 'interview.updated', category: 'interview', targetType: 'Interview', targetId: String(interview._id), metadata: { before } });
  return ok(res, interview);
}

export async function submitFeedback(req: Request, res: Response) {
  const interview = await Interview.findOne({ _id: req.valid.params.id, recruiter: req.user!.id });
  if (!interview) throw ApiError.notFound('Interview');
  interview.feedback = { ...req.valid.body, submittedAt: new Date() };
  if (interview.status === 'scheduled') interview.status = 'completed';
  await interview.save();
  return ok(res, interview);
}
