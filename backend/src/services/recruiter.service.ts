import {
  RecruiterProfile,
  Job,
  Application,
  Interview,
  CandidateProfile,
  Resume,
  ScreeningSettings,
  MatchResult,
} from '../models';
import { ApiError } from '../utils/ApiError';
import { recordAuditLog } from './audit.service';
import { createNotification } from './notification.service';

export async function getRecruiterProfile(userId: string) {
  let profile = await RecruiterProfile.findOne({ user: userId }).populate(
    'user',
    'fullName email role isVerified status createdAt avatarUrl',
  );

  if (!profile) {
    profile = await RecruiterProfile.create({
      user: userId,
      companyName: 'My Company',
    });
    profile = await profile.populate('user', 'fullName email role isVerified status createdAt avatarUrl');
  }

  return profile;
}

export async function updateRecruiterProfile(userId: string, data: any) {
  let profile = await RecruiterProfile.findOne({ user: userId });
  if (!profile) {
    profile = new RecruiterProfile({ user: userId });
  }

  if (data.fullName !== undefined) profile.fullName = data.fullName;
  if (data.jobTitle !== undefined) profile.jobTitle = data.jobTitle;
  if (data.designation !== undefined) profile.designation = data.designation;
  if (data.phone !== undefined) profile.phone = data.phone;
  if (data.companyName !== undefined) profile.companyName = data.companyName;
  if (data.companyOverview !== undefined) profile.companyOverview = data.companyOverview;
  if (data.industry !== undefined) profile.industry = data.industry;
  if (data.companySize !== undefined) profile.companySize = data.companySize;
  if (data.website !== undefined) profile.website = data.website;
  if (data.description !== undefined) profile.description = data.description;
  if (data.location !== undefined) profile.location = data.location;
  if (data.logoUrl !== undefined) profile.logoUrl = data.logoUrl;

  await profile.save();

  void recordAuditLog({
    action: 'RECRUITER_PROFILE_UPDATE',
    actorId: userId,
    actorRole: 'recruiter',
    targetType: 'RecruiterProfile',
    targetId: profile._id.toString(),
    status: 'success',
  });

  return profile.populate('user', 'fullName email role isVerified status createdAt');
}

export async function getRecruiterDashboard(recruiterId: string) {
  const jobs = await Job.find({ recruiter: recruiterId });
  const jobIds = jobs.map((j) => j._id);

  const [applications, interviews, screeningSettings] = await Promise.all([
    Application.find({ job: { $in: jobIds } }).populate('job', 'title status'),
    Interview.find({ recruiter: recruiterId }).populate('job', 'title').sort({ scheduledAt: 1 }),
    ScreeningSettings.findOne({ recruiter: recruiterId, isDefault: true }),
  ]);

  const activeJobs = jobs.filter((j) => j.status === 'open').length;
  const totalApplicants = applications.length;
  const shortlisted = applications.filter((a) => a.status === 'shortlisted').length;
  const pending = applications.filter((a) => a.status === 'applied' || a.status === 'screened').length;
  const interviewsCount = interviews.length;

  // Pipeline stage breakdown
  const pipelineStats: Record<string, number> = {
    applied: 0,
    screened: 0,
    shortlisted: 0,
    interview: 0,
    hired: 0,
    rejected: 0,
  };

  applications.forEach((app) => {
    if (pipelineStats[app.status] !== undefined) {
      pipelineStats[app.status]++;
    }
  });

  // Job-wise application counts
  const jobBreakdown = jobs.map((j) => {
    const jobApps = applications.filter((a) => a.job?._id?.toString() === j._id.toString());
    return {
      id: j._id,
      title: j.title,
      status: j.status,
      applicantsCount: jobApps.length,
      shortlistedCount: jobApps.filter((a) => a.status === 'shortlisted').length,
    };
  });

  return {
    metrics: {
      activeJobs,
      totalApplicants,
      shortlistedCandidates: shortlisted,
      pendingApplications: pending,
      interviewsScheduled: interviews.filter((i) => i.status === 'scheduled').length,
      totalInterviews: interviewsCount,
    },
    pipelineStats,
    jobBreakdown,
    recentApplications: applications.slice(0, 5),
    upcomingInterviews: interviews.filter((i) => i.status === 'scheduled').slice(0, 4),
    screeningSettings: screeningSettings || {
      threshold: 80,
      weights: { skills: 50, experience: 20, education: 10, roleSimilarity: 20 },
    },
  };
}

export async function searchCandidates(
  recruiterId: string,
  query: { skills?: string; minExperience?: number; location?: string; search?: string },
) {
  // Find candidates with profiles
  const filter: any = {};

  if (query.skills) {
    const skillsArr = query.skills.split(',').map((s) => new RegExp(s.trim(), 'i'));
    filter.skills = { $in: skillsArr };
  }

  if (query.location) {
    filter.location = { $regex: query.location.trim(), $options: 'i' };
  }

  if (query.search) {
    const sRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { headline: sRegex },
      { summary: sRegex },
      { location: sRegex },
      { skills: { $in: [sRegex] } },
    ];
  }

  const profiles = await CandidateProfile.find(filter)
    .populate('user', 'fullName email isVerified status createdAt')
    .populate('resume', 'fileName fileUrl aiAnalysis parsedData')
    .limit(50);

  return profiles.map((p) => {
    const u = p.user as any;
    const r = p.resume as any;
    return {
      id: p.user?._id || p._id,
      name: u?.fullName || 'Candidate',
      email: u?.email,
      headline: p.headline || 'Software Professional',
      location: p.location || 'Remote',
      skills: p.skills || [],
      experience: p.experience || [],
      education: p.education || [],
      profileCompletion: p.profileCompletion,
      resumeAnalysis: r?.aiAnalysis
        ? {
            qualityScore: r.aiAnalysis.qualityScore,
            summary: r.aiAnalysis.summary,
            strengths: r.aiAnalysis.strengths,
            skills: r.aiAnalysis.skills,
          }
        : null,
    };
  });
}

export async function getCandidateDetailsForRecruiter(recruiterId: string, candidateId: string) {
  const profile = await CandidateProfile.findOne({ user: candidateId })
    .populate('user', 'fullName email isVerified status createdAt')
    .populate('resume', 'fileName fileUrl aiAnalysis parsedData');

  if (!profile) {
    throw ApiError.notFound('Candidate profile not found');
  }

  // Also look up any applications submitted to this recruiter's jobs
  const recruiterJobs = await Job.find({ recruiter: recruiterId }).select('_id');
  const jobIds = recruiterJobs.map((j) => j._id);
  const applications = await Application.find({
    candidate: candidateId,
    job: { $in: jobIds },
  }).populate('job', 'title status').populate('matchResult');

  return {
    profile,
    applications,
  };
}

export async function getScreeningSettings(recruiterId: string) {
  let settings = await ScreeningSettings.findOne({ recruiter: recruiterId, isDefault: true });
  if (!settings) {
    settings = await ScreeningSettings.create({
      recruiter: recruiterId,
      isDefault: true,
      threshold: 80,
      weights: {
        skills: 50,
        experience: 20,
        education: 10,
        roleSimilarity: 20,
      },
      autoShortlistThreshold: 85,
      autoRejectThreshold: 45,
    });
  }
  return settings;
}

export async function updateScreeningSettings(recruiterId: string, updates: any) {
  let settings = await ScreeningSettings.findOne({ recruiter: recruiterId, isDefault: true });
  if (!settings) {
    settings = new ScreeningSettings({ recruiter: recruiterId, isDefault: true });
  }

  if (updates.threshold !== undefined) settings.threshold = updates.threshold;
  const currentWeights = settings.weights || { skills: 50, experience: 20, education: 10, roleSimilarity: 20 };
  if (updates.weights) {
    settings.weights = {
      skills: updates.weights.skills ?? currentWeights.skills,
      experience: updates.weights.experience ?? currentWeights.experience,
      education: updates.weights.education ?? currentWeights.education,
      roleSimilarity: updates.weights.roleSimilarity ?? currentWeights.roleSimilarity,
    };
  }
  if (updates.autoShortlistThreshold !== undefined) {
    settings.autoShortlistThreshold = updates.autoShortlistThreshold;
  }
  if (updates.autoRejectThreshold !== undefined) {
    settings.autoRejectThreshold = updates.autoRejectThreshold;
  }

  await settings.save();
  return settings;
}

export async function getHiringPipeline(recruiterId: string, jobId?: string) {
  const filter: any = {};
  if (jobId) {
    filter.job = jobId;
    const job = await Job.findById(jobId);
    if (!job || job.recruiter.toString() !== recruiterId) {
      throw ApiError.forbidden('Unauthorized access to job pipeline');
    }
  } else {
    const jobs = await Job.find({ recruiter: recruiterId }).select('_id');
    filter.job = { $in: jobs.map((j) => j._id) };
  }

  const applications = await Application.find(filter)
    .populate('candidate', 'fullName email')
    .populate('job', 'title')
    .populate('resume', 'fileName aiAnalysis')
    .populate('matchResult')
    .sort({ createdAt: -1 });

  // Map to pipeline candidate structures
  const pipelineCandidates = applications.map((app) => {
    const cand = app.candidate as any;
    const job = app.job as any;
    const match = app.matchResult as any;

    let stage = 'Shortlisted';
    if (app.status === 'applied') stage = 'Shortlisted';
    else if (app.status === 'screened') stage = 'Shortlisted';
    else if (app.status === 'shortlisted') stage = 'Shortlisted';
    else if (app.status === 'interview') stage = 'Interview Scheduled';
    else if (app.status === 'hired') stage = 'Hired';
    else if (app.status === 'rejected') stage = 'Rejected';

    return {
      id: app.candidate?._id?.toString() || app._id.toString(),
      applicationId: app._id.toString(),
      name: cand?.fullName || 'Candidate',
      role: job?.title || 'Applicant',
      matchScore: match?.overallScore ?? app.matchScore ?? 85,
      stage,
      skills: match?.matchedSkills || [],
      experience: '2+ Years',
      education: 'B.Tech / Degree',
      status: app.status,
      appliedDate: app.createdAt,
    };
  });

  return pipelineCandidates;
}

export async function updatePipelineStage(
  recruiterId: string,
  applicationId: string,
  stage: string,
) {
  const application = await Application.findById(applicationId).populate('job');
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const jobRecruiter = (application.job as any)?.recruiter?.toString();
  if (jobRecruiter !== recruiterId) {
    throw ApiError.forbidden('Unauthorized to update this application pipeline stage');
  }

  let newStatus: string = application.status;
  if (stage === 'Shortlisted') newStatus = 'shortlisted';
  else if (stage === 'Interview Scheduled' || stage === 'Interview Completed' || stage === 'Decision Pending') {
    newStatus = 'interview';
  } else if (stage === 'Hired') newStatus = 'hired';
  else if (stage === 'Rejected') newStatus = 'rejected';

  application.status = newStatus as any;
  application.statusHistory.push({
    status: newStatus as any,
    changedBy: recruiterId as any,
    note: `Moved to pipeline stage: ${stage}`,
    changedAt: new Date(),
  });

  await application.save();

  createNotification(application.candidate.toString(), {
    type: 'status_changed',
    title: 'Hiring Pipeline Updated',
    message: `Your application stage for ${(application.job as any)?.title || 'job'} has progressed to "${stage}"`,
    link: '/candidate/applications',
    entityId: application._id.toString(),
    entityType: 'Application',
  }).catch(() => {});

  return { applicationId, stage, status: newStatus };
}
