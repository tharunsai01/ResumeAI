/**
 * HireSmart AI - Recruiter Candidate Service
 * Manages recruiter-facing candidate lists, candidate profile lookups, and status updates.
 */

import { initialRecruiterCandidates } from "../data/recruiterMockData"
import type { RecruiterCandidate, AppStatus, AIScreeningStatus } from "../types/recruiter"
import { env } from "../config/env"
import { httpClient } from "./api/httpClient"

export type { RecruiterCandidate, AppStatus, AIScreeningStatus }

const RECRUITER_CANDIDATES_KEY = "hiresmart_recruiter_candidates"

export const recruiterCandidateService = {
  /**
   * Retrieves all candidates available to the recruiter.
   * In live mode, attempts to fetch from backend; otherwise uses localStorage or mock.
   */
  async fetchLiveCandidates(params?: { search?: string; skills?: string; experience?: string }): Promise<RecruiterCandidate[]> {
    if (!env.useMock) {
      try {
        const queryParams = new URLSearchParams()
        if (params?.search) queryParams.set("search", params.search)
        if (params?.skills) queryParams.set("skills", params.skills)
        if (params?.experience) queryParams.set("experience", params.experience)
        const qs = queryParams.toString() ? `?${queryParams.toString()}` : ""
        const res = await httpClient.get<{ success: boolean; data: any[] }>(`/recruiter/candidates${qs}`)
        if (res?.data && Array.isArray(res.data)) {
          const mapped: RecruiterCandidate[] = res.data.map((c: any) => ({
            id: c._id || c.id,
            name: c.fullName || (c.userId?.firstName ? `${c.userId.firstName} ${c.userId.lastName}` : "Candidate"),
            title: c.headline || "Software Engineer",
            email: c.email || c.userId?.email || "",
            location: c.location || "Remote",
            experience: `${c.totalExperienceYears || 0} yrs`,
            skills: Array.isArray(c.skills)
              ? c.skills.map((s: any) => ({
                  name: typeof s === "string" ? s : s.name,
                  proficiency: "Strong" as const,
                }))
              : [],
            education: Array.isArray(c.education)
              ? c.education.map((e: any) => ({
                  degree: e.degree || "B.S. Computer Science",
                  institution: e.institution || "University",
                  year: e.year || "2022",
                }))
              : [],
            projects: Array.isArray(c.projects)
              ? c.projects.map((p: any) => ({
                  title: p.title || "Project",
                  technologies: p.technologies || [],
                  description: p.description || "",
                }))
              : [],
            matchScore: c.screeningScore || 85,
            status: "Applied" as AppStatus,
            appliedRole: c.headline || "Full Stack Developer",
            appliedDate: new Date(c.createdAt || Date.now()).toISOString().split("T")[0],
            screeningStatus: "Screened" as AIScreeningStatus,
            applicationHistory: [],
          }))
          this.saveCandidates(mapped)
          return mapped
        }
      } catch (err) {
        console.warn("[RecruiterCandidateService] Live fetch failed, falling back to local:", err)
      }
    }
    return this.getCandidates()
  },

  /**
   * Retrieves all candidates available to the recruiter (cached / mock).
   * Loads from localStorage when available, or seeds with default mock records in mock mode.
   */
  getCandidates(): RecruiterCandidate[] {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(RECRUITER_CANDIDATES_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error("Failed to parse stored recruiter candidates", e)
        }
      }
      if (!env.useMock) {
        return []
      }
      // Seed initial mock candidates into localStorage in mock mode
      this.saveCandidates(initialRecruiterCandidates)
      return initialRecruiterCandidates
    }
    return env.useMock ? [...initialRecruiterCandidates] : []
  },

  /**
   * Persists candidate records to localStorage and dispatches a change event.
   */
  saveCandidates(candidates: RecruiterCandidate[]): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(RECRUITER_CANDIDATES_KEY, JSON.stringify(candidates))
      window.dispatchEvent(new Event("hiresmart_recruiter_candidates_updated"))
    }
  },

  /**
   * Retrieves a single candidate by ID.
   */
  getCandidateById(id: string): RecruiterCandidate | undefined {
    if (!id) return undefined
    const list = this.getCandidates()
    return list.find(c => c.id === id)
  },

  /**
   * Updates fields on an existing candidate.
   */
  updateCandidate(id: string, updates: Partial<RecruiterCandidate>): RecruiterCandidate | undefined {
    const list = this.getCandidates()
    const index = list.findIndex(c => c.id === id)
    if (index === -1) return undefined

    const updated = { ...list[index], ...updates }
    list[index] = updated
    this.saveCandidates(list)
    return updated
  },

  /**
   * Updates a candidate's application status.
   */
  updateCandidateStatus(id: string, status: AppStatus): RecruiterCandidate | null {
    const updated = this.updateCandidate(id, { status })
    return updated || null
  },
}
