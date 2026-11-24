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
    if (!env.useMock) {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("hiresmart_candidate_profile")
        if (stored) {
          try {
            const profile = JSON.parse(stored)
            if (Array.isArray(profile.skills) && profile.skills.length > 0) {
              return profile.skills.map((s: any, idx: number) => ({
                id: s.id || `s_${idx}`,
                name: s.name || s,
                category: s.category || "General",
                level: s.level || "Intermediate",
                currentScore: 80,
                targetScore: 90,
                priority: "High",
                jobDemand: 85,
                description: `${s.name || s} core competency`,
                recommendation: `Continue applying ${s.name || s} on challenging projects`,
                difficulty: "Intermediate",
                estimatedEffort: "2-4 weeks",
                isDetected: true,
              }))
            }
          } catch {}
        }
      }
      return []
    }
    return mockSkills.filter(s => s.isDetected)
  },

  async analyzeSkills() {
    if (!env.useMock) {
      try {
        const res = await httpClient.get<{ success: boolean; data: any }>("/skills/analyze")
        if (res?.data) {
          const rawCategories = Array.isArray(res.data.categories) ? res.data.categories : mockCategoryScores
          const normalizedCategories = rawCategories.map((c: any) => ({
            category: c.category || c.name || "Engineering",
            score: typeof c.score === "number" ? c.score : 80,
            skillsCount: c.skillsCount || 4,
            description: c.description || `Assessment in ${c.category || c.name}`,
          }))

          const rawDetected = Array.isArray(res.data.detectedSkills) ? res.data.detectedSkills : []
          let normalizedDetected = rawDetected.map((s: any, idx: number) => ({
            id: s.id || s._id || `det_skill_${idx}`,
            name: s.name,
            category: s.category || "Backend",
            level: s.level || "Intermediate",
            currentScore: typeof s.currentScore === "number" ? s.currentScore : Math.max(60, 88 - (idx * 3)),
            targetScore: typeof s.targetScore === "number" ? s.targetScore : 90,
            priority: s.priority || (idx < 3 ? "High" : "Medium"),
            jobDemand: typeof s.jobDemand === "number" ? s.jobDemand : 80,
            description: s.description || `${s.name} core competency`,
            recommendation: s.recommendation || `Recommended practice in ${s.name}`,
            difficulty: s.difficulty || "Intermediate",
            estimatedEffort: s.estimatedEffort || "3-4 weeks",
            isDetected: true,
          }))

          if (normalizedDetected.length === 0) {
            normalizedDetected = this.getDetectedSkills()
          }

          return {
            overallScore: res.data.overallScore ?? (normalizedDetected.length > 0 ? 85 : 0),
            categories: normalizedCategories.length > 0 ? normalizedCategories : mockCategoryScores,
            detectedSkills: normalizedDetected,
            trend: mockSkillTrend,
          }
        }
      } catch (err) {
        console.warn("[SkillService] Live analyzeSkills fetch warning, fallback to cache:", err)
      }
      const liveDetected = this.getDetectedSkills()
      return {
        overallScore: liveDetected.length > 0 ? 80 : 0,
        categories: mockCategoryScores,
        detectedSkills: liveDetected,
        trend: mockSkillTrend,
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
        const res = await httpClient.get<{ success: boolean; data: any[] }>("/skills/career-paths")
        if (res?.data && Array.isArray(res.data)) {
          return res.data.map(p => ({
            title: p.title || "Software Engineering Path",
            readinessScore: p.readinessScore || p.matchProbability || 85,
            strongSkills: p.strongSkills || (p.requiredSkills ? p.requiredSkills.slice(0, 3) : ["React", "TypeScript"]),
            missingSkills: p.missingSkills || (p.requiredSkills ? p.requiredSkills.slice(3) : ["AWS", "Docker"]),
          }))
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
