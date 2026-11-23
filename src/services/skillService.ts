/**
 * HireSmart AI - Skill Service
 * Provides skills taxonomy, detected skills, skill recommendations, and demand trends.
 */

import { env } from "../config/env"
import { httpClient } from "./api/httpClient"
import {
  mockSkills,
  mockCareerPaths,
  mockSkillTrend,
  mockRoleComparisons,
  mockCategoryScores,
} from "../data/mockSkills"
import type {
  SkillData,
  CareerPath,
  SkillTrend,
  SkillRoleComparison,
  SkillCategory,
  SkillLevel,
  SkillPriority,
} from "../types/skills"

export type {
  SkillData,
  CareerPath,
  SkillTrend,
  SkillRoleComparison,
  SkillCategory,
  SkillLevel,
  SkillPriority,
}

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
      try {
        const res = await httpClient.get<{ success: boolean; data: any }>("/skills/analyze")
        if (res?.data) {
          return {
            overallScore: res.data.overallScore ?? 85,
            categories: res.data.categories || mockCategoryScores,
            detectedSkills: res.data.detectedSkills || mockSkills.filter(s => s.isDetected),
            trend: mockSkillTrend,
          }
        }
      } catch (err) {
        console.warn("[SkillService] Live analyzeSkills fetch warning, fallback to cache:", err)
      }
    }
    return {
      overallScore: 85,
      categories: mockCategoryScores,
      detectedSkills: mockSkills.filter(s => s.isDetected),
      trend: mockSkillTrend,
    }
  },

  async calculateSkillGaps() {
    return mockSkills.filter(s => s.targetScore > s.currentScore)
  },

  async getSkillRecommendations() {
    return mockSkills
      .filter(s => s.targetScore > s.currentScore && (s.priority === "High" || s.priority === "Medium"))
      .sort(a => (a.priority === "High" ? -1 : 1))
  },

  async getCareerPaths(): Promise<CareerPath[]> {
    if (!env.useMock) {
      try {
        const res = await httpClient.get<{ success: boolean; data: CareerPath[] }>("/skills/career-paths")
        if (res?.data && Array.isArray(res.data)) {
          return res.data
        }
      } catch (err) {
        console.warn("[SkillService] Live getCareerPaths fetch warning, fallback to cache:", err)
      }
    }
    return mockCareerPaths
  },

  async getSkillDemand(): Promise<SkillData[]> {
    if (!env.useMock) {
      try {
        const res = await httpClient.get<{ success: boolean; data: any[] }>("/skills/demand")
        if (res?.data && Array.isArray(res.data)) {
          return res.data.map((item, idx) => ({
            id: item._id || `skill_${idx}`,
            name: item.name,
            category: (["Programming", "Frontend", "Backend", "Database", "Cloud & DevOps", "Tools"].includes(item.category)
              ? item.category
              : "Backend") as SkillCategory,
            level: (["Beginner", "Intermediate", "Advanced", "Expert"].includes(item.level)
              ? item.level
              : "Intermediate") as SkillLevel,
            isDetected: true,
            currentScore: 80,
            targetScore: 90,
            jobDemand: item.jobDemand ?? 85,
            priority: (item.jobDemand > 80 ? "High" : "Medium") as SkillPriority,
            description: item.description || `Industry requirement for ${item.name}`,
            recommendation: `Recommended learning path for ${item.name}`,
            difficulty: "Intermediate" as const,
            estimatedEffort: "4-6 weeks",
          }))
        }
      } catch (err) {
        console.warn("[SkillService] Live getSkillDemand fetch warning, fallback to cache:", err)
      }
    }
    return [...mockSkills].sort((a, b) => b.jobDemand - a.jobDemand)
  },

  async getRoleComparisons(): Promise<SkillRoleComparison[]> {
    return mockRoleComparisons
  },
}
