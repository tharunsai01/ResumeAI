import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { Application, CandidateProfile, RecruiterProfile, RefreshToken, Resume, User } from '../models';
import { audit } from '../services/audit';
import { ApiError } from '../utils/ApiError';
import { ok } from '../utils/response';

export function profileCompleteness(p: any, userName?: string): number {
  const checks = [
    !!userName,
    !!p.headline,
    (p.summary?.length ?? 0) >= 40,
    !!p.location,
    (p.skills?.length ?? 0) >= 5,
    (p.experience?.length ?? 0) > 0,
    (p.education?.length ?? 0) > 0,
    (p.projects?.length ?? 0) > 0 || (p.certifications?.length ?? 0) > 0,
    !!(p.socialLinks?.linkedin || p.socialLinks?.github || p.socialLinks?.portfolio),
    !!p.activeResume,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export async function getMyCandidateProfile(req: Request, res: Response) {
  const profile = await CandidateProfile.findOne({ user: req.user!.id }).populate('activeResume', 'originalName status createdAt security.flagged').lean();
  if (!profile) throw ApiError.notFound('Profile');
  return ok(res, { ...profile, name: req.user!.name, email: req.user!.email });
}

export async function updateMyCandidateProfile(req: Request, res: Response) {
  const { name, ...data } = req.valid.body;
  if (name) await User.updateOne({ _id: req.user!.id }, { name });
  const profile = await CandidateProfile.findOne({ user: req.user!.id });
  if (!profile) throw ApiError.notFound('Profile');
  profile.set(data);
  if (data.education) profile.highestEducationLevel = Math.max(0, ...data.education.map((e: any) => e.level || 0));
  profile.completeness = profileCompleteness(profile, name ?? req.user!.name);
  await profile.save();
  return ok(res, { ...profile.toObject(), name: name ?? req.user!.name, email: req.user!.email });
}

/** Candidate reviews extracted resume data and merges it into the profile. */
export async function applyResumeToProfile(req: Request, res: Response) {
  const resume = await Resume.findOne({ _id: req.valid.params.id, candidate: req.user!.id, status: 'completed', deletedAt: null }).lean();
  if (!resume) throw ApiError.notFound('Analysed resume');
  const parsed = (resume.analysis as any)?.profile ?? {};
  const profile = await CandidateProfile.findOne({ user: req.user!.id });
  if (!profile) throw ApiError.notFound('Profile');
  const sections: string[] = Array.isArray(req.body?.sections) ? req.body.sections : ['skills', 'experience', 'education', 'summary'];

  if (sections.includes('skills')) {
    const have = new Set(profile.skills.map((s) => s.name.toLowerCase()));
    for (const s of parsed.skills ?? []) if (!have.has(String(s.name).toLowerCase())) profile.skills.push({ name: s.name, level: 'intermediate' });
  }
  if (sections.includes('experience') && parsed.experience?.length && !profile.experience.length) {
    for (const e of parsed.experience.slice(0, 20)) {
      const current = /present|current/i.test(e.end) || new Date(e.end + '-01') >= new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      profile.experience.push({ title: e.title || 'Role', company: e.company || '', startDate: new Date(e.start + '-01'), endDate: current ? undefined : new Date(e.end + '-01'), current, description: e.description || '' });
    }
    profile.totalExperienceYears = parsed.total_experience_years || profile.totalExperienceYears;
  }
  if (sections.includes('education') && parsed.education?.length && !profile.education.length) {
    for (const e of parsed.education.slice(0, 10)) profile.education.push({ institution: e.institution, degree: e.degree, field: e.field, level: e.level, endYear: e.year ?? undefined });
    profile.highestEducationLevel = parsed.highest_education_level || 0;
  }
  if (sections.includes('summary')) {
    if (!profile.headline && parsed.headline) profile.headline = String(parsed.headline).slice(0, 150);
    if (!profile.summary && parsed.summary) profile.summary = String(parsed.summary).slice(0, 3000);
  }
  if (!profile.totalExperienceYears && parsed.total_experience_years) profile.totalExperienceYears = parsed.total_experience_years;
  profile.completeness = profileCompleteness(profile, req.user!.name);
  await profile.save();
  return ok(res, profile.toObject());
}

/** Recruiters see a candidate only if the candidate applied to one of their jobs or opted in. */
export async function getCandidateForRecruiter(req: Request, res: Response) {
  const userId = req.valid.params.id;
  const profile = await CandidateProfile.findOne({ user: userId }).populate('user', 'name email').lean();
  if (!profile) throw ApiError.notFound('Candidate');
  if (req.user!.role === 'recruiter') {
    const applied = await Application.exists({ candidate: userId, recruiter: req.user!.id });
    if (!applied && !profile.openToRecruiters) throw ApiError.forbidden('This candidate has not shared their profile with you');
  }
  const { bookmarkedJobs: _b, ...rest } = profile;
  return ok(res, rest);
}

export async function getMyRecruiterProfile(req: Request, res: Response) {
  const profile = await RecruiterProfile.findOne({ user: req.user!.id }).lean();
  if (!profile) throw ApiError.notFound('Profile');
  return ok(res, { ...profile, name: req.user!.name, email: req.user!.email });
}

export async function updateMyRecruiterProfile(req: Request, res: Response) {
  const { name, ...data } = req.valid.body;
  if (name) await User.updateOne({ _id: req.user!.id }, { name });
  const profile = await RecruiterProfile.findOneAndUpdate({ user: req.user!.id }, data, { new: true, runValidators: true }).lean();
  return ok(res, { ...profile, name: name ?? req.user!.name, email: req.user!.email });
}

export async function updatePreferences(req: Request, res: Response) {
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(req.valid.body)) if (v !== undefined) update[`preferences.${k}`] = v;
  const user = await User.findByIdAndUpdate(req.user!.id, { $set: update }, { new: true });
  return ok(res, { user: user?.toJSON() });
}

export async function changePassword(req: Request, res: Response) {
  const user = await User.findById(req.user!.id).select('+passwordHash');
  if (!user?.passwordHash) throw ApiError.badRequest('This account signs in with a social provider');
  if (!(await bcrypt.compare(req.valid.body.currentPassword, user.passwordHash))) throw ApiError.badRequest('Current password is incorrect');
  user.passwordHash = await bcrypt.hash(req.valid.body.newPassword, 12);
  await user.save();
  await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { revokedAt: new Date() });
  await audit(req, { action: 'auth.password_changed', category: 'auth' });
  return ok(res, { changed: true });
}
