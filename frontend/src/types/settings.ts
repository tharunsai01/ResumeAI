/**
 * User & Candidate Settings Domain Types
 */

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
