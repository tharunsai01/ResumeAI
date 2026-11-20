import { Application, Job, Resume } from '../models';
import { ApiError } from '../utils/ApiError';
import { createNotification } from './notification.service';
import type {
  CreateApplicationInput,
  UpdateApplicationStatusInput,
  WithdrawApplicationInput,
} from '../validators/application.validators';

export async function applyToJob(candidateId: string, input: CreateApplicationInput) {
  // 1. Verify job exists and is open
  const job = await Job.findById(input.jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.status !== 'open') {
    throw ApiError.badRequest('This job is not currently open for applications');
  }

  if (job.deadline && new Date() > new Date(job.deadline)) {
    throw ApiError.badRequest('Application deadline for this job has passed');
  }

  // 2. Prevent duplicate applications
  const existingApp = await Application.exists({
    job: input.jobId,
    candidate: candidateId,
  });
  if (existingApp) {
    throw ApiError.conflict('You have already applied to this job');
  }

  // 3. Verify resume ownership
  const resume = await Resume.findOne({
    _id: input.resumeId,
    candidate: candidateId,
  });
  if (!resume) {
    throw ApiError.badRequest('Invalid resume reference: resume does not belong to candidate');
  }

  // 4. Create application with initial history
  const application = await Application.create({
    job: input.jobId,
    candidate: candidateId,
    resume: input.resumeId,
    coverLetter: input.coverLetter,
    status: 'applied',
    statusHistory: [
      {
        status: 'applied',
        changedBy: candidateId,
        note: 'Application submitted',
        changedAt: new Date(),
      },
    ],
  });

  // Event notifications
  createNotification(job.recruiter.toString(), {
    type: 'application_received',
    title: 'New Application Received',
    message: `A candidate has submitted an application for ${job.title}`,
    link: '/recruiter/applications',
    entityId: application._id.toString(),
    entityType: 'Application',
  }).catch(() => {});

  createNotification(candidateId, {
    type: 'system',
    title: 'Application Submitted',
    message: `Your application for ${job.title} was submitted successfully`,
    link: '/candidate/applications',
    entityId: application._id.toString(),
    entityType: 'Application',
  }).catch(() => {});

  return application;
}

export async function getCandidateApplications(candidateId: string) {
  return Application.find({ candidate: candidateId })
    .populate('job', 'title companyName location workMode jobType status deadline')
    .populate('resume', 'fileName fileUrl createdAt')
    .sort({ createdAt: -1 });
}

export async function getApplicationById(
  userId: string,
  userRole: string,
  applicationId: string,
) {
  const application = await Application.findById(applicationId)
    .populate('job')
    .populate('resume', 'fileName fileUrl sizeBytes mimeType parsedData')
    .populate('candidate', 'fullName email isVerified');

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  // Candidate ownership check
  const candId = (application.candidate as any)?._id?.toString() || application.candidate?.toString();
  if (userRole === 'candidate' && candId !== userId) {
    throw ApiError.forbidden('You do not have permission to view this application');
  }

  // Recruiter ownership check
  const recruiterId = (application.job as any)?.recruiter?.toString();
  if (userRole === 'recruiter' && recruiterId !== userId) {
    throw ApiError.forbidden('You do not have permission to view this application');
  }

  return application;
}

export async function withdrawApplication(
  candidateId: string,
  applicationId: string,
  input: WithdrawApplicationInput,
) {
  const application = await Application.findOne({
    _id: applicationId,
    candidate: candidateId,
  });

  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  if (application.status === 'withdrawn') {
    throw ApiError.badRequest('Application is already withdrawn');
  }

  if (application.status === 'hired') {
    throw ApiError.badRequest('Cannot withdraw an accepted/hired application');
  }

  if (application.status === 'rejected') {
    throw ApiError.badRequest('Cannot withdraw an application that has been rejected');
  }

  application.status = 'withdrawn';
  application.statusHistory.push({
    status: 'withdrawn',
    changedBy: candidateId as any,
    note: input.reason || 'Withdrawn by candidate',
    changedAt: new Date(),
  });

  await application.save();

  // Notify recruiter of withdrawal
  const job = await Job.findById(application.job);
  if (job) {
    createNotification(job.recruiter.toString(), {
      type: 'application_withdrawn',
      title: 'Application Withdrawn',
      message: `A candidate has withdrawn their application for ${job.title}`,
      link: '/recruiter/applications',
      entityId: application._id.toString(),
      entityType: 'Application',
    }).catch(() => {});
  }

  return application;
}

export async function getJobApplications(recruiterId: string, jobId: string) {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.recruiter.toString() !== recruiterId) {
    throw ApiError.forbidden('You do not have permission to view applications for this job');
  }

  return Application.find({ job: jobId })
    .populate('candidate', 'fullName email isVerified')
    .populate('resume', 'fileName fileUrl sizeBytes parsedData createdAt')
    .sort({ createdAt: -1 });
}

export async function updateApplicationStatus(
  recruiterId: string,
  applicationId: string,
  input: UpdateApplicationStatusInput,
) {
  const application = await Application.findById(applicationId).populate('job');
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const jobRecruiter = (application.job as any)?.recruiter?.toString();
  if (jobRecruiter !== recruiterId) {
    throw ApiError.forbidden('You do not have permission to manage this application');
  }

  // Recruiter cannot set withdrawn (only candidate can withdraw)
  if (input.status === 'withdrawn') {
    throw ApiError.badRequest('Only the candidate can withdraw their application');
  }

  // Cannot re-apply or reset to initial applied state
  if (input.status === 'applied') {
    throw ApiError.badRequest('Cannot reset application to applied');
  }

  // Terminal state protections
  if (application.status === 'withdrawn') {
    throw ApiError.badRequest('Cannot update status of a withdrawn application');
  }

  if (application.status === 'hired') {
    throw ApiError.badRequest('Cannot update status of a hired candidate');
  }

  application.status = input.status;
  application.statusHistory.push({
    status: input.status,
    changedBy: recruiterId as any,
    note: input.note || `Status updated to ${input.status}`,
    changedAt: new Date(),
  });

  await application.save();

  // Notify candidate of status update
  const notifType = input.status === 'shortlisted' ? 'shortlisted' : 'status_changed';
  createNotification(application.candidate.toString(), {
    type: notifType,
    title: `Application Status: ${input.status.toUpperCase()}`,
    message: `Your application for ${(application.job as any)?.title || 'the position'} has been updated to "${input.status}"`,
    link: '/candidate/applications',
    entityId: application._id.toString(),
    entityType: 'Application',
  }).catch(() => {});

  return application;
}
