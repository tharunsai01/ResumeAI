/**
 * Job and Opportunity Domain Types
 */

export type JobType = "Full-time" | "Part-time" | "Internship" | "Contract"
export type WorkMode = "On-site" | "Hybrid" | "Remote"
export type JobExperienceLevel = "Fresher" | "0–2 Years" | "2–5 Years" | "5+ Years"
export type JobStatus = "Active" | "Draft" | "Closed"

export interface Job {
  id: string
  title: string
  company: string
  location: string
  category: string
  salary: string
  type: JobType
  experience: JobExperienceLevel
  description: string
  aboutCompany: string
  additionalInfo: string
  responsibilities: string[]
  requirements: string[]
  skills: string[]
  postedDate: string
}

export interface RecruiterJob {
  id: string
  title: string
  company: string
  location: string
  workMode: WorkMode
  jobType: JobType
  category?: string
  preferredSkills?: string[]
  experience: string
  salary: string
  skills: string[]
  description: string
  status: JobStatus
  applications: number
  postedDate: string
}

export interface JobMatchResult {
  job: Job
  skillMatch: number
  experienceMatch: number
  educationMatch: number
  roleSimilarity: number
  overallMatch: number
  matchedSkills: string[]
  missingSkills: string[]
  explanation: {
    strengths: string[]
    improvements: string[]
  }
}
