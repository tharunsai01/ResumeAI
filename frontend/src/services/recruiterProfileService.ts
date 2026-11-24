import { env } from "../config/env"
import { httpClient } from "./api/httpClient"
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
    const currentUser = authService.getCurrentUser()
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(RECRUITER_PROFILE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (currentUser && currentUser.role === "recruiter") {
            const isMockName = parsed.fullName === "Rahul Sharma" || !parsed.fullName
            const isMockEmail = parsed.email === "rahul@hiresmart.ai" || !parsed.email
            const emailMismatch = parsed.email && parsed.email !== currentUser.email && !isMockEmail
            if (isMockName || isMockEmail || emailMismatch) {
              parsed.fullName = currentUser.name || parsed.fullName
              parsed.email = currentUser.email || parsed.email
              if (currentUser.company && !parsed.company) {
                parsed.company = currentUser.company
              }
              if (currentUser.avatarUrl && !parsed.avatar) {
                parsed.avatar = currentUser.avatarUrl
              }
              this.saveProfile(parsed)
              return parsed
            }
          }
          return parsed
        } catch (e) {
          console.error("Failed to parse recruiter profile", e)
        }
      }

      // Initialize from current auth session if recruiter is signed in
      if (currentUser && currentUser.role === "recruiter") {
        const initialized: RecruiterProfile = {
          id: currentUser.id || "rec_live",
          fullName: currentUser.name || (env.useMock ? defaultRecruiterProfile.fullName : ""),
          email: currentUser.email || (env.useMock ? defaultRecruiterProfile.email : ""),
          phone: env.useMock ? defaultRecruiterProfile.phone : "",
          company: currentUser.company || (env.useMock ? defaultRecruiterProfile.company : ""),
          designation: env.useMock ? defaultRecruiterProfile.designation : "Recruiter",
          location: env.useMock ? defaultRecruiterProfile.location : "",
          about: env.useMock ? defaultRecruiterProfile.about : "",
          avatar: currentUser.avatarUrl || "",
        }
        if (typeof window !== "undefined") {
          localStorage.setItem(RECRUITER_PROFILE_KEY, JSON.stringify(initialized))
        }
        return initialized
      }
    }
    return defaultRecruiterProfile
  },

  syncWithUser(user: { name?: string; email?: string; company?: string; avatarUrl?: string | null }): void {
    if (!user || typeof window === "undefined") return
    const stored = localStorage.getItem(RECRUITER_PROFILE_KEY)
    let profile: RecruiterProfile
    if (stored) {
      try {
        profile = JSON.parse(stored)
      } catch {
        profile = { ...defaultRecruiterProfile }
      }
    } else {
      profile = { ...defaultRecruiterProfile }
    }
    if (user.name) profile.fullName = user.name
    if (user.email) profile.email = user.email
    if (user.company) profile.company = user.company
    if (user.avatarUrl) profile.avatar = user.avatarUrl
    this.saveProfile(profile)
  },

  async fetchLiveProfile(): Promise<RecruiterProfile> {
    if (env.useMock) return this.getProfile()
    try {
      const res = await httpClient.get<{ success: boolean; data: any }>("/recruiter/profile")
      if (res?.data) {
        const p = res.data
        const currentUser = authService.getCurrentUser()
        const mapped: RecruiterProfile = {
          id: p._id || p.id || currentUser?.id || "rec_live",
          fullName: p.user?.fullName || p.fullName || currentUser?.name || "",
          email: p.user?.email || p.email || currentUser?.email || "",
          phone: p.phone || "",
          company: p.companyName || currentUser?.company || "",
          designation: p.designation || p.jobTitle || "Recruiter",
          location: p.location || "",
          about: p.description || p.companyOverview || "",
          avatar: p.user?.avatarUrl || p.logoUrl || currentUser?.avatarUrl || "",
        }
        if (typeof window !== "undefined") {
          localStorage.setItem(RECRUITER_PROFILE_KEY, JSON.stringify(mapped))
          window.dispatchEvent(new Event("hiresmart_recruiter_profile_updated"))
        }
        return mapped
      }
    } catch (err) {
      console.warn("[RecruiterProfileService] Live fetch warning:", err)
    }
    return this.getProfile()
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

    if (!env.useMock) {
      httpClient.put("/recruiter/profile", {
        fullName: profile.fullName,
        companyName: profile.company,
        designation: profile.designation,
        phone: profile.phone,
        location: profile.location,
        description: profile.about,
      }).catch((err) => {
        console.warn("[RecruiterProfileService] Live profile sync warning:", err)
      })
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
