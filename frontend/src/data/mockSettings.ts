import type { CandidateSettings } from "../types/settings"

export type { CandidateSettings }

export const defaultMockSettings: CandidateSettings = {
  notifications: {
    jobMatchAlerts: true,
    applicationStatusUpdates: true,
    interviewReminders: true,
    newJobRecommendations: true,
    skillRecommendations: true,
    recruiterMessages: true,
    weeklyCareerSummary: true,
    productUpdates: false
  },
  aiRecommendations: {
    useResumeSkills: true,
    useCareerPreferences: true,
    useExperience: true,
    useLocationPreferences: true,
    useJobHistory: true
  },
  privacy: {
    visibleToRecruiters: true,
    allowRecruitersToContact: true,
    showInRecruiterSearch: true,
    useProfileForJobMatching: true
  },
  appearance: {
    theme: "Light",
    reduceMotion: false
  }
}
