import bcrypt from 'bcryptjs';
import {
  User, CandidateProfile, RecruiterProfile, Job, Application, MatchResult, Shortlist,
  Interview, Notification, Complaint, Resume, RefreshToken, AuthToken,
} from '../models';
import { ApiError } from '../utils/ApiError';
import { deleteAvatar } from '../utils/imageUpload';
import { publicUser } from './auth.service';

// Wrong password is a 400 on purpose: the frontend treats a 401 as "session expired" and logs out
async function verifyPassword(userId: string, password: string) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('User no longer exists');
  if (!user.passwordHash) {
    throw ApiError.badRequest('This account has no password yet. Use "Forgot password" to set one first.');
  }
  if (!(await bcrypt.compare(password, user.passwordHash))) {
    throw ApiError.badRequest('Password is incorrect');
  }
  return user;
}

export async function getPreferences(userId: string) {
  const user = await User.findById(userId).select('preferences');
  if (!user) throw ApiError.unauthorized('User no longer exists');
  return user.preferences;
}

export async function updatePreferences(
  userId: string,
  p: { theme?: string; notifications?: Record<string, boolean | undefined> },
) {
  // Keys here come from the Zod-validated object, never straight from the request
  const set: Record<string, unknown> = {};
  if (p.theme) set['preferences.theme'] = p.theme;
  for (const [k, v] of Object.entries(p.notifications ?? {})) {
    if (v !== undefined) set[`preferences.notifications.${k}`] = v;
  }
  if (Object.keys(set).length) await User.updateOne({ _id: userId }, { $set: set });
  return getPreferences(userId);
}

export async function updateName(userId: string, fullName: string) {
  const user = await User.findByIdAndUpdate(userId, { fullName }, { new: true });
  if (!user) throw ApiError.unauthorized('User no longer exists');
  return publicUser(user);
}

export async function changePassword(userId: string, current: string, next: string) {
  const user = await verifyPassword(userId, current);
  user.passwordHash = await bcrypt.hash(next, 12);
  await user.save();
  // Every session ends. Access tokens already issued last up to 15 more minutes.
  await RefreshToken.updateMany({ user: userId, revokedAt: { $exists: false } }, { revokedAt: new Date() });
}

export async function deleteAccount(userId: string, role: string, password: string) {
  if (role === 'admin') throw ApiError.forbidden('Admin accounts cannot be deleted here');
  await verifyPassword(userId, password);

  // Dependent data first, the user last: if something fails midway, the user still exists and can retry
  if (role === 'candidate') {
    await Promise.all([
      MatchResult.deleteMany({ candidate: userId }),
      Shortlist.deleteMany({ candidate: userId }),
      Interview.deleteMany({ candidate: userId }),
      Application.deleteMany({ candidate: userId }),
      Resume.deleteMany({ candidate: userId }), // Phase 4 will also delete the stored files here
    ]);
    const profile = await CandidateProfile.findOneAndDelete({ user: userId });
    await deleteAvatar(profile?.avatarUrl);
  } else {
    const jobIds = await Job.find({ recruiter: userId }).distinct('_id');
    await Promise.all([
      MatchResult.deleteMany({ job: { $in: jobIds } }),
      Shortlist.deleteMany({ job: { $in: jobIds } }),
      Interview.deleteMany({ job: { $in: jobIds } }),
      Application.deleteMany({ job: { $in: jobIds } }),
    ]);
    await Job.deleteMany({ recruiter: userId });
    const profile = await RecruiterProfile.findOneAndDelete({ user: userId });
    await deleteAvatar(profile?.logoUrl);
  }

  await Promise.all([
    Notification.deleteMany({ user: userId }),
    Complaint.deleteMany({ user: userId }),
    RefreshToken.deleteMany({ user: userId }),
    AuthToken.deleteMany({ user: userId }),
  ]);
  await User.deleteOne({ _id: userId });
}
