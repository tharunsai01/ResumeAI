/**
 * HireSmart AI - Legacy API Compatibility Layer
 * Delegates resume operations to the modular resumeService.
 */

import { resumeService } from "./resumeService"
import type { ResumeAnalysisResult } from "./resumeService"

export type { ResumeAnalysisResult }

export const api = {
  uploadResume: (file: File) => resumeService.uploadResume(file),
  analyzeResume: (fileId: string) => resumeService.analyzeResume(fileId),
  getResumeAnalysis: (analysisId?: string) => resumeService.getResumeAnalysis(analysisId),
}
