import { env } from "../config/env"
import { httpClient } from "./api/httpClient"
import { defaultMockProfile } from "../data/mockProfile"
import type { CandidateProfile, Education, Experience, Project } from "../data/mockProfile"
import type { SkillData } from "../data/mockSkills"

const PROFILE_STORAGE_KEY = "hiresmart_candidate_profile"

export const profileService = {
  getCandidateProfile(): CandidateProfile {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error("Failed to parse stored profile", e)
        }
      }
    }
    
    // If not found in localStorage, initialize with default and return
    this.saveProfile(defaultMockProfile)
    return defaultMockProfile
  },

  async fetchLiveProfile(): Promise<CandidateProfile> {
    if (env.useMock) {
      return this.getCandidateProfile()
    }
    try {
      const res = await httpClient.get<{ success: boolean; data: any }>("/candidates/profile")
      if (res?.data) {
        const p = res.data
        const mapped: CandidateProfile = {
          ...defaultMockProfile,
          summary: p.summary || defaultMockProfile.summary,
          location: p.location || defaultMockProfile.location,
          phone: p.phone || defaultMockProfile.phone,
          currentRole: p.headline || defaultMockProfile.currentRole,
          skills: Array.isArray(p.skills)
            ? p.skills.map((s: any, idx: number) => (typeof s === "string" ? { id: `s_${idx}`, name: s, level: "Intermediate", category: "Programming" } : s))
            : defaultMockProfile.skills,
          experience: p.experience || defaultMockProfile.experience,
          education: p.education || defaultMockProfile.education,
          projects: p.projects || defaultMockProfile.projects,
          profileCompletion: p.profileCompletion ?? this.calculateProfileCompletion(defaultMockProfile),
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
