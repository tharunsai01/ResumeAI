import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, CheckCircle2, Users, Check, X, ChevronRight, FileText, ArrowRight, RotateCcw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Button } from "../../components/ui/Button"
import { Modal } from "../../components/ui/Modal"
import { staggerContainer, slideUp } from "../../lib/animations"
import type { PipelineCandidate, PipelineStage } from "../../data/pipelineMockData"
import { pipelineService } from "../../services/pipelineService"
import { CandidateMatchScore } from "./components/CandidateMatchScore"
import { cn } from "../../lib/utils"
import SpotlightCard from "../../components/ui/SpotlightCard"

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
  const [candidates, setCandidates] = React.useState<PipelineCandidate[]>(() => pipelineService.getCandidates())
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const [hireModalOpen, setHireModalOpen] = React.useState(false)
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false)
  const [activeCandidate, setActiveCandidate] = React.useState<PipelineCandidate | null>(null)
  const [toastMsg, setToastMsg] = React.useState<string | null>(null)

  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleUpdate = () => {
      setCandidates(pipelineService.getCandidates())
    }
    window.addEventListener("hiresmart_pipeline_updated", handleUpdate)
    return () => window.removeEventListener("hiresmart_pipeline_updated", handleUpdate)
  }, [])

  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey) return;
      
      const target = e.target as HTMLElement;
      const scrollableNode = target.closest('.overflow-y-auto');
      
      if (scrollableNode) {
        const nodeEl = scrollableNode as HTMLElement;
        const canScrollDown = nodeEl.scrollHeight > nodeEl.clientHeight && Math.ceil(nodeEl.scrollTop) < nodeEl.scrollHeight - nodeEl.clientHeight;
        const canScrollUp = nodeEl.scrollTop > 0;
        
        if ((e.deltaY > 0 && canScrollDown) || (e.deltaY < 0 && canScrollUp)) {
          return; // Let native vertical scroll happen
        }
      }
      
      // Convert vertical scroll to horizontal and prevent default vertical page scroll
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleHire = () => {
    if (activeCandidate) {
      const updated = pipelineService.updateCandidateStage(activeCandidate.id, "Hired")
      if (updated) {
        setCandidates(pipelineService.getCandidates())
        showToast(`${activeCandidate.name} marked as hired.`)
      }
      setHireModalOpen(false)
      setActiveCandidate(null)
    }
  }

  const handleReject = () => {
    if (activeCandidate) {
      const updated = pipelineService.updateCandidateStage(activeCandidate.id, "Rejected")
      if (updated) {
        setCandidates(pipelineService.getCandidates())
        showToast(`${activeCandidate.name} marked as rejected.`)
      }
      setRejectModalOpen(false)
      setActiveCandidate(null)
    }
  }

  const handleStageSelect = (cand: PipelineCandidate, newStage: PipelineStage) => {
    if (cand.stage === newStage) return

    if (newStage === "Hired") {
      setActiveCandidate(cand)
      setHireModalOpen(true)
      return
    }

    if (newStage === "Rejected") {
      setActiveCandidate(cand)
      setRejectModalOpen(true)
      return
    }

    const updated = pipelineService.updateCandidateStage(cand.id, newStage)
    if (updated) {
      setCandidates(pipelineService.getCandidates())
      showToast(`${cand.name} moved to ${newStage}.`)
    }
  }

  const handleFurtherReview = (e: React.MouseEvent) => {
    e.stopPropagation()
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
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-[1600px] mx-auto h-[calc(100dvh-80px)] min-h-[500px] flex flex-col relative">
        
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
            <h1 className="text-2xl sm:text-3xl font-display font-semibold text-brand-navy break-words">Hiring Pipeline</h1>
            <p className="text-sm sm:text-base text-brand-navy/60 mt-1">Track candidates from shortlist through final hiring decisions.</p>
          </div>
          <SpotlightCard className="glass-card flex items-center px-4 focus-within:ring-2 focus-within:ring-brand-indigo/10 transition-all w-full sm:w-72 shrink-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-brand-navy/40 mr-2.5 sm:mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search pipeline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-brand-navy placeholder:text-brand-navy/40 h-10 sm:h-11 text-xs sm:text-sm"
            />
          </SpotlightCard>
        </motion.div>

        {/* KANBAN BOARD */}
        <motion.div 
          variants={slideUp} 
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar"
        >
          <div className="flex gap-4 h-full min-w-max pb-2">
            {COLUMNS.map(column => {
              const columnCandidates = filteredCandidates.filter(c => c.stage === column.id)
              
              return (
                <div key={column.id} className="w-[280px] sm:w-[320px] flex flex-col bg-brand-gray/5 rounded-2xl border border-brand-gray/20 shrink-0 h-full">
                  {/* Column Header */}
                  <div className={cn("p-4 border-b rounded-t-2xl flex items-center justify-between", column.bg)}>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-bold uppercase tracking-wider", column.color)}>{column.label}</span>
                      <span className="bg-white/60 text-brand-navy/80 text-xs font-bold px-2 py-0.5 rounded-full">{columnCandidates.length}</span>
                    </div>
                  </div>
                  
                  {/* Column Content Area (Scrollable vertically) */}
                  <div className="p-3 flex-1 overflow-y-auto overflow-x-hidden space-y-3 no-scrollbar">
                    {columnCandidates.map(cand => (
                      <SpotlightCard 
                        key={cand.id} 
                        className="glass-card p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
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
                        
                        <div className="mt-2 flex items-center justify-between">
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

                        {/* STAGE SPECIFIC ACTIONS */}
                        
                        {/* 1. Actions for Shortlisted */}
                        {cand.stage === "Shortlisted" && (
                          <div className="mt-3 pt-3 border-t border-brand-gray/20 flex items-center gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 h-8 bg-brand-indigo hover:bg-brand-indigo/90 text-white text-xs"
                              onClick={(e) => { e.stopPropagation(); handleStageSelect(cand, "Interview Scheduled"); }}
                            >
                              <ArrowRight className="w-3.5 h-3.5 mr-1" /> Schedule
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-semantic-error border-semantic-error/30 hover:bg-semantic-error/10 text-xs px-2.5"
                              onClick={(e) => { e.stopPropagation(); setActiveCandidate(cand); setRejectModalOpen(true); }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}

                        {/* 2. Actions for Interview Scheduled */}
                        {cand.stage === "Interview Scheduled" && (
                          <div className="mt-3 pt-3 border-t border-brand-gray/20 flex items-center gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 h-8 bg-brand-blue hover:bg-brand-blue/90 text-white text-xs"
                              onClick={(e) => { e.stopPropagation(); handleStageSelect(cand, "Interview Completed"); }}
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Complete
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-semantic-error border-semantic-error/30 hover:bg-semantic-error/10 text-xs px-2.5"
                              onClick={(e) => { e.stopPropagation(); setActiveCandidate(cand); setRejectModalOpen(true); }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}

                        {/* 3. Actions for Interview Completed */}
                        {cand.stage === "Interview Completed" && (
                          <div className="mt-3 pt-3 border-t border-brand-gray/20 flex items-center gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 h-8 bg-semantic-warning hover:bg-semantic-warning/90 text-white text-xs"
                              onClick={(e) => { e.stopPropagation(); handleStageSelect(cand, "Decision Pending"); }}
                            >
                              <ArrowRight className="w-3.5 h-3.5 mr-1" /> Decision
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-semantic-error border-semantic-error/30 hover:bg-semantic-error/10 text-xs px-2.5"
                              onClick={(e) => { e.stopPropagation(); setActiveCandidate(cand); setRejectModalOpen(true); }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}

                        {/* 4. Actions for Decision Pending */}
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

                        {/* 5. Actions for Hired */}
                        {cand.stage === "Hired" && (
                          <div className="mt-3 pt-2 border-t border-brand-gray/20 flex items-center justify-between text-xs text-semantic-success font-semibold">
                            <span className="flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Offer Accepted / Hired
                            </span>
                          </div>
                        )}

                        {/* 6. Actions for Rejected */}
                        {cand.stage === "Rejected" && (
                          <div className="mt-3 pt-2 border-t border-brand-gray/20 flex items-center justify-between text-xs">
                            <span className="text-semantic-error font-semibold flex items-center gap-1">
                              <X className="w-3.5 h-3.5" /> Rejected
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-[10px] uppercase tracking-wider text-brand-indigo px-2 hover:bg-brand-indigo/10"
                              onClick={(e) => { e.stopPropagation(); handleStageSelect(cand, "Shortlisted"); }}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" /> Reconsider
                            </Button>
                          </div>
                        )}

                        {/* UNIVERSAL STAGE SELECTOR ON EVERY CARD */}
                        <div className="mt-2.5 pt-2 border-t border-brand-gray/20 flex items-center justify-between text-xs text-brand-navy/60">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-navy/50">Stage</span>
                          <select
                            value={cand.stage}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleStageSelect(cand, e.target.value as PipelineStage)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs bg-white border border-brand-gray/30 rounded px-2 py-0.5 text-brand-navy font-medium focus:outline-none focus:ring-1 focus:ring-brand-indigo cursor-pointer shadow-sm hover:border-brand-indigo/50 transition-colors"
                          >
                            {COLUMNS.map(col => (
                              <option key={col.id} value={col.id}>{col.label}</option>
                            ))}
                          </select>
                        </div>
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
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
            <Button variant="outline" onClick={() => { setHireModalOpen(false); setActiveCandidate(null); }} className="w-full sm:w-auto border-brand-gray/40 text-brand-navy">Cancel</Button>
            <Button onClick={handleHire} className="w-full sm:w-auto bg-semantic-success hover:bg-semantic-success/90 text-white">Confirm Hire</Button>
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
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
            <Button variant="outline" onClick={() => { setRejectModalOpen(false); setActiveCandidate(null); }} className="w-full sm:w-auto border-brand-gray/40 text-brand-navy">Cancel</Button>
            <Button onClick={handleReject} className="w-full sm:w-auto bg-semantic-error hover:bg-semantic-error/90 text-white">Reject Candidate</Button>
          </div>
      </Modal>

    </DashboardShell>
  )
}
