/**
 * HireSmart AI - Skill Service
 * Provides skills taxonomy, detected skills, skill recommendations, and demand trends.
 */

import { env } from "../config/env"
import {
  mockSkills,
  mockCareerPaths,
  mockSkillTrend,
  mockRoleComparisons,
  mockCategoryScores,
} from "../data/mockSkills"
import type { SkillData, CareerPath, SkillTrend, SkillRoleComparison } from "../types/skills"

export type { SkillData, CareerPath, SkillTrend, SkillRoleComparison }

export const skillService = {
  /**
   * Retrieves all candidate skills.
   */
  getSkills(): SkillData[] {
    return mockSkills
  },

  /**
   * Retrieves skills that have been extracted and detected from the candidate profile/resume.
   */
  getDetectedSkills(): SkillData[] {
    return mockSkills.filter(s => s.isDetected)
  },

  async analyzeSkills() {
    if (!env.useMock) {
      throw new Error("Live API mode is not yet configured for skillService.")
    }
    return {
      overallScore: 85,
      categories: mockCategoryScores,
      detectedSkills: mockSkills.filter(s => s.isDetected),
      trend: mockSkillTrend,
    }
  },

  async calculateSkillGaps() {
    if (!env.useMock) {
      throw new Error("Live API mode is not yet configured for skillService.")
    }
    return mockSkills.filter(s => s.targetScore > s.currentScore)
  },

  async getSkillRecommendations() {
    if (!env.useMock) {
      throw new Error("Live API mode is not yet configured for skillService.")
    }
    return mockSkills
      .filter(s => s.targetScore > s.currentScore && (s.priority === "High" || s.priority === "Medium"))
      .sort(a => (a.priority === "High" ? -1 : 1))
  },

  async getCareerPaths(): Promise<CareerPath[]> {
    if (!env.useMock) {
      throw new Error("Live API mode is not yet configured for skillService.")
    }
    return mockCareerPaths
  },

  async getSkillDemand(): Promise<SkillData[]> {
    if (!env.useMock) {
      throw new Error("Live API mode is not yet configured for skillService.")
    }
    return [...mockSkills].sort((a, b) => b.jobDemand - a.jobDemand)
  },

  async getRoleComparisons(): Promise<SkillRoleComparison[]> {
    if (!env.useMock) {
      throw new Error("Live API mode is not yet configured for skillService.")
    }
    return mockRoleComparisons
  },
}
