/**
 * Resume Parsing & Analysis Domain Types
 */

export interface SkillStrength {
  name: string
  score: number
  category: "Programming" | "Frontend" | "Backend" | "Database" | "Cloud & DevOps"
}

export interface ResumeExperience {
  title: string
  company: string
  duration: string
  description: string[]
}

export interface ResumeEducation {
  degree: string
  institution: string
  duration: string
}

export interface ResumeProject {
  name: string
  techStack: string[]
  description: string
}

export interface ResumeAnalysisResult {
  score: number
  breakdown: {
    skills: number
    experience: number
    education: number
    projects: number
  }
  personalInfo: {
    name: string
    email: string
    experience: string
    education: string
    location: string
  }
  skills: SkillStrength[]
  experience: ResumeExperience[]
  education: ResumeEducation[]
  projects: ResumeProject[]
  insights: {
    strengths: string[]
    improvements: string[]
    summary: string
  }
}
