import { User, Job, Application, CandidateProfile, RecruiterProfile } from '../models';
import { ApiError } from '../utils/ApiError';

export async function getAdminStats() {
  const [
    totalCandidates,
    totalRecruiters,
    totalJobs,
    openJobs,
    totalApplications,
    applications,
    recentUsers,
    recentJobs,
    recentApplications,
  ] = await Promise.all([
    User.countDocuments({ role: 'candidate' }),
    User.countDocuments({ role: 'recruiter' }),
    Job.countDocuments(),
    Job.countDocuments({ status: 'open' }),
    Application.countDocuments(),
    Application.find().select('status'),
    User.find().sort({ createdAt: -1 }).limit(5).select('fullName email role createdAt isVerified status'),
    Job.find().sort({ createdAt: -1 }).limit(5).select('title companyName status createdAt workMode jobType'),
    Application.find().sort({ createdAt: -1 }).limit(5).populate('job', 'title').populate('candidate', 'fullName email').select('status createdAt job candidate'),
  ]);

  // Aggregate application status distribution
  const statusDistribution: Record<string, number> = {
    applied: 0,
    screened: 0,
    shortlisted: 0,
    interview: 0,
    hired: 0,
    rejected: 0,
    withdrawn: 0,
  };

  for (const app of applications) {
    if (statusDistribution[app.status] !== undefined) {
      statusDistribution[app.status]++;
    }
  }

  return {
    overview: {
      totalCandidates,
      totalRecruiters,
      totalUsers: totalCandidates + totalRecruiters,
      totalJobs,
      openJobs,
      totalApplications,
    },
    applicationStatusDistribution: statusDistribution,
    recentActivity: {
      recentUsers,
      recentJobs,
      recentApplications,
    },
  };
}

export async function getAdminUsers(options: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
} = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {};
  if (options.role) query.role = options.role;
  if (options.status) query.status = options.status;
  if (options.search) {
    const regex = new RegExp(options.search, 'i');
    query.$or = [{ fullName: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('fullName email role isVerified status lastLoginAt createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getAdminUserById(userId: string) {
  const user = await User.findById(userId).select('fullName email role isVerified status lastLoginAt createdAt');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  let profile: any = null;
  if (user.role === 'candidate') {
    profile = await CandidateProfile.findOne({ user: userId });
  } else if (user.role === 'recruiter') {
    profile = await RecruiterProfile.findOne({ user: userId });
  }

  return {
    user,
    profile,
  };
}

export async function updateAdminUserStatus(userId: string, newStatus: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  (user as any).status = newStatus;
  await user.save();

  return {
    id: user._id,
    email: user.email,
    role: user.role,
    status: (user as any).status,
  };
}

export async function getAdminJobs(options: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
} = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {};
  if (options.status) query.status = options.status;
  if (options.search) {
    const regex = new RegExp(options.search, 'i');
    query.$or = [{ title: regex }, { companyName: regex }];
  }

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('recruiter', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Job.countDocuments(query),
  ]);

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function updateAdminJobStatus(jobId: string, newStatus: string) {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  job.status = newStatus as any;
  await job.save();

  return {
    id: job._id,
    title: job.title,
    status: job.status,
  };
}
