import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { AdminStatCard } from "../../components/admin/AdminStatCard"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { 
  Play, Info, AlertTriangle, ShieldAlert, Target, Scale, EyeOff, 
  Activity, CheckCircle2, History, FileText, ArrowRight, BrainCircuit
} from "lucide-react"
import { useAdminAiEvaluation } from "../../contexts/AdminAiEvaluationContext"
import { AdminEvaluationDetailsModal } from "./components/ai-evaluation/AdminEvaluationDetailsModal"
import { Modal } from "../../components/ui/Modal"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"
import type { EvaluationRecord } from "../../data/mockAdminAiEvaluation"

export default function AdminAiEvaluation() {
  const { evaluationData, runEvaluation } = useAdminAiEvaluation()

  // State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [viewingRecord, setViewingRecord] = useState<EvaluationRecord | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const handleRunEvaluation = () => {
    setIsConfirmModalOpen(false)
    runEvaluation()
    showToast("AI evaluation completed.")
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleViewRecord = (record: EvaluationRecord) => {
    setViewingRecord(record)
    setDetailsModalOpen(true)
  }

  return (
    <AdminShell>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12">
        
        {/* TOAST */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg border border-emerald-200 flex items-center gap-2 shadow-lg z-[100]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <AdminPageHeader 
          title="AI Evaluation & Fairness" 
          description="Monitor AI quality, stability, security, and fairness across HireSmart AI."
          statusIndicator={{ label: "Evaluation Monitoring Active", isHealthy: true }}
          action={
            <Button onClick={() => setIsConfirmModalOpen(true)} className="bg-brand-indigo hover:bg-brand-blue text-white shadow-sm">
              <Play className="w-4 h-4 mr-2" /> Run Evaluation
            </Button>
          }
        />

        {/* DISCLAIMER BANNER */}
        <motion.div variants={slideUp} className="bg-brand-indigo/5 border border-brand-indigo/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-indigo shrink-0 mt-0.5" />
          <p className="text-sm text-brand-navy/80">
            <strong>Important:</strong> Evaluation results shown here are based on configured evaluation datasets and demo measurements. They are intended for monitoring and review, not as proof that the AI system is bias-free.
          </p>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminStatCard title="Skill Extraction Accuracy" value={evaluationData.summary.skillExtractionAccuracy} icon={Target} color={{ bg: "bg-emerald-500/10", text: "text-emerald-500" }} />
          <AdminStatCard title="Score Stability" value={evaluationData.summary.scoreStability} icon={Activity} color={{ bg: "bg-brand-blue/10", text: "text-brand-blue" }} />
          <AdminStatCard title="Fairness Test" value={evaluationData.summary.fairnessTest} icon={Scale} color={{ bg: "bg-semantic-warning/10", text: "text-semantic-warning" }} />
          <AdminStatCard title="Prompt Injection Checks" value={evaluationData.summary.promptInjectionChecks} icon={ShieldAlert} color={{ bg: "bg-semantic-error/10", text: "text-semantic-error" }} />
          <AdminStatCard title="Last Evaluation" value={evaluationData.summary.lastEvaluation} icon={History} color={{ bg: "bg-brand-gray/20", text: "text-brand-navy/60" }} />
        </div>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* MAIN CONTENT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* FAIRNESS EVALUATION */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-brand-indigo" />
                    Fairness Evaluation
                  </CardTitle>
                  <p className="text-sm text-brand-navy/60 mt-1">The evaluation compares AI results for equivalent resumes while controlled identity-related details are changed.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-brand-light/30 p-4 rounded-xl border border-brand-gray/20">
                    <div>
                      <p className="text-xs text-brand-navy/50 uppercase font-semibold mb-1">Test Cases</p>
                      <p className="text-xl font-display font-bold text-brand-navy">{evaluationData.fairness.testCases}</p>
                    </div>
                    <div>
                      <p className="text-xs text-brand-navy/50 uppercase font-semibold mb-1">Pairs</p>
                      <p className="text-xl font-display font-bold text-brand-navy">{evaluationData.fairness.comparablePairs}</p>
                    </div>
                    <div>
                      <p className="text-xs text-brand-navy/50 uppercase font-semibold mb-1">Diffs Detected</p>
                      <p className="text-xl font-display font-bold text-brand-navy">{evaluationData.fairness.scoreDifferencesDetected}</p>
                    </div>
                    <div>
                      <p className="text-xs text-brand-navy/50 uppercase font-semibold mb-1">Max Diff</p>
                      <p className="text-xl font-display font-bold text-semantic-warning">{evaluationData.fairness.maximumDifference} pts</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-brand-navy uppercase tracking-wider">Evaluation Pair Comparison</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-brand-navy/60">Status:</span>
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border inline-flex items-center justify-center bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20">Review Available</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-brand-gray/20">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-brand-light text-brand-navy/60 uppercase text-[10px] tracking-wider font-semibold border-b border-brand-gray/20">
                          <tr>
                            <th className="px-4 py-3">Test Pair</th>
                            <th className="px-4 py-3">Score A</th>
                            <th className="px-4 py-3">Score B</th>
                            <th className="px-4 py-3">Difference</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-gray/10 bg-white">
                          {evaluationData.fairness.comparisonPairs.map((pair) => (
                            <tr key={pair.id} className="hover:bg-brand-light/20">
                              <td className="px-4 py-3 font-medium text-brand-navy">{pair.id}</td>
                              <td className="px-4 py-3 text-brand-navy/80">{pair.scoreA.toFixed(1)}</td>
                              <td className="px-4 py-3 text-brand-navy/80">{pair.scoreB.toFixed(1)}</td>
                              <td className="px-4 py-3">
                                <span className={cn("font-medium", pair.difference > 1.0 ? "text-semantic-warning" : "text-brand-navy/60")}>
                                  {pair.difference.toFixed(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {pair.status === "Review" ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-semantic-warning bg-semantic-warning/10 px-2 py-0.5 rounded border border-semantic-warning/20">
                                    <AlertTriangle className="w-3 h-3" /> Review
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-navy/50 bg-brand-light px-2 py-0.5 rounded border border-brand-gray/20">
                                    Within Demo Threshold
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* SKILL EXTRACTION EVALUATION */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-indigo" />
                    Skill Extraction Evaluation
                  </CardTitle>
                  <p className="text-sm text-brand-navy/60 mt-1">Measures agreement between expected skills and extracted skills in the evaluation dataset.</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                    <div className="w-32 h-32 rounded-full border-[12px] border-brand-indigo/10 flex flex-col items-center justify-center shrink-0 relative">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="12" className="text-brand-indigo/10" />
                        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="12" strokeDasharray="276" strokeDashoffset={276 - (276 * 92.4) / 100} className="text-brand-indigo transition-all duration-1000" />
                      </svg>
                      <span className="text-2xl font-display font-bold text-brand-navy relative z-10">{evaluationData.skillExtraction.accuracy}</span>
                      <span className="text-[10px] uppercase font-semibold text-brand-navy/50 relative z-10">Accuracy</span>
                    </div>
                    
                    <div className="flex-1 w-full grid grid-cols-2 gap-4">
                      <div className="bg-brand-light/30 p-3 rounded-lg border border-brand-gray/20">
                        <div className="text-xs text-brand-navy/50 font-medium mb-1">Correct Skills</div>
                        <div className="text-lg font-semibold text-emerald-600">{evaluationData.skillExtraction.correctSkills}</div>
                      </div>
                      <div className="bg-brand-light/30 p-3 rounded-lg border border-brand-gray/20">
                        <div className="text-xs text-brand-navy/50 font-medium mb-1">Missed Skills</div>
                        <div className="text-lg font-semibold text-semantic-warning">{evaluationData.skillExtraction.missedSkills}</div>
                      </div>
                      <div className="bg-brand-light/30 p-3 rounded-lg border border-brand-gray/20">
                        <div className="text-xs text-brand-navy/50 font-medium mb-1">Incorrect Skills</div>
                        <div className="text-lg font-semibold text-semantic-error">{evaluationData.skillExtraction.incorrectSkills}</div>
                      </div>
                      <div className="bg-brand-light/30 p-3 rounded-lg border border-brand-gray/20">
                        <div className="text-xs text-brand-navy/50 font-medium mb-1">Samples</div>
                        <div className="text-lg font-semibold text-brand-navy">{evaluationData.skillExtraction.evaluationSamples}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-brand-navy/40 flex items-center gap-1 justify-end">
                    <Info className="w-3.5 h-3.5" /> Demo Evaluation Result
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* EVALUATION HISTORY */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-brand-indigo" />
                    Evaluation History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-brand-navy/50 uppercase bg-brand-light/50 border-b border-brand-gray/30">
                        <tr>
                          <th className="px-4 py-3 font-semibold rounded-tl-lg">ID / Model</th>
                          <th className="px-4 py-3 font-semibold hidden sm:table-cell">Dataset</th>
                          <th className="px-4 py-3 font-semibold hidden md:table-cell">Components</th>
                          <th className="px-4 py-3 font-semibold">Date</th>
                          <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluationData.evaluationHistory.map((record) => (
                          <tr key={record.id} className="border-b border-brand-gray/10 hover:bg-brand-light/30 transition-colors last:border-b-0">
                            <td className="px-4 py-3">
                              <div className="font-medium text-brand-navy">{record.id}</div>
                              <div className="text-[10px] text-brand-navy/50">{record.modelVersion}</div>
                            </td>
                            <td className="px-4 py-3 text-brand-navy/70 hidden sm:table-cell">{record.dataset}</td>
                            <td className="px-4 py-3 text-brand-navy/70 hidden md:table-cell">
                              <div className="max-w-[200px] truncate" title={record.components}>{record.components}</div>
                            </td>
                            <td className="px-4 py-3 text-brand-navy/70">{record.date}</td>
                            <td className="px-4 py-3 text-right">
                              <Button variant="outline" size="sm" onClick={() => handleViewRecord(record)} className="h-8 px-2.5 text-xs text-brand-indigo border-brand-indigo/20 hover:bg-brand-indigo/10">
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* SIDEBAR COLUMN */}
          <div className="space-y-6">
            
            {/* AI MODEL INFORMATION */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-brand-indigo" />
                    AI Model Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-brand-gray/10">
                    <span className="text-sm font-medium text-brand-navy/60">Version</span>
                    <span className="text-sm font-medium text-brand-navy">{evaluationData.modelInfo.modelVersion}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-brand-gray/10">
                    <span className="text-sm font-medium text-brand-navy/60">Dataset</span>
                    <span className="text-sm font-medium text-brand-navy truncate ml-4 text-right">{evaluationData.modelInfo.evaluationDataset}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-brand-gray/10">
                    <span className="text-sm font-medium text-brand-navy/60">Last Run</span>
                    <span className="text-sm font-medium text-brand-navy">{evaluationData.modelInfo.lastEvaluation}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-brand-navy/60">Status</span>
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border inline-flex items-center justify-center bg-semantic-success/10 text-semantic-success border-semantic-success/20">Available</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* SCORE STABILITY */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[16px]">
                    <Activity className="w-4 h-4 text-brand-blue" />
                    Score Stability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between mb-4">
                    <div className="text-3xl font-display font-bold text-brand-navy">{evaluationData.scoreStability.stability}</div>
                    <div className="text-xs text-brand-navy/50 font-medium pb-1 uppercase">Stable</div>
                  </div>
                  <p className="text-xs text-brand-navy/60 mb-4 leading-relaxed">Measures how consistently candidate scores remain stable when equivalent evaluation inputs are processed.</p>
                  
                  <div className="space-y-2 text-sm bg-brand-light/30 p-3 rounded-lg border border-brand-gray/20">
                    <div className="flex justify-between">
                      <span className="text-brand-navy/60">Samples:</span>
                      <span className="font-medium text-brand-navy">{evaluationData.scoreStability.evaluationSamples}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-navy/60">Changed:</span>
                      <span className="font-medium text-brand-navy">{evaluationData.scoreStability.changedResults}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* RESUME AI SECURITY */}
            <motion.div variants={slideUp}>
              <Card className="border-t-4 border-t-semantic-warning">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[16px]">
                    <ShieldAlert className="w-4 h-4 text-semantic-warning" />
                    Resume AI Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-brand-navy/60 mb-4 leading-relaxed">Resume content is treated as untrusted input. Instruction-like content should be isolated before AI processing.</p>
                  
                  <div className="bg-brand-light/30 rounded-xl p-3 border border-brand-gray/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-brand-navy/70">Processed</span>
                      <span className="text-sm font-bold text-brand-navy">{evaluationData.security.resumesProcessed}</span>
                    </div>
                    
                    <div className="w-full bg-brand-gray/10 rounded-full h-2 overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(evaluationData.security.clean / evaluationData.security.resumesProcessed) * 100}%` }}></div>
                      <div className="bg-semantic-warning h-full" style={{ width: `${(evaluationData.security.potentialInstructionContent / evaluationData.security.resumesProcessed) * 100}%` }}></div>
                      <div className="bg-semantic-error h-full" style={{ width: `${(evaluationData.security.promptInjectionWarnings / evaluationData.security.resumesProcessed) * 100}%` }}></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-white p-2 rounded border border-brand-gray/10 flex flex-col">
                        <span className="text-[10px] text-brand-navy/50 font-semibold uppercase">Warnings</span>
                        <span className="text-sm font-bold text-semantic-warning">{evaluationData.security.potentialInstructionContent}</span>
                      </div>
                      <div className="bg-white p-2 rounded border border-brand-gray/10 flex flex-col">
                        <span className="text-[10px] text-brand-navy/50 font-semibold uppercase">Injections</span>
                        <span className="text-sm font-bold text-semantic-error">{evaluationData.security.promptInjectionWarnings}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* BLIND SCREENING */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[16px]">
                    <EyeOff className="w-4 h-4 text-brand-purple" />
                    Blind Screening
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-brand-navy/60 mb-4 leading-relaxed">Designed to reduce potential influence by hiding selected identity-related fields from recruiter-facing screening views.</p>
                  
                  <div className="space-y-2 text-sm bg-brand-light/30 p-3 rounded-lg border border-brand-gray/20">
                    <div className="flex justify-between items-center">
                      <span className="text-brand-navy/60">Status:</span>
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border inline-flex items-center justify-center bg-semantic-success/10 text-semantic-success border-semantic-success/20">Configured</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-brand-navy/60">Fields Hidden:</span>
                      <span className="font-medium text-brand-navy text-xs">{evaluationData.blindScreening.identityFieldsHidden.join(", ")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* FINDINGS & REVIEW */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[16px]">
                    <FileText className="w-4 h-4 text-brand-navy" />
                    Evaluation Findings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {evaluationData.findings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        {finding.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-semantic-warning shrink-0 mt-0.5" />
                        )}
                        <span className={cn(finding.type === 'warning' ? "text-brand-navy font-medium" : "text-brand-navy/70")}>
                          {finding.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {evaluationData.reviewFlags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-brand-gray/20">
                      <h4 className="text-xs font-semibold text-semantic-warning uppercase tracking-wider mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Requires Review
                      </h4>
                      <div className="space-y-2">
                        {evaluationData.reviewFlags.map((flag, idx) => (
                          <div key={idx} className="bg-semantic-warning/5 border border-semantic-warning/20 p-2 rounded-lg flex items-center justify-between text-xs">
                            <span className="font-medium text-brand-navy/80">{flag.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* AUDIT LOG CONNECTION */}
            <motion.div variants={slideUp}>
              <Card className="bg-brand-indigo/5 border-brand-indigo/10">
                <CardContent className="p-4 flex items-center justify-between">
                  <p className="text-xs font-medium text-brand-navy/70 max-w-[180px]">Evaluation activity is recorded in the administrative audit log.</p>
                  <Button variant="outline" onClick={() => window.location.href = '/admin/audit-logs'} className="h-8 px-3 text-xs bg-white border-brand-indigo/20 text-brand-indigo hover:bg-brand-indigo/5 shrink-0">
                    Audit Logs <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* RESPONSIBLE AI INFO */}
            <motion.div variants={slideUp}>
              <Card className="bg-brand-navy text-white">
                <CardHeader className="pb-3 border-b border-white/10">
                  <CardTitle className="text-[16px] text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-white/70" />
                    Responsible AI Principles
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <h5 className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-1">Human-in-the-loop</h5>
                    <p className="text-xs text-white/60 leading-relaxed">Recruiters make final hiring decisions.</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-1">Explainability</h5>
                    <p className="text-xs text-white/60 leading-relaxed">Candidate scores can be broken into evaluation components.</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-1">Security & Fairness</h5>
                    <p className="text-xs text-white/60 leading-relaxed">Inputs are treated as untrusted. Equivalent inputs can be compared to identify score differences.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>

      </motion.div>

      {/* CONFIRMATION MODAL */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Run AI Evaluation?"
      >
        <div className="py-4 space-y-4">
          <p className="text-sm text-brand-navy/70">
            This will start a demo evaluation workflow using the configured evaluation dataset.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRunEvaluation} className="bg-brand-indigo hover:bg-brand-blue text-white">
              Run Evaluation
            </Button>
          </div>
        </div>
      </Modal>

      {/* DETAILS DRAWER/MODAL */}
      <AdminEvaluationDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setViewingRecord(null); }}
        evaluation={viewingRecord}
      />
    </AdminShell>
  )
}
