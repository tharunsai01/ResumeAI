/**
 * HireSmart AI - Resume Service
 * Manages candidate resume analysis, upload simulations, and AI scoring data.
 */

import { env } from "../config/env"
import { httpClient } from "./api/httpClient"
import { authService } from "./authService"
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
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      return {
        ...mockResumeAnalysis,
        personalInfo: {
          ...mockResumeAnalysis.personalInfo,
          name: currentUser.name || mockResumeAnalysis.personalInfo.name,
          email: currentUser.email || mockResumeAnalysis.personalInfo.email,
        },
      }
    }
    return mockResumeAnalysis
  },

  /**
   * Asynchronously fetches resume analysis results by ID.
   */
  async getResumeAnalysis(analysisId?: string): Promise<ResumeAnalysisResult> {
    if (!env.useMock) {
      const currentUser = authService.getCurrentUser()
      const { data } = await httpClient.get<{
        success: boolean
        data: {
          analysisStatus: string
          aiAnalysis?: {
            provider?: string
            qualityScore: number
            breakdown: ResumeAnalysisResult["breakdown"]
            skills: ResumeAnalysisResult["skills"]
            strengths: string[]
            suggestions: string[]
            summary: string
            experience?: ResumeAnalysisResult["experience"]
            education?: Partial<ResumeAnalysisResult["education"][number]>[]
            projects?: ResumeAnalysisResult["projects"]
          }
          parsedData?: {
            totalExperienceYears?: number
            experience?: ResumeAnalysisResult["experience"]
            education?: Partial<ResumeAnalysisResult["education"][number]>[]
            projects?: ResumeAnalysisResult["projects"]
          }
        }
      }>(`/resumes/${analysisId ? encodeURIComponent(analysisId) : "active"}`)
      const { aiAnalysis: ai, parsedData } = data
      if (data.analysisStatus !== "completed" || !ai) {
        throw new Error("This resume hasn't been analyzed yet.")
      }
      // Prefer AI-extracted sections over deterministic parser (which often returns empty arrays)
      const aiExp = ai.experience ?? []
      const aiEdu = ai.education ?? []
      const aiProj = ai.projects ?? []
      const experience = aiExp.length > 0 ? aiExp : (parsedData?.experience ?? [])
      const rawEducation = aiEdu.length > 0 ? aiEdu : (parsedData?.education ?? [])
      const education = rawEducation.map(item => ({
        degree: item.degree ?? "",
        institution: item.institution ?? "",
        duration: item.duration ?? "",
      }))
      const projects = aiProj.length > 0
        ? aiProj.map(p => ({ name: p.name ?? "", techStack: (p as any).techStack ?? [], description: (p as any).description ?? "" }))
        : (parsedData?.projects ?? [])
      return {
        provider: ai.provider,
        score: ai.qualityScore,
        breakdown: ai.breakdown,
        personalInfo: {
          name: currentUser?.name ?? "",
          email: currentUser?.email ?? "",
          experience: parsedData?.totalExperienceYears ? `${parsedData.totalExperienceYears} years` : "—",
          education: education[0]?.degree || "—",
          location: "—",
        },
        skills: ai.skills,
        experience,
        education,
        projects,
        insights: {
          strengths: ai.strengths,
          improvements: ai.suggestions,
          summary: ai.summary,
        },
      }
    }
    await delay(800)
    return mockResumeAnalysis
  },

  /**
   * Simulates uploading a resume file.
   */
  async uploadResume(file: File): Promise<{ success: boolean; fileId: string }> {
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

    if (!env.useMock) {
      const formData = new FormData()
      formData.append("file", file)
      const res = await httpClient.post<{ success: boolean; data: { _id: string } }>("/resumes", formData)
      return { success: true, fileId: res.data._id }
    }

    await delay(1000)
    return { success: true, fileId: "doc_" + Math.random().toString(36).substring(7) }
  },

  /**
   * Simulates AI analysis processing for an uploaded resume.
   */
  async analyzeResume(fileId: string): Promise<{ success: boolean; analysisId: string }> {
    if (!env.useMock) {
      await httpClient.post<{ success: boolean; data: any }>(`/ai/resume/analyze/${fileId}`, undefined, { timeoutMs: 50000 })
      return { success: true, analysisId: fileId }
    }
    await delay(4000)
    return { success: true, analysisId: "analysis_" + fileId }
  },
}
