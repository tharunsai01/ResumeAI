import { defaultMockProfile } from "../data/mockProfile"
import type { CandidateProfile, Education, Experience, Project } from "../data/mockProfile"

const PROFILE_STORAGE_KEY = "hiresmart_candidate_profile"

export const profileService = {
  getCandidateProfile(): CandidateProfile {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error("Failed to parse stored profile", e)
      }
    }
    
    // If not found in localStorage, initialize with default and return
    this.saveProfile(defaultMockProfile)
    return defaultMockProfile
  },

  saveProfile(profile: CandidateProfile): void {
    const completion = this.calculateProfileCompletion(profile)
    const updatedProfile = { ...profile, profileCompletion: completion }
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile))
  },

  updateCandidateProfile(updates: Partial<CandidateProfile>): CandidateProfile {
    const current = this.getCandidateProfile()
    const updated = { ...current, ...updates }
    this.saveProfile(updated)
    return this.getCandidateProfile() // returns with recalculated completion
  },

  calculateProfileCompletion(profile: CandidateProfile): number {
    let score = 0
    const totalWeights = {
      basicInfo: 20,
      resume: 20, // We assume resume is uploaded if avatar or summary exists for now, or just give 20.
      skills: 20,
      education: 15,
      experience: 15,
      careerPreferences: 10
    }

    // Basic Info (20%)
    if (profile.fullName && profile.email && profile.phone && profile.location) {
      score += totalWeights.basicInfo
    } else if (profile.fullName || profile.email) {
      score += totalWeights.basicInfo / 2
    }

    // Resume (20%) - Mocking this as always 20% for now since Phase 2 exists
    score += totalWeights.resume

    // Skills (20%)
    if (profile.skills && profile.skills.length > 0) {
      score += totalWeights.skills
    }

    // Education (15%)
    if (profile.education && profile.education.length > 0) {
      score += totalWeights.education
    }

    // Experience (15%)
    if (profile.experience && profile.experience.length > 0) {
      score += totalWeights.experience
    }

    // Career Preferences (10%)
    if (
      profile.careerPreferences &&
      profile.careerPreferences.preferredJobTitles.length > 0 &&
      profile.careerPreferences.expectedSalary
    ) {
      score += totalWeights.careerPreferences
    }

    return Math.min(100, score)
  },

  // Helpers for nested updates
  addEducation(edu: Education) {
    const profile = this.getCandidateProfile()
    this.updateCandidateProfile({ education: [...profile.education, edu] })
  },
  
  removeEducation(id: string) {
    const profile = this.getCandidateProfile()
    this.updateCandidateProfile({ education: profile.education.filter(e => e.id !== id) })
  },

  addExperience(exp: Experience) {
    const profile = this.getCandidateProfile()
    this.updateCandidateProfile({ experience: [...profile.experience, exp] })
  },
  
  removeExperience(id: string) {
    const profile = this.getCandidateProfile()
    this.updateCandidateProfile({ experience: profile.experience.filter(e => e.id !== id) })
  },

  addProject(proj: Project) {
    const profile = this.getCandidateProfile()
    this.updateCandidateProfile({ projects: [...profile.projects, proj] })
  },
  
  removeProject(id: string) {
    const profile = this.getCandidateProfile()
    this.updateCandidateProfile({ projects: profile.projects.filter(p => p.id !== id) })
  }
}
