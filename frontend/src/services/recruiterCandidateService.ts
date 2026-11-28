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

const applicationStatuses: Record<string, AppStatus> = {
  applied: "Applied", screened: "Screening", shortlisted: "Shortlisted",
  interview: "Interview", rejected: "Rejected", hired: "Hired", withdrawn: "Withdrawn",
}

export const recruiterCandidateService = {
  async setApplicationStatus(candidate: RecruiterCandidate, status: "Shortlisted" | "Rejected") {
    if (!env.useMock) {
      if (!candidate.applicationId) throw new Error("This candidate has no application for this job.")
      await httpClient.patch(`/applications/${candidate.applicationId}/status`, { status: status.toLowerCase() })
    }
    return {
      ...candidate,
      status,
      applicationHistory: candidate.applicationHistory.map(item =>
        item.id && item.id === candidate.applicationId ? { ...item, status } : item),
    }
  },

  /**
   * Retrieves all candidates available to the recruiter.
   * In live mode, attempts to fetch from backend; otherwise uses localStorage or mock.
   */
  async fetchLiveCandidates(params?: { search?: string; skills?: string; experience?: string; candidateId?: string }): Promise<RecruiterCandidate[]> {
    if (!env.useMock) {
      try {
        const queryParams = new URLSearchParams()
        if (params?.search) queryParams.set("search", params.search)
        if (params?.skills) queryParams.set("skills", params.skills)
        if (params?.experience) queryParams.set("experience", params.experience)
        if (params?.candidateId) queryParams.set("candidateId", params.candidateId)
        const qs = queryParams.toString() ? `?${queryParams.toString()}` : ""
        const res = await httpClient.get<{ success: boolean; data: any[] }>(`/recruiter/candidates${qs}`)
        if (res?.data && Array.isArray(res.data)) {
          const mapped: RecruiterCandidate[] = res.data.map((c: any) => ({
            id: c._id || c.id,
            applicationId: c.applicationId,
            name: c.name || c.fullName || (c.userId?.firstName ? `${c.userId.firstName} ${c.userId.lastName}` : "Candidate"),
            title: c.headline || "Software Engineer",
            email: c.email || c.userId?.email || "",
            location: c.location || "Remote",
            experience: c.totalExperienceYears > 0 ? `${c.totalExperienceYears} yrs` : "Experience not specified",
            summary: c.summary,
            workHistory: c.workHistory,
            projectText: Array.isArray(c.projects) ? c.projects.filter((project: unknown) => typeof project === "string") : [],
            resume: c.resume,
            skills: Array.isArray(c.skills)
              ? c.skills.map((s: any) => ({
                  name: typeof s === "string" ? s : s.name,
                  proficiency: "Strong" as const,
                }))
              : [],
            education: Array.isArray(c.education)
              ? c.education.map((e: any) => ({
                  degree: e.degree || "",
                  institution: e.institution || "",
                  year: e.year || e.duration || "",
                }))
              : [],
            projects: Array.isArray(c.projects)
              ? c.projects.filter((project: unknown) => project && typeof project === "object").map((p: any) => ({
                  title: p.title || p.name || "Project",
                  technologies: p.technologies || p.techStack || [],
                  description: Array.isArray(p.description) ? p.description.join(" ") : p.description || "",
                }))
              : [],
            hasMatchScore: typeof c.screeningScore === "number",
            matchScore: c.screeningScore ?? 85,
            status: applicationStatuses[c.applicationStatus] ?? "Applied",
            appliedRole: c.jobTitle || c.headline || "Applicant",
            appliedDate: new Date(c.appliedAt || Date.now()).toISOString().split("T")[0],
            screeningStatus: "Screened" as AIScreeningStatus,
            applicationHistory: (c.applicationHistory ?? []).map((item: { id: string; role: string; date: string; status: string }) => ({
              ...item,
              date: new Date(item.date).toLocaleDateString(),
              status: applicationStatuses[item.status] ?? "Applied",
            })),
          }))
          if (!params?.candidateId) this.saveCandidates(mapped)
          return mapped
        }
      } catch (err) {
        if (params?.candidateId) throw err
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
