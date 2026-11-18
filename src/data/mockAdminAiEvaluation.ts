export interface FairnessPair {
  id: string
  scoreA: number
  scoreB: number
  difference: number
  status: string
}

export interface EvaluationRecord {
  id: string
  modelVersion: string
  dataset: string
  components: string
  date: string
  status: string
  metrics: {
    skillExtraction?: string
    scoreStability?: string
    fairness?: string
    security?: string
  }
}

export const mockAiEvaluationData = {
  summary: {
    skillExtractionAccuracy: "92.4%",
    scoreStability: "96.8%",
    fairnessTest: "Review Available",
    promptInjectionChecks: 3842,
    lastEvaluation: "2 days ago"
  },
  modelInfo: {
    modelVersion: "demo-model-v1",
    evaluationDataset: "Demo Evaluation Set",
    lastEvaluation: "21 Sep 2026",
    status: "Available",
    components: ["Skill Extraction", "Candidate Scoring", "Fairness", "Security"]
  },
  skillExtraction: {
    accuracy: "92.4%",
    correctSkills: 924,
    missedSkills: 58,
    incorrectSkills: 18,
    evaluationSamples: 1000
  },
  scoreStability: {
    evaluationSamples: 500,
    stableResults: 484,
    changedResults: 16,
    stability: "96.8%"
  },
  fairness: {
    testCases: 100,
    comparablePairs: 100,
    scoreDifferencesDetected: 4,
    maximumDifference: 2.1,
    status: "Review Available",
    comparisonPairs: [
      { id: "PAIR-001", scoreA: 82.4, scoreB: 81.9, difference: 0.5, status: "Within Demo Threshold" },
      { id: "PAIR-002", scoreA: 76.2, scoreB: 78.3, difference: 2.1, status: "Review" },
      { id: "PAIR-003", scoreA: 89.1, scoreB: 89.1, difference: 0.0, status: "Within Demo Threshold" },
      { id: "PAIR-004", scoreA: 91.5, scoreB: 90.0, difference: 1.5, status: "Review" },
      { id: "PAIR-005", scoreA: 65.4, scoreB: 65.6, difference: 0.2, status: "Within Demo Threshold" }
    ] as FairnessPair[]
  },
  blindScreening: {
    status: "Configured",
    identityFieldsHidden: ["Name", "Gender", "Photo"],
    testCoverage: "100 evaluation cases"
  },
  security: {
    resumesProcessed: 3842,
    securityChecks: 3842,
    potentialInstructionContent: 18,
    promptInjectionWarnings: 6,
    status: "Monitoring Active",
    clean: 3818
  },
  evaluationHistory: [
    {
      id: "EVAL-008",
      modelVersion: "demo-model-v1",
      dataset: "Evaluation Set A",
      components: "Skill + Fairness + Stability",
      date: "21 Sep 2026",
      status: "Completed",
      metrics: {
        skillExtraction: "92.4%",
        scoreStability: "96.8%",
        fairness: "Maximum Difference 2.1",
        security: "6 Prompt Injection Warnings"
      }
    },
    {
      id: "EVAL-007",
      modelVersion: "demo-model-v1",
      dataset: "Evaluation Set A",
      components: "Skill + Security",
      date: "18 Sep 2026",
      status: "Completed",
      metrics: {
        skillExtraction: "91.8%",
        security: "2 Prompt Injection Warnings"
      }
    },
    {
      id: "EVAL-006",
      modelVersion: "demo-model-v1",
      dataset: "Evaluation Set B",
      components: "Fairness + Stability",
      date: "10 Sep 2026",
      status: "Completed",
      metrics: {
        scoreStability: "95.5%",
        fairness: "Maximum Difference 1.8"
      }
    }
  ] as EvaluationRecord[],
  findings: [
    { text: "Skill extraction evaluation completed.", type: "success" },
    { text: "Score stability evaluation completed.", type: "success" },
    { text: "Fairness comparison contains cases requiring review.", type: "warning" },
    { text: "Blind screening configuration available.", type: "success" },
    { text: "Prompt injection warnings detected in the evaluation dataset.", type: "warning" }
  ],
  reviewFlags: [
    { message: "4 fairness comparison cases require review.", type: "Fairness" },
    { message: "6 prompt-injection warnings detected.", type: "Security" }
  ]
}
