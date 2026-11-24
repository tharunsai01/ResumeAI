/**
 * Job Application Domain Types
 */

export type ApplicationStatus = 
  | "Applied" 
  | "AI Screened" 
  | "Under Review" 
  | "Shortlisted" 
  | "Interview" 
  | "Offer" 
  | "Rejected" 
  | "Withdrawn" 
  | "Hired"

export interface TimelineEvent {
  status: ApplicationStatus
  date: string
}

export interface ApplicationAiScreening {
  skillMatch: number
  experienceMatch: number
  educationMatch: number
  roleMatch: number
  strengths: string[]
  missingSkills: string[]
}

export interface Application {
  id: string
  jobId: string
  candidateId: string
  status: ApplicationStatus
  matchScore: number
  appliedDate: string
  timeline: TimelineEvent[]
  notes: string
  aiScreening?: ApplicationAiScreening
}
