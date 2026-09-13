export interface CandidateSettings {
  notifications: {
    jobMatchAlerts: boolean
    applicationStatusUpdates: boolean
    interviewReminders: boolean
    newJobRecommendations: boolean
    skillRecommendations: boolean
    recruiterMessages: boolean
    weeklyCareerSummary: boolean
    productUpdates: boolean
  }
  aiRecommendations: {
    useResumeSkills: boolean
    useCareerPreferences: boolean
    useExperience: boolean
    useLocationPreferences: boolean
    useJobHistory: boolean
  }
  privacy: {
    visibleToRecruiters: boolean
    allowRecruitersToContact: boolean
    showInRecruiterSearch: boolean
    useProfileForJobMatching: boolean
  }
  appearance: {
    theme: "Light" | "Dark" | "System"
    reduceMotion: boolean
  }
}

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
