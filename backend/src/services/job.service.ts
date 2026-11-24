import { Job, Application, MatchResult } from '../models';
import { ApiError } from '../utils/ApiError';
import { recordAuditLog } from './audit.service';
import type {
  CreateJobInput,
  UpdateJobInput,
  JobQueryInput,
} from '../validators/job.validators';

export async function createJob(recruiterId: string, input: CreateJobInput) {
  const job = await Job.create({
    recruiter: recruiterId,
    ...input,
  });

  void recordAuditLog({
    action: 'JOB_CREATE',
    actorId: recruiterId,
    actorRole: 'recruiter',
    targetType: 'Job',
    targetId: job._id.toString(),
    status: 'success',
    details: { title: job.title, company: job.companyName },
  });

  return job;
}

export async function getRecruiterJobs(recruiterId: string) {
  const jobs = await Job.find({ recruiter: recruiterId }).sort({ createdAt: -1 });

  // Enrich with live application counts
  const enriched = await Promise.all(
    jobs.map(async (job) => {
      const appCount = await Application.countDocuments({ job: job._id });
      return {
        ...job.toObject(),
        applicationCount: appCount,
      };
    }),
  );

  return enriched;
}

export async function getJobById(jobId: string) {
  const job = await Job.findById(jobId).populate(
    'recruiter',
    'fullName email companyName',
  );
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  const applicationCount = await Application.countDocuments({ job: jobId });
  return {
    ...job.toObject(),
    applicationCount,
  };
}

export async function updateJob(
  recruiterId: string,
  jobId: string,
  updates: UpdateJobInput,
) {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.recruiter.toString() !== recruiterId) {
    throw ApiError.forbidden('You do not have permission to update this job');
  }

  Object.assign(job, updates);
  await job.save();

  void recordAuditLog({
    action: 'JOB_UPDATE',
    actorId: recruiterId,
    actorRole: 'recruiter',
    targetType: 'Job',
    targetId: jobId,
    status: 'success',
  });

  return job;
}

export async function updateJobStatus(
  recruiterId: string,
  jobId: string,
  status: 'draft' | 'open' | 'closed',
) {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.recruiter.toString() !== recruiterId) {
    throw ApiError.forbidden('You do not have permission to update this job status');
  }

  job.status = status;
  await job.save();

  void recordAuditLog({
    action: 'JOB_STATUS_CHANGE',
    actorId: recruiterId,
    actorRole: 'recruiter',
    targetType: 'Job',
    targetId: jobId,
    status: 'success',
    details: { status },
  });

  return job;
}

export async function deleteJob(recruiterId: string, jobId: string) {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.recruiter.toString() !== recruiterId) {
    throw ApiError.forbidden('You do not have permission to delete this job');
  }

  // Check if active applications exist
  const activeApplicationsCount = await Application.countDocuments({
    job: jobId,
    status: { $in: ['applied', 'screened', 'shortlisted', 'interview'] },
  });

  if (activeApplicationsCount > 0) {
    // Soft-close instead of raw cascade delete to protect candidate records
    job.status = 'closed';
    await job.save();
    return { message: 'Job has active candidates; closed job posting rather than deleting candidate history' };
  }

  await Job.deleteOne({ _id: jobId });

  void recordAuditLog({
    action: 'JOB_DELETE',
    actorId: recruiterId,
    actorRole: 'recruiter',
    targetType: 'Job',
    targetId: jobId,
    status: 'success',
  });

  return { message: 'Job deleted successfully' };
}

export async function getJobStats(recruiterId: string, jobId: string) {
  const job = await Job.findById(jobId);
  if (!job) throw ApiError.notFound('Job not found');
  if (job.recruiter.toString() !== recruiterId) {
    throw ApiError.forbidden('Unauthorized access to job stats');
  }

  const [applications, matchResults] = await Promise.all([
    Application.find({ job: jobId }),
    MatchResult.find({ job: jobId }),
  ]);

  const breakdown: Record<string, number> = {
    applied: 0,
    screened: 0,
    shortlisted: 0,
    interview: 0,
    hired: 0,
    rejected: 0,
    withdrawn: 0,
  };

  applications.forEach((a) => {
    if (breakdown[a.status] !== undefined) breakdown[a.status]++;
  });

  const totalScore = matchResults.reduce((acc, m) => acc + (m.overallScore || 0), 0);
  const avgScore = matchResults.length > 0 ? Math.round(totalScore / matchResults.length) : 0;

  return {
    jobId: job._id,
    title: job.title,
    status: job.status,
    totalApplicants: applications.length,
    statusBreakdown: breakdown,
    averageMatchScore: avgScore,
    screenedCount: matchResults.length,
  };
}

export async function searchJobs(query: JobQueryInput) {
  const filter: any = {};

  filter.status = query.status || 'open';

  if (query.workMode) filter.workMode = query.workMode;
  if (query.jobType) filter.jobType = query.jobType;
  if (query.educationLevel && query.educationLevel !== 'any') {
    filter.educationLevel = query.educationLevel;
  }
  if (query.minExperience !== undefined) {
    filter.minExperienceYears = { $lte: query.minExperience };
  }
  if (query.location) {
    filter.location = { $regex: query.location, $options: 'i' };
  }

  if (query.search) {
    const sRegex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { title: sRegex },
      { description: sRegex },
      { requiredSkills: { $in: [sRegex] } },
      { companyName: sRegex },
    ];
  }

  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('recruiter', 'fullName companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}
