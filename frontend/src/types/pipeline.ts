/**
 * Recruiter Hiring Pipeline & Kanban Domain Types
 */

export type PipelineStage = 
  | "Shortlisted" 
  | "Interview Scheduled" 
  | "Interview Completed" 
  | "Decision Pending" 
  | "Hired" 
  | "Rejected"

export interface PipelineCandidate {
  applicationId?: string
  scheduledAt?: string
  id: string
  name: string
  role: string
  experience: string
  skills: string[]
  overallMatch?: number
  stage: PipelineStage
  interviewId?: string
}

export interface MockInterview {
  applicationId?: string
  id: string
  candidateId: string
  candidateName: string
  jobId: string
  jobTitle: string
  date: string
  time: string
  duration: string
  type: string
  interviewer: string
  status: "Scheduled" | "Completed" | "Cancelled" | "No Show" | "Needs Decision"
  feedback?: {
    overall: number
    technical: number
    communication: number
    problemSolving: number
    comments: string
    recommendation: "Strong Hire" | "Hire" | "Further Review" | "Do Not Proceed"
  }
}
