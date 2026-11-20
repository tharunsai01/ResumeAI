import { Resume, Job, Application, MatchResult } from '../../models';
import { ApiError } from '../../utils/ApiError';
import { getAIProvider } from './provider';
import { createNotification } from '../notification.service';
import type {
  AIResumeAnalysisOutput,
  AIJobMatchOutput,
  AICandidateScreeningOutput,
} from './types';

export async function analyzeResume(
  candidateId: string,
  resumeId: string,
): Promise<AIResumeAnalysisOutput> {
  const provider = getAIProvider();
  if (!provider.isConfigured()) {
    throw ApiError.serviceUnavailable('AI analysis service is currently not configured or unavailable');
  }

  const resume = await Resume.findOne({ _id: resumeId, candidate: candidateId }).select('+rawText');
  if (!resume) {
    throw ApiError.notFound('Resume not found or unauthorized');
  }

  if (!resume.rawText || resume.rawText.trim().length < 50) {
    throw ApiError.badRequest(
      'Resume contains insufficient extractable text for AI analysis. Please upload a clear text document.',
    );
  }

  const analysis = await provider.analyzeResume(resume.rawText);

  // Persist analysis onto resume document
  resume.aiAnalysis = {
    ...analysis,
    analyzedAt: new Date(),
    provider: provider.name,
  } as any;
  await resume.save();

  return analysis;
}

export async function matchResumeToJob(
  candidateId: string,
  resumeId: string,
  jobId: string,
): Promise<AIJobMatchOutput> {
  const provider = getAIProvider();
  if (!provider.isConfigured()) {
    throw ApiError.serviceUnavailable('AI job matching service is currently not configured or unavailable');
  }

  const resume = await Resume.findOne({ _id: resumeId, candidate: candidateId }).select('+rawText');
  if (!resume) {
    throw ApiError.notFound('Resume not found or unauthorized');
  }

  if (!resume.rawText || resume.rawText.trim().length < 50) {
    throw ApiError.badRequest('Resume contains insufficient extractable text for job matching');
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.status !== 'open') {
    throw ApiError.badRequest('This job is not currently open for matching');
  }

  return provider.matchJob(resume.rawText, {
    title: job.title,
    description: job.description,
    requiredSkills: job.requiredSkills || [],
    niceToHaveSkills: job.niceToHaveSkills || [],
    minExperienceYears: job.minExperienceYears || 0,
  });
}

export async function screenCandidateApplication(
  recruiterId: string,
  applicationId: string,
) {
  const provider = getAIProvider();
  if (!provider.isConfigured()) {
    throw ApiError.serviceUnavailable('AI candidate screening service is currently not configured or unavailable');
  }

  const application = await Application.findById(applicationId).populate('job');
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const jobRecruiter = (application.job as any)?.recruiter?.toString();
  if (jobRecruiter !== recruiterId) {
    throw ApiError.forbidden('You do not have permission to screen applications for this job');
  }

  // Fetch resume with rawText
  const resumeId = (application.resume as any)?._id || application.resume;
  const resume = await Resume.findById(resumeId).select('+rawText');
  if (!resume || !resume.rawText || resume.rawText.trim().length < 50) {
    throw ApiError.badRequest('Applicant resume text is unavailable or insufficient for screening');
  }

  const job = application.job as any;
  const screening: AICandidateScreeningOutput = await provider.screenCandidate(
    resume.rawText,
    {
      title: job.title,
      description: job.description,
      requiredSkills: job.requiredSkills || [],
      minExperienceYears: job.minExperienceYears || 0,
    },
    { coverLetter: application.coverLetter || undefined },
  );

  const threshold = job.screening?.threshold ?? 80;
  const meetsThreshold = screening.overallScore >= threshold;

  // Persist screening result into MatchResult (associates application, job, candidate)
  let matchResult = await MatchResult.findOne({ application: application._id });
  if (!matchResult) {
    matchResult = new MatchResult({
      application: application._id,
      job: job._id,
      candidate: application.candidate,
    });
  }

  matchResult.skillsScore = screening.skillsScore;
  matchResult.experienceScore = screening.experienceScore;
  matchResult.educationScore = screening.educationScore;
  matchResult.overallScore = screening.overallScore;
  matchResult.matchedSkills = screening.matchedRequirements;
  matchResult.missingSkills = screening.missingRequirements;
  matchResult.explanation = screening.explanation;
  matchResult.meetsThreshold = meetsThreshold;
  matchResult.recommendation = screening.recommendation;
  matchResult.strengths = screening.strengths;
  matchResult.gaps = screening.gaps;
  matchResult.actionableSuggestions = screening.actionableSuggestions;
  matchResult.computedAt = new Date();

  await matchResult.save();

  // Notify recruiter that AI screening was completed
  createNotification(recruiterId, {
    type: 'screening_completed',
    title: 'Screening Completed',
    message: `AI screening completed for candidate on "${job.title}". Score: ${screening.overallScore}%`,
    link: '/recruiter/applications',
    entityId: application._id.toString(),
    entityType: 'MatchResult',
  }).catch(() => {});

  // IMPORTANT: The AI must NOT automatically reject or change application status.
  // Application status remains intact. Screening is purely decision support.

  return {
    screening,
    meetsThreshold,
    applicationId: application._id,
    candidateId: application.candidate,
    jobId: job._id,
    computedAt: matchResult.computedAt,
  };
}

export async function bulkScreenJobApplications(
  recruiterId: string,
  jobId: string,
  batchSize = 10,
) {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.recruiter.toString() !== recruiterId) {
    throw ApiError.forbidden('You do not have permission to screen candidates for this job');
  }

  // Bound batch size: 1 to 20
  const maxLimit = Math.min(Math.max(1, batchSize), 20);

  const applications = await Application.find({
    job: jobId,
    status: { $nin: ['withdrawn'] },
  }).limit(maxLimit);

  const results: Array<{
    applicationId: string;
    success: boolean;
    data?: any;
    error?: string;
  }> = [];

  for (const app of applications) {
    try {
      const screeningData = await screenCandidateApplication(recruiterId, app._id.toString());
      results.push({
        applicationId: app._id.toString(),
        success: true,
        data: screeningData,
      });
    } catch (err: any) {
      // Partial failure tolerance: one failure doesn't abort the entire bulk batch
      results.push({
        applicationId: app._id.toString(),
        success: false,
        error: err?.message || 'Screening failed',
      });
    }
  }

  return {
    jobId,
    totalProcessed: results.length,
    succeeded: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results,
  };
}

export async function getJobRecruiterInsights(recruiterId: string, jobId: string) {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  if (job.recruiter.toString() !== recruiterId) {
    throw ApiError.forbidden('You do not have permission to view insights for this job');
  }

  const [applications, matchResults] = await Promise.all([
    Application.find({ job: jobId }),
    MatchResult.find({ job: jobId }),
  ]);

  // Real database calculation: status breakdown
  const statusCounts: Record<string, number> = {
    applied: 0,
    screened: 0,
    shortlisted: 0,
    interview: 0,
    hired: 0,
    rejected: 0,
    withdrawn: 0,
  };

  for (const app of applications) {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status]++;
    }
  }

  // Match result statistics
  const totalScreened = matchResults.length;
  let totalScore = 0;
  let highestScore = 0;
  let strongMatches = 0;
  let potentialMatches = 0;
  let weakMatches = 0;

  for (const match of matchResults) {
    totalScore += match.overallScore || 0;
    if (match.overallScore > highestScore) highestScore = match.overallScore;
    if (match.recommendation === 'strong_match') strongMatches++;
    else if (match.recommendation === 'potential_match') potentialMatches++;
    else if (match.recommendation === 'weak_match') weakMatches++;
  }

  const averageScore = totalScreened > 0 ? Math.round(totalScore / totalScreened) : 0;

  return {
    job: {
      id: job._id,
      title: job.title,
      status: job.status,
      screeningThreshold: job.screening?.threshold ?? 80,
    },
    applications: {
      total: applications.length,
      breakdown: statusCounts,
    },
    screeningInsights: {
      totalScreened,
      averageScore,
      highestScore,
      strongMatches,
      potentialMatches,
      weakMatches,
    },
  };
}

export async function getApplicationScreeningResult(
  recruiterId: string,
  applicationId: string,
) {
  const application = await Application.findById(applicationId).populate('job');
  if (!application) {
    throw ApiError.notFound('Application not found');
  }

  const jobRecruiter = (application.job as any)?.recruiter?.toString();
  if (jobRecruiter !== recruiterId) {
    throw ApiError.forbidden('Unauthorized to view screening results for this application');
  }

  const matchResult = await MatchResult.findOne({ application: applicationId });
  if (!matchResult) {
    throw ApiError.notFound('No screening report has been generated for this application yet');
  }

  return matchResult;
}
