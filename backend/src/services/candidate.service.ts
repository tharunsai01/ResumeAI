import { CandidateProfile, Resume, Application, Job, Interview, Notification } from '../models';
import { ApiError } from '../utils/ApiError';
import type {
  UpdateCandidateProfileInput,
  PatchCandidateProfileInput,
} from '../validators/candidate.validators';

export function calculateProfileCompletion(profile: any): number {
  if (!profile) return 0;
  let score = 0;

  // Basic Info: 20%
  if (profile.headline && profile.headline.trim().length > 0) score += 5;
  if (profile.location && profile.location.trim().length > 0) score += 5;
  if (profile.phone && profile.phone.trim().length > 0) score += 5;
  if (profile.summary && profile.summary.trim().length > 0) score += 5;

  // Resume attached: 20%
  if (profile.resume) score += 20;

  // Skills: 20%
  if (Array.isArray(profile.skills) && profile.skills.length > 0) {
    score += profile.skills.length >= 3 ? 20 : 10;
  }

  // Education: 15%
  if (Array.isArray(profile.education) && profile.education.length > 0) score += 15;

  // Experience: 15%
  if (Array.isArray(profile.experience) && profile.experience.length > 0) score += 15;

  // Projects or Certifications or Preferences: 10%
  if (
    (Array.isArray(profile.projects) && profile.projects.length > 0) ||
    (Array.isArray(profile.certifications) && profile.certifications.length > 0) ||
    (profile.careerPreferences && (profile.careerPreferences.expectedSalary || profile.careerPreferences.preferredJobTitles?.length))
  ) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

export async function getProfileByUserId(userId: string) {
  let profile = await CandidateProfile.findOne({ user: userId })
    .populate('user', 'fullName email role isVerified status createdAt avatarUrl')
    .populate('resume', 'fileName fileSize mimeType aiAnalysis parseStatus isActive createdAt');

  if (!profile) {
    profile = await CandidateProfile.create({ user: userId });
    profile = await profile.populate('user', 'fullName email role isVerified status createdAt avatarUrl');
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

  if (data.headline !== undefined) profile.headline = data.headline ?? undefined;
  if (data.summary !== undefined) profile.summary = data.summary ?? undefined;
  if (data.phone !== undefined) profile.phone = data.phone ?? undefined;
  if (data.location !== undefined) profile.location = data.location ?? undefined;
  if (data.avatarUrl !== undefined) profile.avatarUrl = data.avatarUrl ?? undefined;
  if (data.skills !== undefined) profile.skills = data.skills;
  if (data.experience !== undefined) profile.experience = data.experience as any;
  if (data.education !== undefined) profile.education = data.education as any;
  if (data.projects !== undefined) profile.projects = data.projects as any;
  if (data.certifications !== undefined) profile.certifications = data.certifications as any;
  if (data.links !== undefined) profile.links = data.links as any;
  if (data.preferredJobTypes !== undefined) profile.preferredJobTypes = data.preferredJobTypes as any;
  if (data.careerPreferences !== undefined) profile.careerPreferences = data.careerPreferences as any;

  // Auto-link active resume if not linked
  if (!profile.resume) {
    const activeResume = await Resume.findOne({ candidate: userId, isActive: true });
    if (activeResume) profile.resume = activeResume._id as any;
  }

  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();

  return profile.populate([
    { path: 'user', select: 'fullName email role isVerified status createdAt avatarUrl' },
    { path: 'resume', select: 'fileName fileSize mimeType aiAnalysis parseStatus isActive createdAt' },
  ]);
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
  if (data.projects !== undefined) profile.projects = data.projects as any;
  if (data.certifications !== undefined) profile.certifications = data.certifications as any;
  if (data.links !== undefined) {
    profile.links = {
      linkedin: data.links?.linkedin ?? profile.links?.linkedin,
      github: data.links?.github ?? profile.links?.github,
      portfolio: data.links?.portfolio ?? profile.links?.portfolio,
    };
  }
  if (data.preferredJobTypes !== undefined) profile.preferredJobTypes = data.preferredJobTypes as any;
  if (data.careerPreferences !== undefined) profile.careerPreferences = data.careerPreferences as any;

  if (!profile.resume) {
    const activeResume = await Resume.findOne({ candidate: userId, isActive: true });
    if (activeResume) profile.resume = activeResume._id as any;
  }

  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();

  return profile.populate([
    { path: 'user', select: 'fullName email role isVerified status createdAt avatarUrl' },
    { path: 'resume', select: 'fileName fileSize mimeType aiAnalysis parseStatus isActive createdAt' },
  ]);
}

export async function addSkill(userId: string, skillName: string) {
  const profile = await getProfileByUserId(userId);
  const trimmed = skillName.trim();
  const existing = profile.skills || [];

  if (existing.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
    throw ApiError.conflict(`Skill "${trimmed}" is already in your profile`);
  }

  profile.skills.push(trimmed);
  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();
  return profile;
}

export async function removeSkill(userId: string, skillName: string) {
  const profile = await getProfileByUserId(userId);
  const trimmed = skillName.trim().toLowerCase();
  profile.skills = (profile.skills || []).filter((s) => s.toLowerCase() !== trimmed);
  profile.profileCompletion = calculateProfileCompletion(profile);
  await profile.save();
  return profile;
}

export async function bookmarkJob(userId: string, jobId: string) {
  const job = await Job.findById(jobId);
  if (!job) throw ApiError.notFound('Job not found');

  const profile = await getProfileByUserId(userId);
  const bookmarks = profile.bookmarkedJobs || [];
  if (!bookmarks.some((b: any) => b.toString() === jobId)) {
    profile.bookmarkedJobs.push(job._id as any);
    await profile.save();
  }
  return { bookmarked: true, jobId };
}

export async function removeBookmark(userId: string, jobId: string) {
  const profile = await getProfileByUserId(userId);
  profile.bookmarkedJobs = (profile.bookmarkedJobs || []).filter((b: any) => b.toString() !== jobId);
  await profile.save();
  return { bookmarked: false, jobId };
}

export async function getBookmarkedJobs(userId: string) {
  const profile = await CandidateProfile.findOne({ user: userId }).populate({
    path: 'bookmarkedJobs',
    populate: { path: 'recruiter', select: 'fullName companyName' },
  });
  return profile?.bookmarkedJobs || [];
}

export async function getRecommendedJobs(userId: string) {
  const profile = await CandidateProfile.findOne({ user: userId });
  const resume = await Resume.findOne({ candidate: userId, isActive: true });

  const candidateSkills = Array.from(
    new Set([
      ...(profile?.skills || []),
      ...(resume?.parsedData?.skills || []),
      ...(resume?.aiAnalysis?.skills?.map((s) => s.name || '') || []),
    ]),
  ).filter(Boolean);

  const openJobs = await Job.find({ status: 'open' })
    .populate('recruiter', 'fullName companyName')
    .sort({ createdAt: -1 })
    .limit(20);

  if (candidateSkills.length === 0) {
    return openJobs.slice(0, 10).map((job) => ({
      job,
      matchScore: 60,
      matchedSkills: [],
      missingSkills: job.requiredSkills || [],
      recommendation: 'potential_match',
    }));
  }

  const normalizedCandidate = candidateSkills.map((s) => s.toLowerCase());

  const scored = openJobs.map((job) => {
    const jobSkills = job.requiredSkills || [];
    const matched = jobSkills.filter((s) => normalizedCandidate.includes(s.toLowerCase()));
    const missing = jobSkills.filter((s) => !normalizedCandidate.includes(s.toLowerCase()));
    const skillRatio = jobSkills.length > 0 ? matched.length / jobSkills.length : 0.8;
    const matchScore = Math.min(100, Math.round(skillRatio * 100));

    let recommendation = 'weak_match';
    if (matchScore >= 80) recommendation = 'strong_match';
    else if (matchScore >= 60) recommendation = 'potential_match';

    return {
      job,
      matchScore,
      matchedSkills: matched,
      missingSkills: missing,
      recommendation,
    };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
}

export async function getCandidateDashboard(userId: string) {
  const [profile, activeResume, applications, interviews, notifications] = await Promise.all([
    CandidateProfile.findOne({ user: userId }).populate('user', 'fullName email'),
    Resume.findOne({ candidate: userId, isActive: true }),
    Application.find({ candidate: userId })
      .populate('job', 'title companyName location workMode jobType status')
      .populate('matchResult')
      .sort({ createdAt: -1 }),
    Interview.find({ candidate: userId })
      .populate('job', 'title companyName')
      .sort({ scheduledAt: 1 }),
    Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
  ]);

  const stats = {
    totalApplications: applications.length,
    pendingApplications: applications.filter((a) => a.status === 'applied' || a.status === 'screened').length,
    shortlistedApplications: applications.filter((a) => a.status === 'shortlisted').length,
    rejectedApplications: applications.filter((a) => a.status === 'rejected').length,
    interviewsScheduled: interviews.filter((i) => i.status === 'scheduled').length,
    interviewsTotal: interviews.length,
    profileCompletion: profile?.profileCompletion ?? 0,
  };

  const resumeSummary = activeResume
    ? {
        id: activeResume._id,
        fileName: activeResume.fileName,
        qualityScore: activeResume.aiAnalysis?.qualityScore ?? 85,
        breakdown: activeResume.aiAnalysis?.breakdown,
        skillsCount: activeResume.parsedData?.skills?.length ?? 0,
        strengths: activeResume.aiAnalysis?.strengths ?? [],
        suggestions: activeResume.aiAnalysis?.suggestions ?? [],
        analyzedAt: activeResume.aiAnalysis?.analyzedAt,
      }
    : null;

  const recommendedJobs = await getRecommendedJobs(userId);

  return {
    stats,
    resumeSummary,
    recentApplications: applications.slice(0, 5),
    upcomingInterviews: interviews.filter((i) => i.status === 'scheduled').slice(0, 3),
    recentNotifications: notifications.slice(0, 5),
    recommendedJobs: recommendedJobs.slice(0, 4),
  };
}
