/**
 * Candidate and Profile Domain Types
 */

import type { SkillData } from "./skills"
import type { JobType, WorkMode } from "./job"

export type CareerLevel = "Fresher" | "Entry Level" | "Mid Level" | "Senior" | "Lead"

export interface Education {
  id: string
  degree: string
  fieldOfStudy: string
  institution: string
  startYear: string
  endYear: string
  grade?: string
}

export interface Experience {
  id: string
  jobTitle: string
  company: string
  location: string
  startDate: string
  endDate: string
  currentlyWorking: boolean
  description: string
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  projectUrl?: string
  githubUrl?: string
  startDate: string
  endDate: string
}

export interface CareerPreferences {
  preferredJobTitles: string[]
  preferredLocations: string[]
  preferredJobType: JobType[]
  preferredWorkMode: WorkMode[]
  preferredExperienceLevel: CareerLevel
  expectedSalary: string
  willingToRelocate: boolean
}

export interface CandidateProfile {
  id: string
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  portfolio: string
  avatar: string
  summary: string
  currentRole: string
  yearsOfExperience: string
  careerLevel: CareerLevel
  skills: Pick<SkillData, "id" | "name" | "level" | "category">[]
  education: Education[]
  experience: Experience[]
  projects: Project[]
  careerPreferences: CareerPreferences
  careerInterests: string[]
  openToWork: boolean
  visibility: "Visible to Recruiters" | "Private"
  profileCompletion: number
}

export interface Candidate {
  id: string
  summary: string
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    linkedin: string
  }
  skills: {
    languages: string[]
    frameworks: string[]
    tools: string[]
  }
  experience: {
    role: string
    company: string
    duration: string
    highlights: string[]
  }[]
  education: {
    degree: string
    institution: string
    year: string
  }[]
}
