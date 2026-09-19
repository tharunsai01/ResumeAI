import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Calendar, User, CheckCircle2, AlertCircle, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Modal } from "../../components/ui/Modal"
import { staggerContainer, slideUp } from "../../lib/animations"
import { initialPipelineCandidates } from "../../data/pipelineMockData"
import { AI_SCREENING_THRESHOLD } from "../../data/screeningMockData"
import { ScheduleInterviewModal } from "./components/ScheduleInterviewModal"
import { cn } from "../../lib/utils"

export default function RecruiterShortlist() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [candidates, setCandidates] = React.useState(initialPipelineCandidates.filter(c => ["Shortlisted", "Interview Scheduled"].includes(c.stage)))
  
  // Modals
  const [scheduleModalOpen, setScheduleModalOpen] = React.useState(false)
  const [candidateToSchedule, setCandidateToSchedule] = React.useState<{id: string, name: string, role: string} | undefined>()
  const [candidateToRemove, setCandidateToRemove] = React.useState<{id: string, name: string} | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = React.useState("")
  const [jobFilter, setJobFilter] = React.useState("All")
  const [matchFilter, setMatchFilter] = React.useState("All")
  const [interviewFilter, setInterviewFilter] = React.useState("All")
  
  // Toast
  const [toastMsg, setToastMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleSchedule = (data: any) => {
    setCandidates(candidates.map(c => c.id === data.candidateId ? { ...c, stage: "Interview Scheduled" } : c))
    showToast("Interview scheduled successfully.")
  }

  const handleRemove = () => {
    if (candidateToRemove) {
      setCandidates(candidates.filter(c => c.id !== candidateToRemove.id))
      setCandidateToRemove(null)
      showToast("Candidate removed from shortlist.")
    }
  }

  const filteredCandidates = React.useMemo(() => {
    return candidates.filter(cand => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        cand.name.toLowerCase().includes(searchLower) || 
        cand.role.toLowerCase().includes(searchLower) ||
        cand.skills.some(s => s.toLowerCase().includes(searchLower))
      
      const matchesJob = jobFilter === "All" || cand.role === jobFilter
      
      let matchesMatch = true
      if (matchFilter === "90+") matchesMatch = cand.overallMatch >= 90
      else if (matchFilter === "80-89") matchesMatch = cand.overallMatch >= 80 && cand.overallMatch < 90
      
      let matchesInterview = true
      if (interviewFilter === "Scheduled") matchesInterview = cand.stage === "Interview Scheduled"
      else if (interviewFilter === "Not Scheduled") matchesInterview = cand.stage === "Shortlisted"

      return matchesSearch && matchesJob && matchesMatch && matchesInterview
    })
  }, [candidates, searchTerm, jobFilter, matchFilter, interviewFilter])

  const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
    <motion.div variants={slideUp} custom={delay}>
      <Card className="hover:-translate-y-0.5 transition-all duration-200">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-brand-navy/60 mb-1">{title}</p>
            <h3 className="text-2xl font-display font-bold text-brand-navy">
              {loading ? <div className="h-8 w-12 bg-brand-gray/20 rounded animate-pulse" /> : value}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${color.bg} ${color.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12 relative">
        
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
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-brand-navy">Shortlisted Candidates</h1>
            <p className="text-brand-navy/60 mt-1">Review candidates selected for the next stage of your recruitment process.</p>
          </div>
          <Button onClick={() => setScheduleModalOpen(true)} className="bg-brand-indigo hover:bg-brand-blue shrink-0">
            <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
          </Button>
        </motion.div>

        {/* INFO BANNER */}
        <motion.div variants={slideUp} className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
          <p className="text-sm text-brand-navy/80">
            <span className="font-semibold text-brand-navy">AI Qualification Note:</span> AI screening supports recruiter review. Candidates with scores of {AI_SCREENING_THRESHOLD}% or higher are tagged as AI Qualified. Final candidate decisions are made by the recruiter.
          </p>
        </motion.div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Shortlisted" value={candidates.length} icon={User} delay={0} color={{ bg: "bg-brand-indigo/10", text: "text-brand-indigo" }} />
          <StatCard title="Interview Pending" value={candidates.filter(c => c.stage === "Shortlisted").length} icon={Calendar} delay={1} color={{ bg: "bg-semantic-warning/10", text: "text-semantic-warning" }} />
          <StatCard title="Interview Scheduled" value={candidates.filter(c => c.stage === "Interview Scheduled").length} icon={CheckCircle2} delay={2} color={{ bg: "bg-semantic-success/10", text: "text-semantic-success" }} />
          <StatCard title="Ready for Decision" value={0} icon={User} delay={3} color={{ bg: "bg-brand-gray/20", text: "text-brand-navy/70" }} />
        </div>

        {/* FILTERS */}
        <motion.div variants={slideUp} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex items-center px-4 bg-white border border-brand-gray/40 rounded-xl focus-within:border-brand-indigo/50 focus-within:ring-2 focus-within:ring-brand-indigo/10 transition-all shadow-sm">
            <Search className="w-5 h-5 text-brand-navy/40 mr-3" />
            <input
              type="text"
              placeholder="Search candidates by name, role, skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-brand-navy placeholder:text-brand-navy/40 h-11"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 lg:flex">
            <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="bg-white border border-brand-gray/40 shadow-sm rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
              <option value="All">All Jobs</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="AI Engineer">AI Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
            </select>
            <select value={matchFilter} onChange={(e) => setMatchFilter(e.target.value)} className="bg-white border border-brand-gray/40 shadow-sm rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
              <option value="All">All AI Matches</option>
              <option value="90+">90%+</option>
              <option value="80-89">80-89%</option>
            </select>
            <select value={interviewFilter} onChange={(e) => setInterviewFilter(e.target.value)} className="bg-white border border-brand-gray/40 shadow-sm rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
              <option value="All">All Interview Status</option>
              <option value="Not Scheduled">Not Scheduled</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>
        </motion.div>

        {/* SHORTLIST TABLE */}
        <motion.div variants={slideUp}>
          <Card className="shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-brand-light/50 text-brand-navy/60 uppercase text-[10px] tracking-wider font-semibold border-b border-brand-gray/30">
                  <tr>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4 text-center">AI Qualification</th>
                    <th className="px-6 py-4">Experience & Skills</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Interview</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray/20">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-brand-navy/40">
                        <div className="w-6 h-6 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredCandidates.length > 0 ? (
                    filteredCandidates.map((cand) => {
                      const isQualified = cand.overallMatch >= AI_SCREENING_THRESHOLD
                      return (
                        <tr key={cand.id} className="hover:bg-brand-light/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/recruiter/candidates/${cand.id}`)}>
                              <div className="w-9 h-9 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigo font-bold border border-brand-indigo/20">
                                {cand.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-brand-navy group-hover:text-brand-indigo transition-colors">{cand.name}</div>
                                <div className="text-xs text-brand-navy/60 mt-0.5">{cand.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-bold text-brand-indigo">{cand.overallMatch}%</span>
                              <span className={cn(
                                "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                                isQualified ? "bg-semantic-success/10 text-semantic-success border-semantic-success/20" : "bg-brand-gray/10 text-brand-navy/50 border-brand-gray/20"
                              )}>
                                {isQualified ? "QUALIFIED" : "BELOW THRESHOLD"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-brand-navy">{cand.experience}</div>
                            <div className="text-xs text-brand-navy/60 mt-1 truncate max-w-[200px]">
                              {cand.skills.join(" · ")}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-navy text-white">
                              Shortlisted
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {cand.stage === "Interview Scheduled" ? (
                              <span className="flex items-center justify-center gap-1.5 text-xs font-semibold text-semantic-success bg-semantic-success/10 px-2 py-1 rounded-md border border-semantic-success/20">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Scheduled
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-1.5 text-xs font-semibold text-semantic-warning bg-semantic-warning/10 px-2 py-1 rounded-md border border-semantic-warning/20">
                                <Calendar className="w-3.5 h-3.5" /> Not Scheduled
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-semantic-error hover:bg-semantic-error/10 hover:text-semantic-error"
                                onClick={() => setCandidateToRemove({id: cand.id, name: cand.name})}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-brand-gray/40 hover:border-brand-indigo/50 hover:bg-brand-indigo/5 text-brand-indigo"
                                onClick={() => navigate(`/recruiter/candidates/${cand.id}`)}
                              >
                                <User className="w-4 h-4" />
                              </Button>
                              {cand.stage !== "Interview Scheduled" && (
                                <Button 
                                  size="sm" 
                                  className="h-8 bg-brand-indigo hover:bg-brand-blue"
                                  onClick={() => {
                                    setCandidateToSchedule({id: cand.id, name: cand.name, role: cand.role})
                                    setScheduleModalOpen(true)
                                  }}
                                >
                                  Schedule
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <User className="w-10 h-10 text-brand-navy/20 mx-auto mb-3" />
                        <div className="text-lg font-medium text-brand-navy/60">No shortlisted candidates found</div>
                        <p className="text-sm text-brand-navy/40 mt-1">Candidates you shortlist will appear here.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <ScheduleInterviewModal
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false)
          setCandidateToSchedule(undefined)
        }}
        onSchedule={handleSchedule}
        initialCandidate={candidateToSchedule}
      />

      <Modal isOpen={!!candidateToRemove} onClose={() => setCandidateToRemove(null)} title="Remove Candidate?" className="max-w-md">
          <div className="py-4">
            <p className="text-sm text-brand-navy/80">
              Are you sure you want to remove <span className="font-semibold text-brand-navy">{candidateToRemove?.name}</span> from the shortlist? They will be returned to the general candidate pool.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setCandidateToRemove(null)} className="border-brand-gray/40 text-brand-navy">Cancel</Button>
            <Button onClick={handleRemove} className="bg-semantic-error hover:bg-semantic-error/90 text-white">Remove</Button>
          </div>
      </Modal>
    </DashboardShell>
  )
}
