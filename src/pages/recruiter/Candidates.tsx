import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Search, Filter, SlidersHorizontal, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { applicationService, type Application } from "../../services/applicationService"
import { jobService } from "../../services/jobService"
import { mockCandidates } from "../../data/mockCandidates"
import type { Job } from "../../data/mockJobs"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"

export default function RecruiterCandidates() {
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  
  type CandidateData = { app: Application; candidate: typeof mockCandidates[0]; job: Job }
  const [candidates, setCandidates] = React.useState<CandidateData[]>([])
  const [filteredCandidates, setFilteredCandidates] = React.useState<CandidateData[]>([])
  
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState("")
  
  const [filters, setFilters] = React.useState({
    status: "",
    minScore: 0,
    jobId: ""
  })
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = React.useState(false)

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 200)
    return () => clearTimeout(handler)
  }, [searchTerm])

  React.useEffect(() => {
    const fetchData = async () => {
      const allApps = applicationService.getApplications()
      const allJobs = await jobService.getJobs()
      
      const mapped = allApps.map(app => {
        const candidate = mockCandidates.find(c => c.id === app.candidateId)
        const job = allJobs.find(j => j.id === app.jobId)
        if (!candidate || !job) return null
        return { app, candidate, job }
      }).filter((c): c is CandidateData => c !== null)
      
      setCandidates(mapped)
      setFilteredCandidates(mapped)
      setLoading(false)
    }
    fetchData()
  }, [])

  React.useEffect(() => {
    let result = [...candidates]
    
    if (debouncedSearchTerm) {
      const q = debouncedSearchTerm.toLowerCase()
      result = result.filter(c => 
        c.candidate.personalInfo.name.toLowerCase().includes(q) ||
        c.candidate.skills.languages.some(s => s.toLowerCase().includes(q)) ||
        c.candidate.skills.frameworks.some(s => s.toLowerCase().includes(q)) ||
        c.job.title.toLowerCase().includes(q)
      )
    }
    
    if (filters.status) result = result.filter(c => c.app.status === filters.status)
    if (filters.minScore > 0) result = result.filter(c => (c.app.matchScore || 0) >= filters.minScore)
    if (filters.jobId) result = result.filter(c => c.job.id === filters.jobId)
      
    setFilteredCandidates(result)
  }, [candidates, debouncedSearchTerm, filters])

  // Unique jobs for filter
  const uniqueJobs = Array.from(new Set(candidates.map(c => c.job.id))).map(id => {
    return candidates.find(c => c.job.id === id)!.job
  })

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-7xl mx-auto space-y-6 pb-12">
        <motion.div variants={slideUp}>
          <h1 className="text-2xl font-display font-semibold text-brand-navy flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-indigo" /> Candidates
          </h1>
          <p className="text-brand-navy/60 mt-1">Manage and track candidates across all your job postings.</p>
        </motion.div>

        <motion.div variants={slideUp} className="bg-white rounded-2xl border border-brand-gray/50 shadow-sm p-2 flex items-center relative z-10">
          <div className="flex-1 flex items-center px-4">
            <Search className="w-5 h-5 text-brand-navy/40 mr-3" />
            <input
              type="text"
              placeholder="Search by name, skill, or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-brand-navy placeholder:text-brand-navy/40 h-12"
            />
          </div>
          <Button variant="outline" className="sm:hidden mr-2" onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}>
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Filters */}
          <motion.div variants={slideUp} className={cn("w-full lg:w-64 shrink-0 flex-col gap-4", isMobileFiltersOpen ? "flex" : "hidden lg:flex")}>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-brand-navy flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h2>
              <button 
                onClick={() => setFilters({ status: "", minScore: 0, jobId: "" })}
                className="text-xs font-medium text-brand-indigo hover:underline"
              >
                Clear All
              </button>
            </div>
            
            <Card>
              <CardContent className="p-4 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-navy uppercase tracking-wider">Job</label>
                  <select
                    value={filters.jobId}
                    onChange={e => setFilters({...filters, jobId: e.target.value})}
                    className="w-full bg-brand-light border border-brand-gray/50 rounded-lg p-2.5 text-sm outline-none"
                  >
                    <option value="">All Jobs</option>
                    {uniqueJobs.map(j => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-navy uppercase tracking-wider">Status</label>
                  <select
                    value={filters.status}
                    onChange={e => setFilters({...filters, status: e.target.value})}
                    className="w-full bg-brand-light border border-brand-gray/50 rounded-lg p-2.5 text-sm outline-none"
                  >
                    <option value="">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="AI Screened">AI Screened</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-navy uppercase tracking-wider">Min Score</label>
                  <select
                    value={filters.minScore.toString()}
                    onChange={e => setFilters({...filters, minScore: parseInt(e.target.value)})}
                    className="w-full bg-brand-light border border-brand-gray/50 rounded-lg p-2.5 text-sm outline-none"
                  >
                    <option value="0">Any Score</option>
                    <option value="60">60%+</option>
                    <option value="70">70%+</option>
                    <option value="80">80%+</option>
                    <option value="90">90%+</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Candidate List */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between bg-brand-light/50 p-4 rounded-xl border border-brand-gray/30">
              <span className="text-brand-navy/70 font-medium">{filteredCandidates.length} Candidates</span>
            </div>

            <AnimatePresence mode="popLayout">
              {loading ? (
                [1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl border border-brand-gray/30 animate-pulse" />)
              ) : filteredCandidates.length > 0 ? (
                filteredCandidates.map(({ app, candidate, job }) => (
                  <motion.div
                    layout
                    key={app.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                  >
                    <Card className="hover:border-brand-indigo/30 transition-all cursor-pointer overflow-hidden group" onClick={() => navigate(`/recruiter/candidates/${app.id}`)}>
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center p-5 gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-brand-navy truncate">{candidate.personalInfo.name}</h3>
                              <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                app.status === "Shortlisted" ? "bg-semantic-warning/10 text-semantic-warning" :
                                app.status === "Applied" ? "bg-brand-gray/30 text-brand-navy/60" :
                                app.status === "Rejected" ? "bg-semantic-error/10 text-semantic-error" :
                                app.status === "Hired" ? "bg-semantic-success/10 text-semantic-success" :
                                "bg-brand-indigo/10 text-brand-indigo"
                              )}>
                                {app.status}
                              </span>
                            </div>
                            <p className="text-sm text-brand-navy/60 mb-2 truncate">
                              Applied for: <span className="font-medium text-brand-navy">{job.title}</span>
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.skills.languages.slice(0, 3).map(s => (
                                <span key={s} className="px-2 py-0.5 bg-brand-light rounded-md text-xs text-brand-navy/70 border border-brand-gray/50">
                                  {s}
                                </span>
                              ))}
                              {candidate.skills.languages.length > 3 && (
                                <span className="px-2 py-0.5 bg-brand-light rounded-md text-xs text-brand-navy/70 border border-brand-gray/50">
                                  +{candidate.skills.languages.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 sm:w-auto w-full justify-between sm:justify-end border-t sm:border-t-0 border-brand-gray/30 pt-4 sm:pt-0 mt-4 sm:mt-0">
                            <div className="text-center">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-navy/40 mb-1">Match Score</p>
                              {app.matchScore ? (
                                <span className={cn(
                                  "text-xl font-bold",
                                  app.matchScore >= 85 ? "text-semantic-success" :
                                  app.matchScore >= 70 ? "text-semantic-warning" : "text-semantic-error"
                                )}>
                                  {app.matchScore}%
                                </span>
                              ) : (
                                <span className="text-brand-navy/40 text-sm">Not screened</span>
                              )}
                            </div>
                            <div className="text-brand-indigo group-hover:translate-x-1 transition-transform">
                              <ChevronRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="bg-white rounded-xl border border-brand-gray/50 p-12 text-center flex flex-col items-center justify-center">
                  <Users className="w-12 h-12 text-brand-navy/20 mb-4" />
                  <h3 className="text-xl font-display font-semibold text-brand-navy mb-2">No candidates found</h3>
                  <p className="text-brand-navy/60 mb-6">Try adjusting your search or filters.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </DashboardShell>
  )
}
