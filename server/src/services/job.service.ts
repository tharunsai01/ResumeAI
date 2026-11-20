import { Job } from '../models';
import { ApiError } from '../utils/ApiError';
import type {
  CreateJobInput,
  UpdateJobInput,
  JobQueryInput,
} from '../validators/job.validators';

export async function createJob(recruiterId: string, input: CreateJobInput) {
  return Job.create({
    recruiter: recruiterId,
    ...input,
  });
}

export async function getRecruiterJobs(recruiterId: string) {
  return Job.find({ recruiter: recruiterId }).sort({ createdAt: -1 });
}

export async function getJobById(jobId: string) {
  const job = await Job.findById(jobId).populate(
    'recruiter',
    'fullName email companyName',
  );
  if (!job) {
    throw ApiError.notFound('Job not found');
  }
  return job;
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

  // Update only permitted fields
  Object.assign(job, updates);
  await job.save();
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

  await Job.deleteOne({ _id: jobId });
  return { message: 'Job deleted successfully' };
}

export async function searchJobs(query: JobQueryInput) {
  const filter: any = {};

  // For discovery, default to open jobs unless caller explicitly requests another status
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
