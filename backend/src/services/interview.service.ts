import { Interview, Application, Job, User } from '../models';
import { ApiError } from '../utils/ApiError';
import { createNotification } from './notification.service';
import { recordAuditLog } from './audit.service';

export async function listUserInterviews(userId: string, role: string) {
  const filter: any = {};
  if (role === 'candidate') {
    filter.candidate = userId;
  } else if (role === 'recruiter') {
    filter.recruiter = userId;
  }

  return Interview.find(filter)
    .populate('candidate', 'fullName email')
    .populate('recruiter', 'fullName email companyName')
    .populate('job', 'title companyName location workMode')
    .populate('application', 'status')
    .sort({ scheduledAt: 1 });
}

export async function getInterviewById(userId: string, role: string, interviewId: string) {
  const interview = await Interview.findById(interviewId)
    .populate('candidate', 'fullName email')
    .populate('recruiter', 'fullName email companyName')
    .populate('job', 'title companyName location workMode')
    .populate('application', 'status');

  if (!interview) {
    throw ApiError.notFound('Interview not found');
  }

  const candId = (interview.candidate as any)?._id?.toString() || interview.candidate?.toString();
  const recId = (interview.recruiter as any)?._id?.toString() || interview.recruiter?.toString();

  if (role === 'candidate' && candId !== userId) {
    throw ApiError.forbidden('Unauthorized access to interview');
  }
  if (role === 'recruiter' && recId !== userId) {
    throw ApiError.forbidden('Unauthorized access to interview');
  }

  return interview;
}

export async function scheduleInterview(
  recruiterId: string,
  data: {
    applicationId: string;
    scheduledAt: string | Date;
    durationMins?: number;
    mode?: 'video' | 'phone' | 'onsite';
    meetingLink?: string;
    location?: string;
    title?: string;
    notes?: string;
  },
) {
  const application = await Application.findById(data.applicationId).populate('job');
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const jobRecruiter = (application.job as any)?.recruiter?.toString();
  if (jobRecruiter !== recruiterId) {
    throw ApiError.forbidden('You can only schedule interviews for your own job openings');
  }

  const interview = await Interview.create({
    application: application._id,
    job: (application.job as any)._id,
    candidate: application.candidate,
    recruiter: recruiterId,
    title: data.title || 'Technical Interview',
    scheduledAt: new Date(data.scheduledAt),
    durationMins: data.durationMins || 45,
    mode: data.mode || 'video',
    meetingLink: data.meetingLink || 'https://meet.google.com/hiresmart-room',
    location: data.location,
    notes: data.notes,
    status: 'scheduled',
  });

  // Update application status to interview
  application.status = 'interview';
  application.statusHistory.push({
    status: 'interview',
    changedBy: recruiterId as any,
    note: `Interview scheduled for ${new Date(data.scheduledAt).toLocaleDateString()}`,
    changedAt: new Date(),
  });
  await application.save();

  void recordAuditLog({
    action: 'INTERVIEW_SCHEDULE',
    actorId: recruiterId,
    actorRole: 'recruiter',
    targetType: 'Interview',
    targetId: interview._id.toString(),
    status: 'success',
  });

  // Notify candidate
  createNotification(application.candidate.toString(), {
    type: 'interview_scheduled',
    title: 'Interview Scheduled',
    message: `An interview has been scheduled for "${(application.job as any).title}" on ${new Date(data.scheduledAt).toLocaleString()}`,
    link: '/candidate/interviews',
    entityId: interview._id.toString(),
    entityType: 'Interview',
  }).catch(() => {});

  return interview.populate([
    { path: 'candidate', select: 'fullName email' },
    { path: 'job', select: 'title companyName' },
  ]);
}

export async function updateInterview(
  userId: string,
  role: string,
  interviewId: string,
  updates: any,
) {
  const interview = await Interview.findById(interviewId).populate('job');
  if (!interview) {
    throw ApiError.notFound('Interview not found');
  }

  const recId = (interview.recruiter as any)?._id?.toString() || interview.recruiter?.toString();
  if (role === 'recruiter' && recId !== userId) {
    throw ApiError.forbidden('Unauthorized to update this interview');
  }

  if (updates.scheduledAt) interview.scheduledAt = new Date(updates.scheduledAt);
  if (updates.durationMins !== undefined) interview.durationMins = updates.durationMins;
  if (updates.mode) interview.mode = updates.mode;
  if (updates.meetingLink !== undefined) interview.meetingLink = updates.meetingLink;
  if (updates.location !== undefined) interview.location = updates.location;
  if (updates.status) interview.status = updates.status;
  if (updates.notes !== undefined) interview.notes = updates.notes;
  if (updates.feedback) {
    interview.feedback = {
      rating: updates.feedback.rating ?? interview.feedback?.rating,
      notes: updates.feedback.notes ?? interview.feedback?.notes,
      technicalSkillsScore: updates.feedback.technicalSkillsScore,
      communicationScore: updates.feedback.communicationScore,
      recommendation: updates.feedback.recommendation,
    };
  }

  await interview.save();

  void recordAuditLog({
    action: 'INTERVIEW_UPDATE',
    actorId: userId,
    actorRole: role,
    targetType: 'Interview',
    targetId: interviewId,
    status: 'success',
  });

  return interview;
}

export async function cancelInterview(userId: string, role: string, interviewId: string) {
  return updateInterview(userId, role, interviewId, { status: 'cancelled' });
}
