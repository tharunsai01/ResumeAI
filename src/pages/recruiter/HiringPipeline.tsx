import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, CheckCircle2, Users, Check, X, ChevronRight, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Button } from "../../components/ui/Button"
import { Modal } from "../../components/ui/Modal"
import { staggerContainer, slideUp } from "../../lib/animations"
import { initialPipelineCandidates } from "../../data/pipelineMockData"
import type { PipelineCandidate, PipelineStage } from "../../data/pipelineMockData"
import { CandidateMatchScore } from "./components/CandidateMatchScore"
import { cn } from "../../lib/utils"
import SpotlightCard from "../../components/ui/SpotlightCard";

const COLUMNS: { id: PipelineStage; label: string; color: string; bg: string }[] = [
  { id: "Shortlisted", label: "Shortlisted", color: "text-brand-navy", bg: "bg-brand-gray/20 border-brand-gray/30" },
  { id: "Interview Scheduled", label: "Interview Scheduled", color: "text-brand-indigo", bg: "bg-brand-indigo/10 border-brand-indigo/20" },
  { id: "Interview Completed", label: "Interview Completed", color: "text-brand-blue", bg: "bg-brand-blue/10 border-brand-blue/20" },
  { id: "Decision Pending", label: "Decision Pending", color: "text-semantic-warning", bg: "bg-semantic-warning/10 border-semantic-warning/20" },
  { id: "Hired", label: "Hired", color: "text-semantic-success", bg: "bg-semantic-success/10 border-semantic-success/20" },
  { id: "Rejected", label: "Rejected", color: "text-semantic-error", bg: "bg-semantic-error/10 border-semantic-error/20" }
]

export default function RecruiterHiringPipeline() {
  const navigate = useNavigate()
  const [candidates, setCandidates] = React.useState<PipelineCandidate[]>(initialPipelineCandidates)
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const [hireModalOpen, setHireModalOpen] = React.useState(false)
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false)
  const [activeCandidate, setActiveCandidate] = React.useState<PipelineCandidate | null>(null)
  const [toastMsg, setToastMsg] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleHire = () => {
    if (activeCandidate) {
      setCandidates(candidates.map(c => c.id === activeCandidate.id ? { ...c, stage: "Hired" } : c))
      setHireModalOpen(false)
      setActiveCandidate(null)
      showToast("Candidate marked as hired.")
    }
  }

  const handleReject = () => {
    if (activeCandidate) {
      setCandidates(candidates.map(c => c.id === activeCandidate.id ? { ...c, stage: "Rejected" } : c))
      setRejectModalOpen(false)
      setActiveCandidate(null)
      showToast("Candidate marked as rejected.")
    }
  }

  const handleFurtherReview = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Mock action: just shows a toast and keeps in decision pending
    showToast("Flagged for further review.")
  }

  const filteredCandidates = React.useMemo(() => {
    return candidates.filter(cand => {
      const searchLower = searchTerm.toLowerCase()
      return cand.name.toLowerCase().includes(searchLower) || cand.role.toLowerCase().includes(searchLower)
    })
  }, [candidates, searchTerm])

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-[1600px] mx-auto h-[calc(100vh-80px)] flex flex-col relative">
        
        {/* TOAST */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg border border-emerald-200 flex items-center gap-2 shadow-lg"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-display font-semibold text-brand-navy">Hiring Pipeline</h1>
            <p className="text-brand-navy/60 mt-1">Track candidates from shortlist through final hiring decisions.</p>
          </div>
          <SpotlightCard className="glass-card flex items-center px-4 focus-within: focus-within:ring-2 focus-within:ring-brand-indigo/10 transition-all w-full sm:w-72 shrink-0">
            <Search className="w-5 h-5 text-brand-navy/40 mr-3" />
            <input
              type="text"
              placeholder="Search pipeline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-brand-navy placeholder:text-brand-navy/40 h-11 text-sm"
            />
          </SpotlightCard>
        </motion.div>

        {/* KANBAN BOARD */}
        <motion.div variants={slideUp} className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          <div className="flex gap-4 h-full min-w-max pb-2">
            {COLUMNS.map(column => {
              const columnCandidates = filteredCandidates.filter(c => c.stage === column.id)
              
              return (
                <div key={column.id} className="w-[320px] flex flex-col bg-brand-gray/5 rounded-2xl border border-brand-gray/20 shrink-0 h-full">
                  {/* Column Header */}
                  <div className={cn("p-4 border-b rounded-t-2xl flex items-center justify-between", column.bg)}>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-bold uppercase tracking-wider", column.color)}>{column.label}</span>
                      <span className="bg-white/60 text-brand-navy/80 text-xs font-bold px-2 py-0.5 rounded-full">{columnCandidates.length}</span>
                    </div>
                  </div>
                  
                  {/* Column Content Area (Scrollable vertically) */}
                  <div className="p-3 flex-1 overflow-y-auto space-y-3 no-scrollbar">
                    {columnCandidates.map(cand => (
                      <SpotlightCard 
                        key={cand.id} 
                        className="glass-card p-4 shadow-sm hover: hover: transition-all cursor-pointer group flex flex-col"
                        onClick={() => navigate(`/recruiter/candidates/${cand.id}`)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigo font-bold border border-brand-indigo/20 shrink-0 text-sm">
                              {cand.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-brand-navy text-sm group-hover:text-brand-indigo transition-colors line-clamp-1">{cand.name}</div>
                              <div className="text-[11px] text-brand-navy/60 line-clamp-1">{cand.role}</div>
                            </div>
                          </div>
                          <CandidateMatchScore score={cand.overallMatch} size="sm" showLabel={false} />
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          {cand.stage === "Interview Completed" || cand.stage === "Decision Pending" ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-[10px] uppercase tracking-wider text-brand-indigo px-2 hover:bg-brand-indigo/10"
                              onClick={(e) => { e.stopPropagation(); navigate(cand.interviewId ? `/recruiter/interviews/${cand.interviewId}` : `/recruiter/interviews`); }}
                            >
                              <FileText className="w-3.5 h-3.5 mr-1" /> View Feedback
                            </Button>
                          ) : (
                            <div className="text-[10px] font-semibold text-brand-navy/40 uppercase tracking-wider">
                              {cand.experience}
                            </div>
                          )}
                          <ChevronRight className="w-4 h-4 text-brand-navy/20 group-hover:text-brand-indigo/60 transition-colors" />
                        </div>

                        {/* Actions for Decision Pending */}
                        {cand.stage === "Decision Pending" && (
                          <div className="mt-3 pt-3 border-t border-brand-gray/20 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                className="flex-1 h-8 bg-semantic-success hover:bg-semantic-success/90 text-white text-xs"
                                onClick={(e) => { e.stopPropagation(); setActiveCandidate(cand); setHireModalOpen(true); }}
                              >
                                <Check className="w-3.5 h-3.5 mr-1" /> Hire
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 h-8 text-semantic-error border-semantic-error/30 hover:bg-semantic-error/10 text-xs"
                                onClick={(e) => { e.stopPropagation(); setActiveCandidate(cand); setRejectModalOpen(true); }}
                              >
                                <X className="w-3.5 h-3.5 mr-1" /> Reject
                              </Button>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full h-8 text-brand-navy/60 hover:text-brand-navy hover:bg-brand-gray/20 text-[10px] uppercase tracking-wider"
                              onClick={(e) => handleFurtherReview(e)}
                            >
                              Further Review
                            </Button>
                          </div>
                        )}
                      </SpotlightCard>
                    ))}
                    
                    {columnCandidates.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center py-12 px-4 text-center">
                        <Users className="w-8 h-8 text-brand-navy/10 mb-2" />
                        <p className="text-xs font-medium text-brand-navy/40 uppercase tracking-wider">No Candidates</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* HIRING DECISION MODAL */}
      <Modal isOpen={hireModalOpen} onClose={() => { setHireModalOpen(false); setActiveCandidate(null); }} title="Confirm Hiring Decision" className="max-w-md">
          {activeCandidate && (
            <div className="py-4 space-y-4">
              <div className="bg-brand-light/50 p-4 rounded-xl border border-brand-gray/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-brand-navy/60 uppercase tracking-wider mb-0.5">Candidate</div>
                  <div className="font-semibold text-brand-navy">{activeCandidate.name}</div>
                  <div className="text-sm text-brand-navy/70">{activeCandidate.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-brand-navy/60 uppercase tracking-wider mb-0.5">AI Match</div>
                  <div className="font-bold text-brand-indigo text-xl">{activeCandidate.overallMatch}%</div>
                </div>
              </div>
              <p className="text-sm text-brand-navy/80">
                Are you sure you want to hire this candidate? This will move them to the "Hired" stage.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setHireModalOpen(false)} className="border-brand-gray/40 text-brand-navy">Cancel</Button>
            <Button onClick={handleHire} className="bg-semantic-success hover:bg-semantic-success/90 text-white">Confirm Hire</Button>
          </div>
      </Modal>

      {/* REJECTION MODAL */}
      <Modal isOpen={rejectModalOpen} onClose={() => { setRejectModalOpen(false); setActiveCandidate(null); }} title="Reject Candidate?" className="max-w-md">
          {activeCandidate && (
            <div className="py-4 space-y-4">
              <div className="bg-brand-light/50 p-4 rounded-xl border border-brand-gray/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-brand-navy/60 uppercase tracking-wider mb-0.5">Candidate</div>
                  <div className="font-semibold text-brand-navy">{activeCandidate.name}</div>
                  <div className="text-sm text-brand-navy/70">{activeCandidate.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-brand-navy/60 uppercase tracking-wider mb-0.5">AI Match</div>
                  <div className="font-bold text-brand-indigo text-xl">{activeCandidate.overallMatch}%</div>
                </div>
              </div>
              <p className="text-sm text-brand-navy/80">
                Are you sure you want to reject this candidate? This action will move them to the "Rejected" stage.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)} className="border-brand-gray/40 text-brand-navy">Cancel</Button>
            <Button onClick={handleReject} className="bg-semantic-error hover:bg-semantic-error/90 text-white">Reject Candidate</Button>
          </div>
      </Modal>

    </DashboardShell>
  )
}
