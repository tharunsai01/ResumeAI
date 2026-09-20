import React, { createContext, useContext, useState } from "react"
import { Outlet } from "react-router-dom"
import { mockAiEvaluationData } from "../data/mockAdminAiEvaluation"
import type { EvaluationRecord } from "../data/mockAdminAiEvaluation"

type AiEvaluationData = typeof mockAiEvaluationData

interface AdminAiEvaluationContextType {
  evaluationData: AiEvaluationData
  runEvaluation: () => void
}

const AdminAiEvaluationContext = createContext<AdminAiEvaluationContextType | undefined>(undefined)

export const AdminAiEvaluationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [evaluationData, setEvaluationData] = useState<AiEvaluationData>(mockAiEvaluationData)

  const runEvaluation = () => {
    // Generate a mock evaluation record
    const newEval: EvaluationRecord = {
      id: `EVAL-00${evaluationData.evaluationHistory.length + 1 + 5}`, // just generating a sequence id
      modelVersion: "demo-model-v1",
      dataset: "Demo Evaluation Set",
      components: "Skill + Fairness + Stability + Security",
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: "Completed",
      metrics: {
        skillExtraction: "92.8%",
        scoreStability: "97.1%",
        fairness: "Maximum Difference 2.0",
        security: "4 Prompt Injection Warnings"
      }
    }

    setEvaluationData(prev => ({
      ...prev,
      summary: {
        ...prev.summary,
        lastEvaluation: "Just now"
      },
      modelInfo: {
        ...prev.modelInfo,
        lastEvaluation: newEval.date
      },
      evaluationHistory: [newEval, ...prev.evaluationHistory]
    }))
  }

  return (
    <AdminAiEvaluationContext.Provider value={{ evaluationData, runEvaluation }}>
      {children}
    </AdminAiEvaluationContext.Provider>
  )
}

export const useAdminAiEvaluation = () => {
  const context = useContext(AdminAiEvaluationContext)
  if (context === undefined) {
    throw new Error("useAdminAiEvaluation must be used within an AdminAiEvaluationProvider")
  }
  return context
}

export const AdminAiEvaluationOutlet = () => {
  return (
    <AdminAiEvaluationProvider>
      <Outlet />
    </AdminAiEvaluationProvider>
  )
}
