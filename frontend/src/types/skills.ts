/**
 * Skills & Competencies Domain Types
 */

export type SkillCategory = "Programming" | "Frontend" | "Backend" | "Database" | "Cloud & DevOps" | "Tools"
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert"
export type SkillPriority = "High" | "Medium" | "Low"

export interface SkillData {
  id: string
  name: string
  category: SkillCategory
  currentScore: number
  targetScore: number
  level: SkillLevel
  priority: SkillPriority
  jobDemand: number // percentage of jobs asking for it
  description: string
  recommendation: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  estimatedEffort: string // e.g., "4-6 weeks"
  isDetected: boolean // Whether it came from the resume
}

export interface CareerPath {
  title: string
  readinessScore: number
  strongSkills: string[]
  missingSkills: string[]
}

export interface SkillTrend {
  month: string
  score: number
}

export interface SkillRoleComparison {
  role: string
  userCoverage: number
  targetCoverage: number
  missingSkills: string[]
}

export interface CategoryScore {
  category: string
  score: number
  skillsCount: number
}
