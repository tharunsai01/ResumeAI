import { authService } from "./authService"
import type { RecruiterProfile } from "../types/recruiter"

export type { RecruiterProfile }

export const defaultRecruiterProfile: RecruiterProfile = {
  id: "recruiter_default",
  fullName: "Rahul Sharma",
  email: "rahul@hiresmart.ai",
  phone: "+91 98765 43210",
  company: "HireSmart Technologies",
  designation: "Talent Acquisition Specialist",
  location: "Bangalore, India",
  about: "Experienced technical recruiter specializing in engineering, AI, and product talent acquisition. Dedicated to building high-performing teams with exceptional talent.",
  avatar: ""
}

const RECRUITER_PROFILE_KEY = "hiresmart_recruiter_profile"

export const recruiterProfileService = {
  getProfile(): RecruiterProfile {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(RECRUITER_PROFILE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error("Failed to parse recruiter profile", e)
        }
      }

      // Initialize from current auth session if recruiter is signed in
      const currentUser = authService.getCurrentUser()
      if (currentUser && currentUser.role === "recruiter") {
        const initialized: RecruiterProfile = {
          ...defaultRecruiterProfile,
          id: currentUser.id || defaultRecruiterProfile.id,
          fullName: currentUser.name || defaultRecruiterProfile.fullName,
          email: currentUser.email || defaultRecruiterProfile.email,
          company: currentUser.company || defaultRecruiterProfile.company
        }
        this.saveProfile(initialized)
        return initialized
      }
    }
    return defaultRecruiterProfile
  },

  saveProfile(profile: RecruiterProfile): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(RECRUITER_PROFILE_KEY, JSON.stringify(profile))
      window.dispatchEvent(new Event("hiresmart_recruiter_profile_updated"))

      // Synchronize session if recruiter is signed in
      const currentUser = authService.getCurrentUser()
      if (currentUser && currentUser.role === "recruiter") {
        if (currentUser.name !== profile.fullName || currentUser.company !== profile.company) {
          const updatedSession = {
            ...currentUser,
            name: profile.fullName,
            company: profile.company
          }
          localStorage.setItem("hiresmart_session", JSON.stringify(updatedSession))
          window.dispatchEvent(new Event("hiresmart_auth_changed"))
        }
      }
    }
  },

  updateProfile(updates: Partial<RecruiterProfile>): RecruiterProfile {
    const current = this.getProfile()
    const updated = { ...current, ...updates }
    this.saveProfile(updated)
    return updated
  },

  resetProfile(): RecruiterProfile {
    this.saveProfile(defaultRecruiterProfile)
    return defaultRecruiterProfile
  }
}
