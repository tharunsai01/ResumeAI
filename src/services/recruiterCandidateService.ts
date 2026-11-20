/**
 * HireSmart AI - Recruiter Candidate Service
 * Manages recruiter-facing candidate lists, candidate profile lookups, and status updates.
 */

import { initialRecruiterCandidates } from "../data/recruiterMockData"
import type { RecruiterCandidate, AppStatus, AIScreeningStatus } from "../types/recruiter"

export type { RecruiterCandidate, AppStatus, AIScreeningStatus }

const RECRUITER_CANDIDATES_KEY = "hiresmart_recruiter_candidates"

export const recruiterCandidateService = {
  /**
   * Retrieves all candidates available to the recruiter.
   * Loads from localStorage when available, or seeds with default mock records.
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
      // Seed initial mock candidates into localStorage
      this.saveCandidates(initialRecruiterCandidates)
    }
    return [...initialRecruiterCandidates]
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
