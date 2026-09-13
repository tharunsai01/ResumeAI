import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ChevronRight, Briefcase, Filter } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { applicationService, type Application } from "../../services/applicationService"
import { jobService } from "../../services/jobService"
import { aiScreeningService } from "../../services/aiScreeningService"
import { mockCandidates } from "../../data/mockCandidates"
import type { Job } from "../../data/mockJobs"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"

export default function RecruiterScreening() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialJobId = searchParams.get("jobId") || ""
  
  const [jobs, setJobs] = React.useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = React.useState(initialJobId)
  
  const [isScreening, setIsScreening] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  
  type CandidateData = { app: Application; candidate: typeof mockCandidates[0] }
  const [results, setResults] = React.useState<CandidateData[]>([])

  React.useEffect(() => {
    const fetchJobs = async () => {
      const allJobs = await jobService.getJobs()
      setJobs(allJobs)
      if (!selectedJobId && allJobs.length > 0) {
        setSelectedJobId(allJobs[0].id)
      }
    }
    fetchJobs()
  }, [])

  React.useEffect(() => {
    if (selectedJobId) {
      loadResults(selectedJobId)
    }
  }, [selectedJobId])

  const loadResults = (jobId: string) => {
    const apps = applicationService.getApplicationsByJob(jobId)
    const mapped = apps.map(app => {
      const candidate = mockCandidates.find(c => c.id === app.candidateId)
      if (!candidate) return null
      return { app, candidate }
    }).filter((c): c is CandidateData => c !== null)
    
    // Sort by match score if available
    mapped.sort((a, b) => (b.app.matchScore || 0) - (a.app.matchScore || 0))
    setResults(mapped)
  }

  const handleRunScreening = async () => {
    if (!selectedJobId) return
    setIsScreening(true)
    setProgress(0)
    
    await aiScreeningService.screenCandidatesForJob(selectedJobId, (p) => {
      setProgress(p)
    })
    
    loadResults(selectedJobId)
    setIsScreening(false)
  }

  const unscreenedCount = results.filter(r => r.app.status === "Applied").length
  const screenedResults = results.filter(r => r.app.aiScreening || r.app.status !== "Applied")

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto space-y-6 pb-12">
        <motion.div variants={slideUp}>
          <h1 className="text-3xl font-display font-semibold text-brand-navy flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-brand-indigo" /> AI Candidate Screening
          </h1>
          <p className="text-brand-navy/60 mt-1">Automatically evaluate and rank applicants based on job requirements.</p>
        </motion.div>

        <motion.div variants={slideUp} className="bg-white rounded-2xl border border-brand-gray/50 shadow-sm p-4 relative z-10 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-brand-navy uppercase tracking-wider mb-2">Select Job</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/40" />
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full bg-brand-light border border-brand-gray/50 rounded-xl pl-11 pr-4 py-3 outline-none focus:border-brand-indigo/50 text-brand-navy appearance-none"
              >
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <Button 
              onClick={handleRunScreening} 
              disabled={isScreening || unscreenedCount === 0}
              className="w-full md:w-auto px-8 py-3 h-12 bg-gradient-to-r from-brand-indigo to-brand-blue"
            >
              {isScreening ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Screening... {progress}%
                </span>
              ) : (
                <span className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" /> Screen {unscreenedCount} Candidates
                </span>
              )}
            </Button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isScreening && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="border-brand-indigo/20 bg-brand-indigo/5 overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                  <Sparkles className="w-12 h-12 text-brand-indigo animate-pulse" />
                  <div className="text-center">
                    <h3 className="font-semibold text-brand-navy">AI is analyzing applications...</h3>
                    <p className="text-sm text-brand-navy/60 mt-1">Comparing resumes against job requirements and calculating match scores.</p>
                  </div>
                  <div className="w-full max-w-md h-2 bg-brand-gray/30 rounded-full overflow-hidden mt-2">
                    <div className="h-full bg-brand-indigo rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={slideUp} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-brand-navy">Screening Results</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {screenedResults.length > 0 ? (
              screenedResults.map(({ app, candidate }, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={app.id}
                >
                  <Card className="hover:border-brand-indigo/30 transition-all cursor-pointer group" onClick={() => navigate(`/recruiter/candidates/${app.id}`)}>
                    <CardContent className="p-0 flex flex-col sm:flex-row items-center">
                      <div className={cn(
                        "w-full sm:w-24 p-4 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-brand-gray/30",
                        app.matchScore >= 85 ? "bg-semantic-success/5 text-semantic-success" : 
                        app.matchScore >= 70 ? "bg-semantic-warning/5 text-semantic-warning" : "bg-semantic-error/5 text-semantic-error"
                      )}>
                        <span className="text-2xl font-bold">{app.matchScore}%</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Match</span>
                      </div>
                      
                      <div className="flex-1 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                        <div>
                          <h3 className="text-lg font-semibold text-brand-navy flex items-center gap-2">
                            {candidate.personalInfo.name}
                            {index === 0 && <span className="px-2 py-0.5 rounded-full bg-brand-indigo/10 text-brand-indigo text-xs font-bold uppercase tracking-wider">Top Match</span>}
                          </h3>
                          <p className="text-sm text-brand-navy/60 mt-1 truncate max-w-lg">
                            {app.aiScreening?.strengths[0] || "Strong candidate based on experience."}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="hidden md:flex gap-1">
                            {app.aiScreening?.missingSkills.slice(0, 1).map(s => (
                              <span key={s} className="px-2 py-1 rounded-md bg-semantic-error/10 text-semantic-error text-xs font-medium border border-semantic-error/20">
                                Missing: {s}
                              </span>
                            ))}
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
              <div className="bg-white rounded-xl border border-brand-gray/50 p-12 text-center">
                <Sparkles className="w-12 h-12 text-brand-navy/20 mx-auto mb-4" />
                <h3 className="text-xl font-display font-semibold text-brand-navy mb-2">No screened candidates</h3>
                <p className="text-brand-navy/60">Select a job and run screening to see ranked results here.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </DashboardShell>
  )
}
