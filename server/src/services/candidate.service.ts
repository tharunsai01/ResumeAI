import { CandidateProfile } from '../models';
import type {
  UpdateCandidateProfileInput,
  PatchCandidateProfileInput,
} from '../validators/candidate.validators';

export function calculateProfileCompletion(profile: {
  headline?: string | null;
  location?: string | null;
  phone?: string | null;
  summary?: string | null;
  skills?: string[];
  experience?: unknown[];
  education?: unknown[];
  links?: { linkedin?: string | null; github?: string | null; portfolio?: string | null } | null;
  preferredJobTypes?: string[];
}): number {
  let score = 0;

  // Headline: 10%
  if (profile.headline && profile.headline.trim().length > 0) {
    score += 10;
  }
  // Location: 5%
  if (profile.location && profile.location.trim().length > 0) {
    score += 5;
  }
  // Phone: 5%
  if (profile.phone && profile.phone.trim().length > 0) {
    score += 5;
  }
  // Summary: 15% (15% if >= 20 chars, 10% if < 20 chars)
  if (profile.summary && profile.summary.trim().length > 0) {
    score += profile.summary.trim().length >= 20 ? 15 : 10;
  }
  // Skills: 20% (20% if >= 3 skills, 10% if 1-2 skills)
  if (Array.isArray(profile.skills) && profile.skills.length > 0) {
    score += profile.skills.length >= 3 ? 20 : 10;
  }
  // Experience: 20%
  if (Array.isArray(profile.experience) && profile.experience.length > 0) {
    score += 20;
  }
  // Education: 15%
  if (Array.isArray(profile.education) && profile.education.length > 0) {
    score += 15;
  }
  // Links: 5% (at least one link provided)
  const links = profile.links;
  if (links && (links.linkedin || links.github || links.portfolio)) {
    score += 5;
  }
  // Preferred Job Types: 5%
  if (Array.isArray(profile.preferredJobTypes) && profile.preferredJobTypes.length > 0) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

export async function getProfileByUserId(userId: string) {
  let profile = await CandidateProfile.findOne({ user: userId }).populate(
    'user',
    'fullName email role isVerified createdAt',
  );

  if (!profile) {
    profile = await CandidateProfile.create({ user: userId });
    profile = await profile.populate('user', 'fullName email role isVerified createdAt');
  }

  const completion = calculateProfileCompletion(profile);
  if (profile.profileCompletion !== completion) {
    profile.profileCompletion = completion;
    await CandidateProfile.updateOne({ _id: profile._id }, { profileCompletion: completion });
  }

  return profile;
}

export async function updateProfile(userId: string, data: UpdateCandidateProfileInput) {
  let profile = await CandidateProfile.findOne({ user: userId });
  if (!profile) {
    profile = new CandidateProfile({ user: userId });
  }

  // Set fields safely (rejects mass-assignment and privilege escalation)
  if (data.headline !== undefined) profile.headline = data.headline ?? undefined;
  if (data.summary !== undefined) profile.summary = data.summary ?? undefined;
  if (data.phone !== undefined) profile.phone = data.phone ?? undefined;
  if (data.location !== undefined) profile.location = data.location ?? undefined;
  if (data.avatarUrl !== undefined) profile.avatarUrl = data.avatarUrl ?? undefined;
  if (data.skills !== undefined) profile.skills = data.skills;
  if (data.experience !== undefined) profile.experience = data.experience as any;
  if (data.education !== undefined) profile.education = data.education as any;
  if (data.links !== undefined) profile.links = data.links as any;
  if (data.preferredJobTypes !== undefined) profile.preferredJobTypes = data.preferredJobTypes as any;

  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();

  return profile.populate('user', 'fullName email role isVerified createdAt');
}

export async function patchProfile(userId: string, data: PatchCandidateProfileInput) {
  let profile = await CandidateProfile.findOne({ user: userId });
  if (!profile) {
    profile = new CandidateProfile({ user: userId });
  }

  if (data.headline !== undefined) profile.headline = data.headline ?? undefined;
  if (data.summary !== undefined) profile.summary = data.summary ?? undefined;
  if (data.phone !== undefined) profile.phone = data.phone ?? undefined;
  if (data.location !== undefined) profile.location = data.location ?? undefined;
  if (data.avatarUrl !== undefined) profile.avatarUrl = data.avatarUrl ?? undefined;
  if (data.skills !== undefined) profile.skills = data.skills;
  if (data.experience !== undefined) profile.experience = data.experience as any;
  if (data.education !== undefined) profile.education = data.education as any;
  if (data.links !== undefined) {
    const existingLinks = profile.links || {};
    profile.links = {
      linkedin: data.links?.linkedin ?? existingLinks.linkedin,
      github: data.links?.github ?? existingLinks.github,
      portfolio: data.links?.portfolio ?? existingLinks.portfolio,
    };
  }
  if (data.preferredJobTypes !== undefined) profile.preferredJobTypes = data.preferredJobTypes as any;

  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();

  return profile.populate('user', 'fullName email role isVerified createdAt');
}
