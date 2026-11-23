/**
 * AI Screening Domain Types
 */

import type { AppStatus, AIScreeningStatus } from "./recruiter"

export interface ScreeningJob {
  id: string
  title: string
  location: string
  applications: number
  screened: number
  strongMatches: number
  pending: number
}

export interface DetailedScreeningCandidate {
  id: string
  name: string
  role: string
  location: string
  experience: string
  skills: { name: string; proficiency: string; matchType: "Matched" | "Partial" | "Missing" }[]
  overallMatch: number
  skillMatch: number
  experienceMatch: number
  educationMatch: number
  roleSimilarity: number
  keywordMatch: number
  status: AppStatus
  screeningStatus: AIScreeningStatus
  appliedDate: string
  matchedStrengths: string[]
  potentialGaps: string[]
}
