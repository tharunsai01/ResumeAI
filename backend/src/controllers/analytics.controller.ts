import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Application, CandidateProfile, Interview, Job, MatchResult, Notification, Resume, User } from '../models';
import { escapeRegex, ok, pageMeta } from '../utils/response';

const oid = (id: string) => new mongoose.Types.ObjectId(id);

function lastNDays(n: number) {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

async function series(match: Record<string, unknown>, days = 30) {
  const since = new Date(Date.now() - days * 86400000);
  const rows = await Application.aggregate([
    { $match: { ...match, createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
  ]);
  const map = new Map(rows.map((r) => [r._id, r.count]));
  return lastNDays(days).map((date) => ({ date, count: map.get(date) ?? 0 }));
}

export async function candidateDashboard(req: Request, res: Response) {
  const me = oid(req.user!.id);
  const [profile, byStatus, upcoming, resumes, recent, notifications, timeline, avgMatch] = await Promise.all([
    CandidateProfile.findOne({ user: me }).select('completeness headline skills activeResume openToRecruiters').lean(),
    Application.aggregate([{ $match: { candidate: me } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Interview.find({ candidate: me, status: 'scheduled', scheduledAt: { $gte: new Date() } }).populate('job', 'title company').sort({ scheduledAt: 1 }).limit(5).lean(),
    Resume.countDocuments({ candidate: me, deletedAt: null }),
    Application.find({ candidate: me }).populate('job', 'title company').sort({ updatedAt: -1 }).limit(6).select('status job updatedAt matchScore').lean(),
    Notification.find({ user: me }).sort({ createdAt: -1 }).limit(6).lean(),
    series({ candidate: me }),
    MatchResult.aggregate([{ $match: { candidate: me } }, { $group: { _id: null, avg: { $avg: '$overallScore' }, n: { $sum: 1 } } }]),
  ]);
  const s = Object.fromEntries(byStatus.map((b) => [b._id, b.count])) as Record<string, number>;
  const total = byStatus.reduce((a, b) => a + b.count, 0);
  return ok(res, {
    profile: { completeness: profile?.completeness ?? 0, headline: profile?.headline ?? '', skills: profile?.skills?.length ?? 0, hasActiveResume: !!profile?.activeResume, openToRecruiters: !!profile?.openToRecruiters },
    stats: {
      totalApplications: total,
      activeApplications: total - (s.hired ?? 0) - (s.rejected ?? 0) - (s.withdrawn ?? 0),
      interviews: s.interview ?? 0,
      shortlisted: s.shortlisted ?? 0,
      hired: s.hired ?? 0,
      resumes,
      averageMatch: avgMatch[0] ? Math.round(avgMatch[0].avg * 10) / 10 : null,
      matchesComputed: avgMatch[0]?.n ?? 0,
    },
    byStatus: s,
    timeline,
    upcomingInterviews: upcoming,
    recentApplications: recent,
    recentActivity: notifications,
  });
}

export async function recruiterDashboard(req: Request, res: Response) {
  const me = oid(req.user!.id);
  const [activeJobs, totalJobs, byStatus, candidates, aiScreened, upcoming, perJob, scoreDist, timeline, recent] = await Promise.all([
    Job.countDocuments({ recruiter: me, status: 'published' }),
    Job.countDocuments({ recruiter: me }),
    Application.aggregate([{ $match: { recruiter: me } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Application.distinct('candidate', { recruiter: me }),
    Application.countDocuments({ recruiter: me, matchScore: { $ne: null } }),
    Interview.find({ recruiter: me, status: 'scheduled', scheduledAt: { $gte: new Date() } }).populate('candidate', 'name').populate('job', 'title').sort({ scheduledAt: 1 }).limit(6).lean(),
    Application.aggregate([
      { $match: { recruiter: me } },
      { $group: { _id: '$job', applications: { $sum: 1 }, avgScore: { $avg: '$matchScore' } } },
      { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'job' } },
      { $unwind: '$job' },
      { $project: { title: '$job.title', applications: 1, avgScore: { $round: ['$avgScore', 1] } } },
      { $sort: { applications: -1 } },
      { $limit: 8 },
    ]),
    Application.aggregate([{ $match: { recruiter: me, matchScore: { $ne: null } } }, { $bucket: { groupBy: '$matchScore', boundaries: [0, 20, 40, 60, 80, 101], default: 'other', output: { count: { $sum: 1 } } } }]),
    series({ recruiter: me }),
    Application.find({ recruiter: me }).populate('candidate', 'name').populate('job', 'title').sort({ createdAt: -1 }).limit(6).select('candidate job status matchScore createdAt').lean(),
  ]);
  const s = Object.fromEntries(byStatus.map((b) => [b._id, b.count])) as Record<string, number>;
  const labels: Record<string, string> = { 0: '0-19', 20: '20-39', 40: '40-59', 60: '60-79', 80: '80-100' };
  return ok(res, {
    stats: {
      activeJobs,
      totalJobs,
      totalCandidates: candidates.length,
      applications: byStatus.reduce((a, b) => a + b.count, 0),
      aiScreened,
      shortlisted: s.shortlisted ?? 0,
      interviews: s.interview ?? 0,
      hired: s.hired ?? 0,
    },
    funnel: ['applied', 'screened', 'shortlisted', 'interview', 'hired'].map((stage) => ({ stage, count: s[stage] ?? 0 })),
    byStatus: s,
    perJob,
    scoreDistribution: Object.keys(labels).map((k) => ({ range: labels[k], count: scoreDist.find((b) => String(b._id) === k)?.count ?? 0 })),
    timeline,
    upcomingInterviews: upcoming,
    recentApplications: recent,
  });
}

/** Talent pool: candidates who opted in, plus anyone who applied to this recruiter. */
export async function talentPool(req: Request, res: Response) {
  const q = req.valid.query;
  const applicants = await Application.distinct('candidate', { recruiter: req.user!.id });
  const filter: Record<string, unknown> = { $or: [{ openToRecruiters: true }, { user: { $in: applicants } }] };
  const and: Record<string, unknown>[] = [];
  if (q.skills) {
    const skills = String(q.skills).split(',').map((s) => s.trim()).filter(Boolean).slice(0, 10);
    for (const s of skills) and.push({ 'skills.name': { $regex: `^${escapeRegex(s)}$`, $options: 'i' } });
  }
  if (q.minYears !== undefined) and.push({ totalExperienceYears: { $gte: q.minYears } });
  if (q.education !== undefined) and.push({ highestEducationLevel: { $gte: q.education } });
  if (q.q) {
    const users = await User.find({ role: 'candidate', name: { $regex: escapeRegex(q.q), $options: 'i' } }).select('_id').limit(300).lean();
    and.push({ $or: [{ headline: { $regex: escapeRegex(q.q), $options: 'i' } }, { user: { $in: users.map((u) => u._id) } }] });
  }
  if (and.length) filter.$and = and;
  const [items, total] = await Promise.all([
    CandidateProfile.find(filter)
      .populate('user', 'name')
      .select('user headline location skills totalExperienceYears highestEducationLevel completeness openToRecruiters updatedAt')
      .sort({ completeness: -1, updatedAt: -1 })
      .skip((q.page - 1) * q.limit)
      .limit(q.limit)
      .lean(),
    CandidateProfile.countDocuments(filter),
  ]);
  const applied = new Set(applicants.map(String));
  let scores = new Map<string, number>();
  if (q.jobId) {
    const m = await MatchResult.find({ job: q.jobId, candidate: { $in: items.map((i) => i.user) } }).select('candidate overallScore').lean();
    scores = new Map(m.map((x) => [String(x.candidate), x.overallScore]));
  }
  return ok(
    res,
    items.map((p) => ({ ...p, appliedToYou: applied.has(String((p.user as any)?._id)), matchScore: scores.get(String((p.user as any)?._id)) ?? null })),
    pageMeta(q.page, q.limit, total),
  );
}
