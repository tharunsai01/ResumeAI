import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowLeft, Building, MapPin, DollarSign, Briefcase, Bookmark, BookmarkCheck, CheckCircle2, AlertTriangle, X, UploadCloud } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { MatchScore } from "../../components/shared/MatchScore"
import { jobService } from "../../services/jobService"
import type { JobMatchResult } from "../../services/jobService"
import { useJobActions } from "../../hooks/useJobActions"
import { mockResumeAnalysis } from "../../data/mockResume"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"
import SpotlightCard from "../../components/ui/SpotlightCard";

let MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);

export default function CandidateJobDetails() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const isApplyModalOpen = searchParams.get("apply") === "true"

  const { isJobSaved, toggleSaveJob, hasApplied, applyToJob } = useJobActions()
  
  const [loading, setLoading] = React.useState(true)
  const [matchData, setMatchData] = React.useState<JobMatchResult | null>(null)
  
  // Apply Modal State
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

  React.useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        if (!jobId) return
        const job = await jobService.getJobById(jobId)
        if (job) {
          const match = jobService.calculateJobMatch(mockResumeAnalysis, job)
          setMatchData(match)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchJobDetails()
  }, [jobId])

  const handleApply = async () => {
    if (!matchData) return
    setIsSubmitting(true)
    // Simulate network delay
    // Simulate fetching
    setIsSubmitting(false)
    applyToJob(matchData.job, matchData.overallMatch)
    setIsSuccess(true)
  }

  const closeApplyModal = () => {
    if (isSubmitting) return
    setSearchParams(new URLSearchParams())
    setIsSuccess(false)
  }

  if (loading) {
    return (
      <DashboardShell type="candidate" userName={mockResumeAnalysis.personalInfo.name}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-indigo/30 border-t-brand-indigo" />
            <p className="text-brand-navy/60 font-medium">Loading job details...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!matchData) {
    return (
      <DashboardShell type="candidate" userName={mockResumeAnalysis.personalInfo.name}>
        <div className="text-center p-12">
          <h2 className="text-xl font-display font-semibold text-brand-navy">Job not found</h2>
          <Button className="mt-4" onClick={() => navigate("/candidate/jobs")}>Back to Jobs</Button>
        </div>
      </DashboardShell>
    )
  }

  const { job } = matchData
  const saved = isJobSaved(job.id)
  const applied = hasApplied(job.id)

  return (
    <DashboardShell type="candidate" userName={mockResumeAnalysis.personalInfo.name}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-5xl mx-auto space-y-6 pb-12">
        
        {/* Navigation & Actions */}
        <motion.div variants={slideUp} className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/candidate/jobs")}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-brand-gray/50 text-brand-navy/60 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </button>
        </motion.div>

        {/* Header Hero */}
        <motion.div variants={slideUp}>
          <Card className="overflow-hidden border-brand-gray/50 shadow-sm relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-indigo to-brand-blue" />
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-navy mb-2">{job.title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-brand-navy/70 mb-6">
                    <div className="flex items-center font-medium text-brand-indigo">
                      <Building className="w-4 h-4 mr-1.5" /> {job.company}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1.5 opacity-70" /> {job.location}
                    </div>
                    <div className="flex items-center font-medium text-semantic-success">
                      <DollarSign className="w-4 h-4 mr-1.5 opacity-70" /> {job.salary}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1.5 opacity-70" /> {job.type} • {job.experience}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto min-w-[140px]"
                      disabled={applied}
                      onClick={() => setSearchParams({ apply: "true" })}
                    >
                      {applied ? "Applied ✓" : "Apply Now"}
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto min-w-[140px]"
                      onClick={() => toggleSaveJob(job.id)}
                    >
                      {saved ? (
                        <><BookmarkCheck className="w-4 h-4 mr-2 text-brand-indigo" /> Saved</>
                      ) : (
                        <><Bookmark className="w-4 h-4 mr-2" /> Save Job</>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-brand-light rounded-xl border border-brand-gray/50 shrink-0 min-w-[160px]">
                  <MatchScore score={matchData.overallMatch} size="lg" />
                  <p className={cn(
                    "font-semibold text-sm mt-3",
                    matchData.overallMatch >= 90 ? "text-semantic-success" :
                    matchData.overallMatch >= 75 ? "text-brand-indigo" :
                    matchData.overallMatch >= 60 ? "text-semantic-warning" : "text-semantic-error"
                  )}>
                    {matchData.overallMatch >= 90 ? "Excellent Match" :
                     matchData.overallMatch >= 75 ? "Good Match" :
                     matchData.overallMatch >= 60 ? "Potential Match" : "Low Match"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>About the Role</CardTitle>
                </CardHeader>
                <CardContent className="text-brand-navy/80 leading-relaxed space-y-8 text-sm sm:text-base">
                  <div>
                    <h3 className="font-semibold text-brand-navy mb-3">Role Overview</h3>
                    <p>{job.description}</p>
                  </div>

                  {job.aboutCompany && (
                    <div>
                      <h3 className="font-semibold text-brand-navy mb-3">About the Company</h3>
                      <p>{job.aboutCompany}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-brand-navy mb-3">Responsibilities</h3>
                    <ul className="space-y-2">
                      {job.responsibilities.map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo/50 mt-2 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-brand-navy mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo/50 mt-2 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {job.additionalInfo && (
                    <div>
                      <h3 className="font-semibold text-brand-navy mb-3">Additional Information</h3>
                      <p>{job.additionalInfo}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Match Sidebar */}
          <div className="space-y-6">
            <motion.div variants={slideUp}>
              <Card className="border-brand-indigo/20 bg-brand-indigo/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 2 0 0-10 10v0a10 10 2 0 0 10 10v0a10 10 2 0 0 10-10v0a10 10 2 0 0-10-10v0Z"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-brand-indigo text-lg">Why This Job Matches You</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-brand-navy">Skills Match</span>
                        <span className="font-semibold text-brand-indigo">{matchData.skillMatch}%</span>
                      </div>
                      <div className="w-full bg-brand-gray/50 h-1.5 rounded-full"><div className="bg-brand-indigo h-full rounded-full" style={{ width: `${matchData.skillMatch}%` }}/></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-brand-navy">Experience Match</span>
                        <span className="font-semibold text-brand-indigo">{matchData.experienceMatch}%</span>
                      </div>
                      <div className="w-full bg-brand-gray/50 h-1.5 rounded-full"><div className="bg-brand-indigo h-full rounded-full" style={{ width: `${matchData.experienceMatch}%` }}/></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-brand-navy">Role Similarity</span>
                        <span className="font-semibold text-brand-indigo">{matchData.roleSimilarity}%</span>
                      </div>
                      <div className="w-full bg-brand-gray/50 h-1.5 rounded-full"><div className="bg-brand-indigo h-full rounded-full" style={{ width: `${matchData.roleSimilarity}%` }}/></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brand-indigo/10 space-y-3">
                    {matchData.explanation.strengths.map((str, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-brand-navy/80">
                        <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>

                  {matchData.explanation.improvements.length > 0 && (
                    <div className="pt-2 space-y-3">
                      <p className="text-sm font-semibold text-brand-navy">Areas to Improve</p>
                      {matchData.explanation.improvements.map((str, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-brand-navy/80">
                          <AlertTriangle className="w-4 h-4 text-semantic-warning shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Skill Match Visualization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-brand-navy mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-semantic-success" /> Your Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {matchData.matchedSkills.map(s => (
                        <Badge key={s} variant="success" className="bg-semantic-success/10 text-semantic-success hover:bg-semantic-success/20">{s} ✓</Badge>
                      ))}
                      {matchData.matchedSkills.length === 0 && <p className="text-xs text-brand-navy/50">None matched</p>}
                    </div>
                  </div>
                  
                  {matchData.missingSkills.length > 0 && (
                    <div className="pt-2">
                      <p className="text-sm font-medium text-brand-navy mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-semantic-warning" /> Missing Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {matchData.missingSkills.map(s => (
                          <Badge key={s} variant="secondary" className="bg-brand-gray/50 text-brand-navy/50 line-through opacity-70 hover:opacity-100 transition-opacity">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Application Modal */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm"
              onClick={closeApplyModal}
            />
            <MotionSpotlightCard 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="glass-card relative w-full max-w-lg overflow-hidden z-10"
            >
              {isSuccess ? (
                <div className="p-10 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-semantic-success/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-semantic-success" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-brand-navy mb-2">Application Submitted ✓</h3>
                  <p className="text-brand-navy/60 mb-8">Your application for {job.title} at {job.company} has been successfully submitted.</p>
                  <Button className="w-full" onClick={() => navigate("/candidate/applications")}>
                    View Applications
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-6 border-b border-brand-gray/50">
                    <h3 className="text-lg font-display font-semibold text-brand-navy">Apply for {job.title}</h3>
                    <button onClick={closeApplyModal} className="text-brand-navy/40 hover:text-brand-navy transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Resume Info */}
                    <div className="p-4 bg-brand-light rounded-xl border border-brand-gray/50">
                      <p className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-3">Primary Resume</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-indigo/10 rounded-lg">
                            <UploadCloud className="w-5 h-5 text-brand-indigo" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-brand-navy">Rahul_Kumar_Resume.pdf</p>
                            <p className="text-xs text-brand-navy/60">Parsed by HireSmart AI</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-brand-indigo">{mockResumeAnalysis.score}% Profile Score</p>
                          <p className="text-xs font-semibold text-semantic-success">{matchData.overallMatch}% Job Match</p>
                        </div>
                      </div>
                    </div>

                    {/* Cover Note */}
                    <div>
                      <label className="block text-sm font-medium text-brand-navy mb-2">Optional cover note</label>
                      <textarea 
                        className="w-full border border-brand-gray/80 rounded-xl p-3 text-sm focus:border-brand-indigo outline-none transition-colors resize-none"
                        rows={4}
                        placeholder="Add a short note to the recruiter..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="p-6 border-t border-brand-gray/50 bg-brand-light/50 flex gap-3 justify-end">
                    <Button variant="outline" onClick={closeApplyModal} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button onClick={handleApply} disabled={isSubmitting} className="min-w-[140px]">
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting...
                        </div>
                      ) : "Submit Application"}
                    </Button>
                  </div>
                </>
              )}
            </MotionSpotlightCard>
          </div>
        )}
      </AnimatePresence>

    </DashboardShell>
  )
}
