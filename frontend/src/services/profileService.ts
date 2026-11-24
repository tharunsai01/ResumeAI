import { env } from "../config/env"
import { httpClient } from "./api/httpClient"
import { authService } from "./authService"
import { defaultMockProfile } from "../data/mockProfile"
import type { CandidateProfile, Education, Experience, Project } from "../data/mockProfile"
import type { SkillData } from "../data/mockSkills"

const PROFILE_STORAGE_KEY = "hiresmart_candidate_profile"

export function createEmptyCandidateProfile(user?: { id?: string; name?: string; email?: string; avatarUrl?: string | null }): CandidateProfile {
  return {
    id: user?.id || "cand_new",
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    avatar: user?.avatarUrl || "",
    summary: "",
    currentRole: "",
    yearsOfExperience: "0",
    careerLevel: "Entry Level",
    skills: [],
    education: [],
    experience: [],
    projects: [],
    careerPreferences: {
      preferredJobTitles: [],
      preferredLocations: [],
      preferredJobType: [],
      preferredWorkMode: [],
      preferredExperienceLevel: "Entry Level",
      expectedSalary: "",
      willingToRelocate: false,
    },
    careerInterests: [],
    openToWork: true,
    visibility: "Visible to Recruiters",
    profileCompletion: 0,
  }
}

export const profileService = {
  getCandidateProfile(): CandidateProfile {
    const currentUser = authService.getCurrentUser()
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
      if (stored) {
        try {
          const parsed: CandidateProfile = JSON.parse(stored)
          if (currentUser) {
            const isMockName = parsed.fullName === "Rahul Kumar" || !parsed.fullName
            const isMockEmail = parsed.email === "rahul.kumar@example.com" || !parsed.email
            const emailMismatch = parsed.email && parsed.email !== currentUser.email && !isMockEmail
            if (isMockName || isMockEmail || emailMismatch) {
              parsed.fullName = currentUser.name || parsed.fullName
              parsed.email = currentUser.email || parsed.email
              if (currentUser.avatarUrl && !parsed.avatar) {
                parsed.avatar = currentUser.avatarUrl
              }
              const completion = this.calculateProfileCompletion(parsed)
              const updated = { ...parsed, profileCompletion: completion }
              localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated))
              return updated
            }
          }
          return parsed
        } catch (e) {
          console.error("Failed to parse stored profile", e)
        }
      }
    }
    
    // If not found in localStorage, initialize clean profile in live mode or default in mock mode
    if (!env.useMock) {
      const emptyProfile = createEmptyCandidateProfile(currentUser || undefined)
      if (typeof window !== "undefined") {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(emptyProfile))
      }
      return emptyProfile
    }

    const initialProfile: CandidateProfile = {
      ...defaultMockProfile,
      fullName: currentUser?.name || defaultMockProfile.fullName,
      email: currentUser?.email || defaultMockProfile.email,
      avatar: currentUser?.avatarUrl || defaultMockProfile.avatar || "",
    }
    this.saveProfile(initialProfile)
    return initialProfile
  },

  syncWithUser(user: { name?: string; email?: string; avatarUrl?: string | null }): void {
    if (!user || typeof window === "undefined") return
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
    let profile: CandidateProfile
    if (stored) {
      try {
        profile = JSON.parse(stored)
      } catch {
        profile = env.useMock ? { ...defaultMockProfile } : createEmptyCandidateProfile(user)
      }
    } else {
      profile = env.useMock ? { ...defaultMockProfile } : createEmptyCandidateProfile(user)
    }
    if (user.name) profile.fullName = user.name
    if (user.email) profile.email = user.email
    if (user.avatarUrl) profile.avatar = user.avatarUrl
    const completion = this.calculateProfileCompletion(profile)
    const updated = { ...profile, profileCompletion: completion }
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('hiresmart_profile_updated'))
  },

  async fetchLiveProfile(): Promise<CandidateProfile> {
    if (env.useMock) {
      return this.getCandidateProfile()
    }
    try {
      const res = await httpClient.get<{ success: boolean; data: any }>("/candidates/profile")
      if (res?.data) {
        const p = res.data
        const currentUser = authService.getCurrentUser()
        const backendUser = p.user
        const resolvedName = backendUser?.fullName || currentUser?.name || ""
        const resolvedEmail = backendUser?.email || currentUser?.email || ""
        const resolvedAvatar = backendUser?.avatarUrl || currentUser?.avatarUrl || ""

        const mapped: CandidateProfile = {
          id: p._id || "cand_live",
          fullName: resolvedName,
          email: resolvedEmail,
          avatar: resolvedAvatar,
          summary: p.summary || "",
          location: p.location || "",
          phone: p.phone || "",
          linkedin: p.links?.linkedin || "",
          github: p.links?.github || "",
          portfolio: p.links?.portfolio || "",
          currentRole: p.headline || "",
          yearsOfExperience: p.yearsOfExperience ? String(p.yearsOfExperience) : "0",
          careerLevel: p.careerLevel || "Entry Level",
          skills: Array.isArray(p.skills)
            ? p.skills.map((s: any, idx: number) => (typeof s === "string" ? { id: `s_${idx}`, name: s, level: "Intermediate", category: "General" } : s))
            : [],
          experience: Array.isArray(p.experience)
            ? p.experience.map((exp: any, idx: number) => ({
                id: exp._id || exp.id || `exp_${idx}`,
                jobTitle: exp.title || exp.jobTitle || "",
                company: exp.company || "",
                location: exp.location || "",
                startDate: exp.startDate ? new Date(exp.startDate).toISOString().slice(0, 7) : "",
                endDate: exp.current ? "Present" : (exp.endDate ? new Date(exp.endDate).toISOString().slice(0, 7) : "Present"),
                currentlyWorking: !!exp.current,
                description: exp.description || "",
              }))
            : [],
          education: Array.isArray(p.education)
            ? p.education.map((edu: any, idx: number) => ({
                id: edu._id || edu.id || `edu_${idx}`,
                degree: edu.degree || "",
                fieldOfStudy: edu.fieldOfStudy || "",
                institution: edu.institution || "",
                startYear: edu.startYear ? String(edu.startYear) : "",
                endYear: edu.endYear ? String(edu.endYear) : "",
                grade: edu.grade || "",
              }))
            : [],
          projects: Array.isArray(p.projects)
            ? p.projects.map((proj: any, idx: number) => ({
                id: proj._id || proj.id || `proj_${idx}`,
                name: proj.title || proj.name || "",
                description: proj.description || "",
                technologies: proj.technologies || [],
                githubUrl: proj.link || "",
                startDate: proj.startDate ? new Date(proj.startDate).toISOString().slice(0, 7) : "",
                endDate: proj.endDate ? new Date(proj.endDate).toISOString().slice(0, 7) : "",
              }))
            : [],
          careerPreferences: {
            preferredJobTitles: p.careerPreferences?.preferredJobTitles || [],
            preferredLocations: p.careerPreferences?.preferredLocations || [],
            preferredJobType: p.preferredJobTypes || [],
            preferredWorkMode: [],
            preferredExperienceLevel: "Entry Level",
            expectedSalary: p.careerPreferences?.expectedSalary ? `₹${p.careerPreferences.expectedSalary}` : "",
            willingToRelocate: !!p.careerPreferences?.willingToRelocate,
          },
          careerInterests: [],
          openToWork: true,
          visibility: "Visible to Recruiters",
          profileCompletion: typeof p.profileCompletion === "number" ? p.profileCompletion : 0,
        }
        if (typeof window !== "undefined") {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(mapped))
          window.dispatchEvent(new Event('hiresmart_profile_updated'))
        }
        return mapped
      }
    } catch (e) {
      console.warn("[ProfileService] Live fetch failed, using cached profile", e)
    }
    return this.getCandidateProfile()
  },

  saveProfile(profile: CandidateProfile): void {
    const completion = this.calculateProfileCompletion(profile)
    const updatedProfile = { ...profile, profileCompletion: completion }
    if (typeof window !== "undefined") {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile))
      window.dispatchEvent(new Event('hiresmart_profile_updated'))
    }

    if (!env.useMock) {
      const skills = Array.isArray(profile.skills)
        ? profile.skills.map((s: any) => (typeof s === "string" ? s : s?.name)).filter(Boolean)
        : undefined

      const cleanYear = (y: any) => {
        const num = parseInt(String(y), 10)
        return !isNaN(num) && num >= 1950 && num <= 2100 ? num : null
      }

      const experience = Array.isArray(profile.experience)
        ? profile.experience.map((exp: any) => ({
            company: exp.company || "Company",
            title: exp.jobTitle || exp.title || "Role",
            startDate: exp.startDate || null,
            endDate: exp.endDate || null,
            current: !!exp.currentlyWorking,
            description: exp.description || null,
          }))
        : undefined

      const education = Array.isArray(profile.education)
        ? profile.education.map((edu: any) => ({
            institution: edu.institution || "Institution",
            degree: edu.degree || null,
            fieldOfStudy: edu.fieldOfStudy || null,
            startYear: cleanYear(edu.startYear),
            endYear: cleanYear(edu.endYear),
          }))
        : undefined

      httpClient
        .put("/candidates/profile", {
          headline: profile.currentRole || undefined,
          summary: profile.summary || undefined,
          location: profile.location || undefined,
          phone: profile.phone || undefined,
          skills,
          experience,
          education,
        })
        .catch((err) => {
          console.warn("[ProfileService] Live profile sync warning:", err)
        })
    }
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
      resume: 20, // Assumed uploaded
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

    // Resume (20%)
    const hasResume = typeof window !== "undefined" && !!localStorage.getItem("hiresmart_active_resume")
    if (hasResume || (env.useMock && profile.skills && profile.skills.length > 0)) {
      score += totalWeights.resume
    }

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

  // Skills helpers
  addSkill(skill: Pick<SkillData, "id" | "name" | "level" | "category">): CandidateProfile {
    const profile = this.getCandidateProfile()
    const exists = profile.skills.some(s => s.name.toLowerCase() === skill.name.trim().toLowerCase())
    if (exists) {
      throw new Error(`Skill "${skill.name}" already exists in your profile.`)
    }
    const newSkill = { ...skill, name: skill.name.trim() }
    return this.updateCandidateProfile({ skills: [...profile.skills, newSkill] })
  },

  updateSkill(skill: Pick<SkillData, "id" | "name" | "level" | "category">): CandidateProfile {
    const profile = this.getCandidateProfile()
    const duplicate = profile.skills.some(
      s => s.id !== skill.id && s.name.toLowerCase() === skill.name.trim().toLowerCase()
    )
    if (duplicate) {
      throw new Error(`Another skill named "${skill.name}" already exists.`)
    }
    const updatedSkills = profile.skills.map(s => s.id === skill.id ? { ...skill, name: skill.name.trim() } : s)
    return this.updateCandidateProfile({ skills: updatedSkills })
  },

  removeSkill(id: string): CandidateProfile {
    const profile = this.getCandidateProfile()
    return this.updateCandidateProfile({ skills: profile.skills.filter(s => s.id !== id) })
  },

  // Education helpers
  addEducation(edu: Education): CandidateProfile {
    const profile = this.getCandidateProfile()
    return this.updateCandidateProfile({ education: [...profile.education, edu] })
  },
  
  updateEducation(edu: Education): CandidateProfile {
    const profile = this.getCandidateProfile()
    const updated = profile.education.map(e => e.id === edu.id ? edu : e)
    return this.updateCandidateProfile({ education: updated })
  },

  removeEducation(id: string): CandidateProfile {
    const profile = this.getCandidateProfile()
    return this.updateCandidateProfile({ education: profile.education.filter(e => e.id !== id) })
  },

  // Experience helpers
  addExperience(exp: Experience): CandidateProfile {
    const profile = this.getCandidateProfile()
    return this.updateCandidateProfile({ experience: [...profile.experience, exp] })
  },

  updateExperience(exp: Experience): CandidateProfile {
    const profile = this.getCandidateProfile()
    const updated = profile.experience.map(e => e.id === exp.id ? exp : e)
    return this.updateCandidateProfile({ experience: updated })
  },
  
  removeExperience(id: string): CandidateProfile {
    const profile = this.getCandidateProfile()
    return this.updateCandidateProfile({ experience: profile.experience.filter(e => e.id !== id) })
  },

  // Projects helpers
  addProject(proj: Project): CandidateProfile {
    const profile = this.getCandidateProfile()
    return this.updateCandidateProfile({ projects: [...profile.projects, proj] })
  },
  
  updateProject(proj: Project): CandidateProfile {
    const profile = this.getCandidateProfile()
    const updated = profile.projects.map(p => p.id === proj.id ? proj : p)
    return this.updateCandidateProfile({ projects: updated })
  },

  removeProject(id: string): CandidateProfile {
    const profile = this.getCandidateProfile()
    return this.updateCandidateProfile({ projects: profile.projects.filter(p => p.id !== id) })
  },

  // Career Interests helpers
  addCareerInterest(interest: string): CandidateProfile {
    const profile = this.getCandidateProfile()
    const clean = interest.trim()
    if (!clean) return profile
    const exists = profile.careerInterests.some(i => i.toLowerCase() === clean.toLowerCase())
    if (exists) {
      throw new Error(`"${clean}" is already in your career interests.`)
    }
    return this.updateCandidateProfile({ careerInterests: [...profile.careerInterests, clean] })
  },

  removeCareerInterest(interest: string): CandidateProfile {
    const profile = this.getCandidateProfile()
    return this.updateCandidateProfile({
      careerInterests: profile.careerInterests.filter(i => i.toLowerCase() !== interest.toLowerCase())
    })
  }
}
