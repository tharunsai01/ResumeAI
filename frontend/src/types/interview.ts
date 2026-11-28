/**
 * Candidate and Recruiter Interview Domain Types
 */

export type InterviewType = "Technical" | "HR" | "Managerial" | "Final"
export type InterviewStatus = "Scheduled" | "Completed" | "Cancelled"

export interface Interview {
  scheduledAt?: string
  jobTitle?: string
  company?: string
  durationMins?: number
  location?: string
  mode?: string
  interviewer?: string
  id: string
  applicationId: string
  jobId: string
  candidateId: string
  date: string
  time: string
  type: InterviewType
  meetingLink: string
  notes: string
  status: InterviewStatus
}
