/**
 * Recruiter Portal and Candidate Review Domain Types
 */

export type AppStatus = "Applied" | "Screening" | "Shortlisted" | "Interview" | "Rejected" | "Hired" | "Withdrawn"
export type AIScreeningStatus = "Not Screened" | "Screened" | "Strong Match" | "Potential Match" | "Low Match"

export interface CandidateExperience {
  role: string
  company: string
  duration: string
  description: string
}

export interface CandidateEducation {
  degree: string
  institution: string
  year: string
}

export interface CandidateProject {
  title: string
  technologies: string[]
  description: string
}

export interface RecruiterCandidate {
  applicationId?: string
  summary?: string
  workHistory?: (string | { title?: string; company?: string; duration?: string; description?: string[] })[]
  projectText?: string[]
  resume?: { id: string; fileName: string; mimeType?: string; uploadedAt?: string } | null
  id: string
  name: string
  title: string
  location: string
  email: string
  experience: string
  skills: { name: string; proficiency: "Strong" | "Intermediate" | "Basic" }[]
  education: CandidateEducation[]
  projects: CandidateProject[]
  hasMatchScore?: boolean
  matchScore: number
  status: AppStatus
  appliedRole: string
  appliedDate: string
  screeningStatus: AIScreeningStatus
  applicationHistory: { id?: string; role: string; date: string; status: AppStatus }[]
}

export interface RecruiterProfile {
  id: string
  fullName: string
  email: string
  phone: string
  company: string
  designation: string
  location: string
  about: string
  avatar?: string
}
