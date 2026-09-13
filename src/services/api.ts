import { mockResumeAnalysis } from "../data/mockResume"
import type { ResumeAnalysisResult } from "../data/mockResume"

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const api = {
  uploadResume: async (file: File): Promise<{ success: boolean; fileId: string }> => {
    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      throw new Error("Invalid file format. Please upload a PDF or DOCX file.")
    }
    
    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Maximum file size is 10 MB.")
    }

    await delay(1000)
    return { success: true, fileId: "doc_" + Math.random().toString(36).substring(7) }
  },

  analyzeResume: async (fileId: string): Promise<{ success: boolean; analysisId: string }> => {
    // Simulate complex AI processing (4 seconds)
    await delay(4000)
    return { success: true, analysisId: "analysis_" + fileId }
  },

  getResumeAnalysis: async (_analysisId: string): Promise<ResumeAnalysisResult> => {
    await delay(800)
    return mockResumeAnalysis
  }
}
