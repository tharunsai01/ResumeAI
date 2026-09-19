import * as React from "react"
import { motion } from "framer-motion"
import { ChevronLeft, Brain, Search, CheckCircle2, Zap, Loader2 } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { staggerContainer, slideUp } from "../../lib/animations"
import { screeningJobs, initialScreeningCandidates, AI_SCREENING_THRESHOLD } from "../../data/screeningMockData"
import { CandidateStatusBadge } from "./components/CandidateStatusBadge"
import { CandidateMatchScore } from "./components/CandidateMatchScore"
import { RejectCandidateModal } from "./components/RejectCandidateModal"
import { cn } from "../../lib/utils"

const PIPELINE_STEPS = [
  "Applications",
  "Resume Analysis",
  "Skill Extraction",
  "Requirement Matching",
  "Candidate Score",
  "Ranking"
]

export default function RecruiterJobScreening() {
  const navigate = useNavigate()
  const { jobId } = useParams()
  
  const job = screeningJobs.find(j => j.id === jobId) || screeningJobs[0] // fallback for mock
  const [loading, setLoading] = React.useState(true)
  const [candidates, setCandidates] = React.useState(initialScreeningCandidates)
  const [isScreening, setIsScreening] = React.useState(false)
  const [screeningProgress, setScreeningProgress] = React.useState(0)
  const [screeningComplete, setScreeningComplete] = React.useState(job.pending === 0)
  
  // Filters
  const [searchTerm, setSearchTerm] = React.useState("")
  const [qualFilter, setQualFilter] = React.useState("All")
  const [scoreFilter, setScoreFilter] = React.useState("All")
  const [statusFilter, setStatusFilter] = React.useState("All")
  const [sortBy, setSortBy] = React.useState("Highest Match")
  
  // Actions
  const [candidateToReject, setCandidateToReject] = React.useState<{id: string, name: string} | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const runScreening = () => {
    setIsScreening(true)
    setScreeningProgress(0)
    
    // Simulate fast progressive AI screening
    const interval = setInterval(() => {
      setScreeningProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsScreening(false)
            setScreeningComplete(true)
            // mock update to reflect 0 pending
            job.pending = 0
            job.screened = job.applications
          }, 300)
          return 100
        }
        return p + 25
      })
    }, 300)
  }

  const filteredAndSorted = React.useMemo(() => {
    let result = candidates.filter(cand => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        cand.name.toLowerCase().includes(searchLower) || 
        cand.role.toLowerCase().includes(searchLower) ||
        cand.skills.some(s => s.name.toLowerCase().includes(searchLower))
      
      const matchesStatus = statusFilter === "All" || cand.status === statusFilter
      
      let matchesQual = true
      if (qualFilter === "Qualified") matchesQual = cand.overallMatch >= AI_SCREENING_THRESHOLD
      else if (qualFilter === "Below Threshold") matchesQual = cand.overallMatch < AI_SCREENING_THRESHOLD
      
      let matchesScore = true
      if (scoreFilter === "90+") matchesScore = cand.overallMatch >= 90
      else if (scoreFilter === "80+") matchesScore = cand.overallMatch >= 80
      else if (scoreFilter === "70+") matchesScore = cand.overallMatch >= 70
      else if (scoreFilter === "Below 70") matchesScore = cand.overallMatch < 70

      return matchesSearch && matchesStatus && matchesQual && matchesScore
    })

    result.sort((a, b) => {
      if (sortBy === "Highest Match") return b.overallMatch - a.overallMatch
      if (sortBy === "Lowest Match") return a.overallMatch - b.overallMatch
      if (sortBy === "Name") return a.name.localeCompare(b.name)
      return 0 
    })

    return result
  }, [candidates, searchTerm, statusFilter, scoreFilter, sortBy])

  const handleShortlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setCandidates(candidates.map(c => c.id === id ? { ...c, status: "Shortlisted" } : c))
  }

  const handleReject = () => {
    if (candidateToReject) {
      setCandidates(candidates.map(c => c.id === candidateToReject.id ? { ...c, status: "Rejected" } : c))
      setCandidateToReject(null)
    }
  }

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12">
        
        {/* HEADER */}
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button onClick={() => navigate("/recruiter/screening")} className="flex items-center text-sm font-medium text-brand-navy/60 hover:text-brand-indigo transition-colors mb-2">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Jobs
            </button>
            <h1 className="text-3xl font-display font-semibold text-brand-navy">{job.title} — AI Screening</h1>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-brand-navy/60">
              <span className="text-brand-navy font-bold">{job.screened}</span> / {job.applications} Screened
            </div>
            <div className="w-32 h-2 bg-brand-gray/20 rounded-full mt-1.5 ml-auto overflow-hidden">
              <div 
                className={cn("h-full bg-brand-indigo rounded-full transition-all duration-500")}
                style={{ width: `${(job.screened / job.applications) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* OVERVIEW & PIPELINE CARD */}
        <motion.div variants={slideUp}>
          <Card className="overflow-hidden border-brand-indigo/10 shadow-sm relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-indigo/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* PIPELINE */}
                <div className="flex-1 w-full relative">
                  <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-brand-gray/20 -translate-y-1/2 z-0" />
                  <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-4 sm:gap-0">
                    {PIPELINE_STEPS.map((step, idx) => {
                      const isActive = screeningComplete || (isScreening && (screeningProgress / 100) * PIPELINE_STEPS.length >= idx)
                      return (
                        <div key={step} className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-500 border-2",
                            isActive ? "bg-brand-indigo border-brand-indigo text-white shadow-md shadow-brand-indigo/20" : "bg-white border-brand-gray/30 text-brand-gray"
                          )}>
                            {isActive ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider text-center max-w-[80px]",
                            isActive ? "text-brand-indigo" : "text-brand-navy/40"
                          )}>
                            {step}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ACTION BUTTON */}
                <div className="shrink-0 w-full md:w-auto">
                  {!screeningComplete && !isScreening ? (
                    <Button onClick={runScreening} className="w-full md:w-auto bg-gradient-to-r from-brand-indigo to-brand-blue py-6 px-8 text-base shadow-lg shadow-brand-indigo/20 hover:shadow-xl hover:shadow-brand-indigo/30 transition-all hover:-translate-y-0.5 group">
                      <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> 
                      Run AI Screening
                    </Button>
                  ) : isScreening ? (
                    <Button disabled className="w-full md:w-auto bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20 py-6 px-8 text-base cursor-wait">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Resumes...
                    </Button>
                  ) : (
                    <Button disabled className="w-full md:w-auto bg-semantic-success/10 text-semantic-success border border-semantic-success/20 py-6 px-8 text-base">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Screening Complete
                    </Button>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* INFO BANNER */}
        <motion.div variants={slideUp} className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-brand-navy">AI-Assisted Candidate Prioritization</h4>
              <p className="text-xs text-brand-navy/60 mt-1">
                AI qualification is based on the configured match threshold ({AI_SCREENING_THRESHOLD}%) and is intended to support recruiter review. It does not represent a final hiring decision.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-brand-gray/30">
            <div className="text-center pr-4 border-r border-brand-gray/20">
              <div className="text-xl font-bold text-semantic-success">{candidates.filter(c => c.overallMatch >= AI_SCREENING_THRESHOLD).length}</div>
              <div className="text-[10px] font-semibold text-brand-navy/50 uppercase tracking-wider">AI Qualified</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-brand-navy/60">{candidates.filter(c => c.overallMatch < AI_SCREENING_THRESHOLD).length}</div>
              <div className="text-[10px] font-semibold text-brand-navy/50 uppercase tracking-wider">Below Threshold</div>
            </div>
          </div>
        </motion.div>

        {/* FILTERS & SEARCH */}
        <motion.div variants={slideUp} className="flex flex-col lg:flex-row gap-4">
          <div className="glass-card flex-1 flex items-center px-4 focus-within: focus-within:ring-2 focus-within:ring-brand-indigo/10 transition-all">
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
            <select value={qualFilter} onChange={(e) => setQualFilter(e.target.value)} className="bg-white border border-brand-gray/40 shadow-sm rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
              <option value="All">All Qualifications</option>
              <option value="Qualified">Qualified ({AI_SCREENING_THRESHOLD}%+)</option>
              <option value="Below Threshold">Below Threshold</option>
            </select>
            <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)} className="bg-white border border-brand-gray/40 shadow-sm rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
              <option value="All">All Match Scores</option>
              <option value="90+">90%+ Match</option>
              <option value="80+">80%+ Match</option>
              <option value="70+">70%+ Match</option>
              <option value="Below 70">Below 70% Match</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-brand-gray/40 shadow-sm rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-brand-gray/40 shadow-sm rounded-xl px-3 py-2 text-sm text-brand-navy outline-none focus:border-brand-indigo/50">
              <option value="Highest Match">Sort: Highest Match</option>
              <option value="Lowest Match">Sort: Lowest Match</option>
              <option value="Name">Sort: Name A-Z</option>
            </select>
          </div>
        </motion.div>

        {/* CANDIDATE RANKING TABLE */}
        <motion.div variants={slideUp}>
          <Card className="shadow-sm">
            <div className="p-4 border-b border-brand-gray/20 flex justify-between items-center bg-brand-light/30">
              <h3 className="font-display font-semibold text-brand-navy">AI Candidate Ranking</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-brand-navy/60 uppercase text-[10px] tracking-wider font-semibold border-b border-brand-gray/30">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4 text-center">Overall Match</th>
                    <th className="px-6 py-4 text-center">AI Qualification</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-gray/20">
                  {loading ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-brand-navy/40"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                  ) : filteredAndSorted.length > 0 ? (
                    filteredAndSorted.map((cand, index) => {
                      const isQualified = cand.overallMatch >= AI_SCREENING_THRESHOLD
                      return (
                      <tr key={cand.id} className="hover:bg-brand-light/50 transition-colors group cursor-pointer" onClick={() => navigate(`/recruiter/screening/${jobId}/${cand.id}`)}>
                        <td className="px-6 py-4">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                            index === 0 ? "bg-[#FFD700]/20 text-[#B8860B]" :
                            index === 1 ? "bg-[#C0C0C0]/20 text-[#808080]" :
                            index === 2 ? "bg-[#CD7F32]/20 text-[#A0522D]" :
                            "bg-brand-gray/10 text-brand-navy/50"
                          )}>
                            #{index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-brand-navy group-hover:text-brand-indigo transition-colors">{cand.name}</div>
                          <div className="text-xs text-brand-navy/60 mt-0.5">{cand.role}</div>
                        </td>
                        <td className="px-6 py-4 text-center bg-brand-indigo/[0.01]">
                          <CandidateMatchScore score={cand.overallMatch} size="sm" showLabel={false} className="mx-auto" />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border",
                            isQualified ? "bg-semantic-success/10 text-semantic-success border-semantic-success/20" : "bg-brand-gray/10 text-brand-navy/50 border-brand-gray/20"
                          )}>
                            {isQualified ? "QUALIFIED" : "BELOW THRESHOLD"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <CandidateStatusBadge status={cand.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {cand.status === "Shortlisted" ? (
                              <Button variant="outline" disabled size="sm" className="bg-brand-light text-brand-navy/40 border-brand-gray/30 text-xs">Shortlisted</Button>
                            ) : cand.status === "Rejected" ? (
                              <Button variant="outline" disabled size="sm" className="bg-brand-light text-brand-navy/40 border-brand-gray/30 text-xs">Rejected</Button>
                            ) : (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-semantic-error hover:bg-semantic-error/10 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setCandidateToReject({id: cand.id, name: cand.name})
                                  }}
                                >
                                  Reject
                                </Button>
                                {isQualified ? (
                                  <Button size="sm" className="text-xs bg-brand-indigo hover:bg-brand-blue" onClick={(e) => handleShortlist(e, cand.id)}>
                                    Shortlist
                                  </Button>
                                ) : (
                                  <Button disabled size="sm" className="text-xs bg-brand-gray/20 text-brand-navy/40 cursor-not-allowed border-brand-gray/30" onClick={(e) => e.stopPropagation()}>
                                    Below Threshold
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )})
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-brand-navy/50">No candidates match your criteria.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <RejectCandidateModal
        isOpen={!!candidateToReject}
        candidateName={candidateToReject?.name}
        onClose={() => setCandidateToReject(null)}
        onConfirm={handleReject}
      />
    </DashboardShell>
  )
}
