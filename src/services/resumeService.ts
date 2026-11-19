/**
 * HireSmart AI - Resume Service
 * Manages candidate resume analysis, upload simulations, and AI scoring data.
 */

import { env } from "../config/env"
import { mockResumeAnalysis } from "../data/mockResume"
import type { ResumeAnalysisResult } from "../types/resume"

export type { ResumeAnalysisResult }

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const resumeService = {
  /**
   * Retrieves the currently active candidate resume analysis data.
   * Synchronous accessor for fast UI rendering.
   */
  getActiveResumeAnalysis(): ResumeAnalysisResult {
    // In live mode, this will return cached or context-stored resume data
    return mockResumeAnalysis
  },

  /**
   * Asynchronously fetches resume analysis results by ID.
   */
  async getResumeAnalysis(_analysisId?: string): Promise<ResumeAnalysisResult> {
    if (!env.useMock) {
      throw new Error("Live API mode is not yet configured for resumeService.")
    }
    await delay(800)
    return mockResumeAnalysis
  },

  /**
   * Simulates uploading a resume file.
   */
  async uploadResume(file: File): Promise<{ success: boolean; fileId: string }> {
    if (!env.useMock) {
      throw new Error("Live API mode is not yet configured for resumeService.")
    }
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!validTypes.includes(file.type)) {
      throw new Error("Invalid file format. Please upload a PDF or DOCX file.")
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Maximum file size is 10 MB.")
    }
    await delay(1000)
    return { success: true, fileId: "doc_" + Math.random().toString(36).substring(7) }
  },

  /**
   * Simulates AI analysis processing for an uploaded resume.
   */
  async analyzeResume(fileId: string): Promise<{ success: boolean; analysisId: string }> {
    if (!env.useMock) {
      throw new Error("Live API mode is not yet configured for resumeService.")
    }
    await delay(4000)
    return { success: true, analysisId: "analysis_" + fileId }
  },
}
