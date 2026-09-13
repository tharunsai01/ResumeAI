import { mockSkills, mockCareerPaths, mockSkillTrend, mockRoleComparisons, mockCategoryScores } from "../data/mockSkills"

export const skillService = {
  async analyzeSkills() {
    return {
      overallScore: 85,
      categories: mockCategoryScores,
      detectedSkills: mockSkills.filter(s => s.isDetected),
      trend: mockSkillTrend
    }
  },

  async calculateSkillGaps() {
    return mockSkills.filter(s => s.targetScore > s.currentScore)
  },

  async getSkillRecommendations() {
    // Return high/medium priority gaps as recommendations
    return mockSkills
      .filter(s => s.targetScore > s.currentScore && (s.priority === "High" || s.priority === "Medium"))
      .sort(a => a.priority === "High" ? -1 : 1)
  },

  async getCareerPaths() {
    return mockCareerPaths
  },

  async getSkillDemand() {
    // Just return all skills sorted by job demand
    return [...mockSkills].sort((a, b) => b.jobDemand - a.jobDemand)
  },

  async getRoleComparisons() {
    return mockRoleComparisons
  }
}
