import { CandidateProfile, RecruiterProfile } from '../models';
import { ApiError } from '../utils/ApiError';
import { saveAvatar, deleteAvatar } from '../utils/imageUpload';

type ListKey = 'experience' | 'education';

// ---------- candidate ----------
export async function getCandidate(userId: string) {
  // get-or-create: any candidate always has a profile
  return CandidateProfile.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { upsert: true, new: true },
  );
}

export async function updateCandidate(userId: string, data: Record<string, unknown>) {
  if (Object.keys(data).length === 0) return getCandidate(userId);
  const profile = await CandidateProfile.findOneAndUpdate(
    { user: userId },
    { $set: data },
    { new: true, runValidators: true },
  );
  if (!profile) throw ApiError.notFound('Profile not found');
  return profile;
}

export async function setSkills(userId: string, input: string[]) {
  const seen = new Set<string>();
  const skills = input
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => {
      const key = s.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return updateCandidate(userId, { skills });
}

export async function addEntry(userId: string, key: ListKey, data: object) {
  const profile = await getCandidate(userId);
  const list: any = profile![key];
  list.push(data);
  await profile!.save();
  return profile;
}

export async function updateEntry(userId: string, key: ListKey, entryId: string, data: any) {
  const profile = await getCandidate(userId);
  const entry = (profile![key] as any).id(entryId);
  if (!entry) throw ApiError.notFound('Entry not found');
  entry.set(data);
  if (key === 'experience' && data.current) entry.set('endDate', undefined);
  await profile!.save();
  return profile;
}

export async function removeEntry(userId: string, key: ListKey, entryId: string) {
  const profile = await getCandidate(userId);
  const list: any = profile![key];
  if (!list.id(entryId)) throw ApiError.notFound('Entry not found');
  list.pull({ _id: entryId });
  await profile!.save();
  return profile;
}

// ---------- recruiter ----------
export async function getRecruiter(userId: string) {
  const profile = await RecruiterProfile.findOne({ user: userId });
  if (!profile) throw ApiError.notFound('Profile not found');
  return profile;
}

export async function updateRecruiter(userId: string, data: Record<string, unknown>) {
  if (Object.keys(data).length === 0) return getRecruiter(userId);
  const profile = await RecruiterProfile.findOneAndUpdate(
    { user: userId },
    { $set: data },
    { new: true, runValidators: true },
  );
  if (!profile) throw ApiError.notFound('Profile not found');
  return profile;
}

// ---------- avatar / logo ----------
export async function setAvatar(userId: string, role: string, file: Express.Multer.File | undefined) {
  const url = await saveAvatar(file);
  // findOneAndUpdate returns the document as it was BEFORE the update, so it holds the old file
  const before =
    role === 'recruiter'
      ? await RecruiterProfile.findOneAndUpdate({ user: userId }, { logoUrl: url })
      : await CandidateProfile.findOneAndUpdate({ user: userId }, { avatarUrl: url });

  if (!before) {
    await deleteAvatar(url);
    throw ApiError.notFound('Profile not found');
  }
  await deleteAvatar('logoUrl' in before ? (before as any).logoUrl : (before as any).avatarUrl);
  return url;
}

export async function removeAvatar(userId: string, role: string) {
  const before =
    role === 'recruiter'
      ? await RecruiterProfile.findOneAndUpdate({ user: userId }, { $unset: { logoUrl: 1 } })
      : await CandidateProfile.findOneAndUpdate({ user: userId }, { $unset: { avatarUrl: 1 } });
  await deleteAvatar(before && (role === 'recruiter' ? (before as any).logoUrl : (before as any).avatarUrl));
}
