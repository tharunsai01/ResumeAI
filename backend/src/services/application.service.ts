import { Application, Job, Resume, MatchResult } from '../models';
import { ApiError } from '../utils/ApiError';
import { createNotification } from './notification.service';
import { recordAuditLog } from './audit.service';
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

  // 3. Resolve resume: use provided resumeId or active resume
  let resumeId = input.resumeId;
  if (!resumeId) {
    const activeResume = await Resume.findOne({ candidate: candidateId, isActive: true });
    if (!activeResume) {
      throw ApiError.badRequest('Please upload or select a resume before submitting an application');
    }
    resumeId = activeResume._id.toString();
  }

  const resume = await Resume.findOne({
    _id: resumeId,
    candidate: candidateId,
  });
  if (!resume) {
    throw ApiError.badRequest('Invalid resume reference: resume does not belong to candidate');
  }

  // 4. Create application with initial history
  const application = await Application.create({
    job: input.jobId,
    candidate: candidateId,
    resume: resumeId,
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

  // Increment application count on job
  await Job.updateOne({ _id: input.jobId }, { $inc: { applicationCount: 1 } });

  // Record audit log
  void recordAuditLog({
    action: 'APPLICATION_SUBMIT',
    actorId: candidateId,
    actorRole: 'candidate',
    targetType: 'Application',
    targetId: application._id.toString(),
    status: 'success',
    details: { jobId: input.jobId, jobTitle: job.title },
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
    .populate('resume', 'fileName fileUrl aiAnalysis createdAt')
    .populate('matchResult')
    .sort({ createdAt: -1 });
}

export async function getApplicationById(
  userId: string,
  userRole: string,
  applicationId: string,
) {
  const application = await Application.findById(applicationId)
    .populate('job')
    .populate('resume', 'fileName fileUrl sizeBytes mimeType parsedData aiAnalysis')
    .populate('candidate', 'fullName email isVerified')
    .populate('matchResult');

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

  void recordAuditLog({
    action: 'APPLICATION_WITHDRAW',
    actorId: candidateId,
    actorRole: 'candidate',
    targetType: 'Application',
    targetId: applicationId,
    status: 'success',
  });

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
    .populate('resume', 'fileName fileUrl sizeBytes parsedData aiAnalysis createdAt')
    .populate('matchResult')
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

  if (input.status === 'withdrawn') {
    throw ApiError.badRequest('Only the candidate can withdraw their application');
  }

  if (input.status === 'applied') {
    throw ApiError.badRequest('Cannot reset application to applied');
  }

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

  void recordAuditLog({
    action: 'APPLICATION_STATUS_UPDATE',
    actorId: recruiterId,
    actorRole: 'recruiter',
    targetType: 'Application',
    targetId: applicationId,
    status: 'success',
    details: { newStatus: input.status },
  });

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

export async function addRecruiterNote(
  recruiterId: string,
  applicationId: string,
  noteText: string,
) {
  const application = await Application.findById(applicationId).populate('job');
  if (!application) throw ApiError.notFound('Application not found');

  const jobRecruiter = (application.job as any)?.recruiter?.toString();
  if (jobRecruiter !== recruiterId) {
    throw ApiError.forbidden('Unauthorized to add note to this application');
  }

  if (!application.recruiterNotes) {
    (application as any).recruiterNotes = [];
  }
  (application.recruiterNotes as any).push({
    note: noteText,
    author: recruiterId as any,
    createdAt: new Date(),
  });

  await application.save();
  return application;
}
