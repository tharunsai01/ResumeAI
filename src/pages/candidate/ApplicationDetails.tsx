import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Building, MapPin, DollarSign, Briefcase, CheckCircle2, AlertTriangle, FileText } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"
import { Button } from "../../components/ui/Button"
import { MatchScore } from "../../components/shared/MatchScore"
import { useJobActions } from "../../hooks/useJobActions"
import { mockResumeAnalysis } from "../../data/mockResume"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"
import { jobService } from "../../services/jobService"
import type { JobMatchResult } from "../../services/jobService"
import SpotlightCard from "../../components/ui/SpotlightCard";

let MotionSpotlightCard = motion.create ? motion.create(SpotlightCard) : motion(SpotlightCard);

export default function CandidateApplicationDetails() {
  const { applicationId } = useParams<{ applicationId: string }>()
  const navigate = useNavigate()
  
  const { getApplication, updateApplicationNote, withdrawApplication } = useJobActions()
  const application = getApplication(applicationId || "")

  const [loading, setLoading] = React.useState(true)
  const [matchData, setMatchData] = React.useState<JobMatchResult | null>(null)
  
  const [noteContent, setNoteContent] = React.useState(application?.notes || "")
  const [isSavingNote, setIsSavingNote] = React.useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = React.useState(false)

  React.useEffect(() => {
    const fetchMatchDetails = async () => {
      if (application) {
        setNoteContent(application.notes)
        const job = await jobService.getJobById(application.id)
        if (job) {
          const match = jobService.calculateJobMatch(mockResumeAnalysis, job)
          setMatchData(match)
        }
      }
      setLoading(false)
    }
    fetchMatchDetails()
  }, [application])

  const handleSaveNote = async () => {
    if (!application) return
    setIsSavingNote(true)
    // Simulate fetching
    updateApplicationNote(application.applicationId, noteContent)
    setIsSavingNote(false)
  }

  const handleWithdraw = async () => {
    if (!application) return
    withdrawApplication(application.applicationId)
    setShowWithdrawModal(false)
  }

  if (loading) {
    return (
      <DashboardShell type="candidate" userName={mockResumeAnalysis.personalInfo.name}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-indigo/30 border-t-brand-indigo" />
            <p className="text-brand-navy/60 font-medium">Loading application...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!application || !matchData) {
    return (
      <DashboardShell type="candidate" userName={mockResumeAnalysis.personalInfo.name}>
        <div className="text-center p-12">
          <h2 className="text-xl font-display font-semibold text-brand-navy">Application not found</h2>
          <Button className="mt-4" onClick={() => navigate("/candidate/applications")}>Back to Applications</Button>
        </div>
      </DashboardShell>
    )
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "Applied": return <Badge variant="secondary" className="bg-brand-blue/10 text-brand-blue border-brand-blue/20">Applied</Badge>
      case "Under Review": return <Badge variant="secondary" className="bg-brand-violet/10 text-brand-violet border-brand-violet/20">Under Review</Badge>
      case "Shortlisted": return <Badge variant="success" className="bg-semantic-success/20 text-semantic-success border-semantic-success/30">Shortlisted</Badge>
      case "Interview": return <Badge variant="secondary" className="bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20">Interview</Badge>
      case "Offer": return <Badge variant="success" className="bg-semantic-success/20 text-semantic-success border-semantic-success/30">Offer</Badge>
      case "Rejected": return <Badge variant="secondary" className="bg-semantic-error/10 text-semantic-error border-semantic-error/20">Rejected</Badge>
      case "Withdrawn": return <Badge variant="secondary" className="bg-brand-gray/50 text-brand-navy/60 border-brand-gray">Withdrawn</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })
  const isWithdrawn = application.status === "Withdrawn"

  return (
    <DashboardShell type="candidate" userName={mockResumeAnalysis.personalInfo.name}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-5xl mx-auto space-y-6 pb-12">
        
        {/* Navigation */}
        <motion.div variants={slideUp} className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/candidate/applications")}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-brand-gray/50 text-brand-navy/60 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Applications
          </button>
        </motion.div>

        {/* Header Hero */}
        <motion.div variants={slideUp}>
          <Card className="overflow-hidden border-brand-gray/50 shadow-sm relative">
            <div className={cn(
              "absolute top-0 left-0 w-full h-2",
              isWithdrawn ? "bg-brand-gray" : "bg-gradient-to-r from-brand-indigo to-brand-blue"
            )} />
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className={cn("text-2xl sm:text-3xl font-display font-bold", isWithdrawn ? "text-brand-navy/50" : "text-brand-navy")}>{application.title}</h1>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-brand-navy/70 mb-6">
                    <div className="flex items-center font-medium">
                      <Building className="w-4 h-4 mr-1.5 opacity-70" /> {application.company}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1.5 opacity-70" /> {application.location}
                    </div>
                    <div className="flex items-center font-medium">
                      <DollarSign className="w-4 h-4 mr-1.5 opacity-70" /> {application.salary}
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1.5 opacity-70" /> {application.type}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/candidate/jobs/${application.id}`)}
                    >
                      View Original Job
                    </Button>
                    {!isWithdrawn && application.status !== "Rejected" && application.status !== "Offer" && (
                      <Button 
                        variant="ghost"
                        className="text-semantic-error hover:text-semantic-error hover:bg-semantic-error/10"
                        onClick={() => setShowWithdrawModal(true)}
                      >
                        Withdraw Application
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-brand-light rounded-xl border border-brand-gray/50 shrink-0 min-w-[160px] opacity-90">
                  <MatchScore score={application.matchScore} size="lg" />
                  <p className="font-semibold text-sm mt-3 text-brand-navy/80">
                    Match Score
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Timeline */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Application Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6 space-y-8">
                    {/* Vertical line connecting timeline dots */}
                    <div className="absolute top-2 bottom-2 left-[11px] w-px bg-brand-gray" />
                    
                    {application.timeline.map((event, idx) => {
                      const isLast = idx === application.timeline.length - 1
                      return (
                        <div key={idx} className="relative">
                          {/* Dot */}
                          <div className={cn(
                            "absolute -left-6 w-3.5 h-3.5 rounded-full border-2 bg-white",
                            isLast && !isWithdrawn ? "border-brand-indigo ring-4 ring-brand-indigo/20" : 
                            isWithdrawn && isLast ? "border-brand-gray/60 bg-brand-gray" : "border-semantic-success bg-semantic-success"
                          )} />
                          
                          <div className="flex justify-between items-start">
                            <div>
                              <p className={cn(
                                "font-medium",
                                isLast && !isWithdrawn ? "text-brand-indigo font-semibold" : "text-brand-navy"
                              )}>
                                {event.status === "Applied" ? "Application Submitted" :
                                 event.status === "Under Review" ? "Resume Reviewed" :
                                 event.status === "Interview" ? "Interview Scheduled" :
                                 event.status === "Offer" ? "Offer Extended" : event.status}
                              </p>
                              <p className="text-sm text-brand-navy/60">{formatDate(event.date)}</p>
                            </div>
                            
                            {isLast && !isWithdrawn && application.status !== "Rejected" && (
                              <Badge variant="outline" className="bg-brand-indigo/5 text-brand-indigo border-brand-indigo/20">Current</Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Anticipated future steps if still active */}
                    {!isWithdrawn && application.status !== "Offer" && application.status !== "Rejected" && (
                      <div className="relative opacity-40">
                        <div className="absolute -left-6 w-3.5 h-3.5 rounded-full border-2 border-brand-gray/50 bg-white" />
                        <p className="font-medium text-brand-navy/60">
                          {application.status === "Applied" ? "Resume Review" : 
                           application.status === "Under Review" || application.status === "Shortlisted" ? "Interview" : "Offer"}
                        </p>
                        <p className="text-sm text-brand-navy/40">Anticipated step</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Summary */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Why You Matched</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-brand-navy/60 font-medium">Skills</p>
                      <p className="text-xl font-display font-semibold text-brand-indigo">{matchData.skillMatch}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-brand-navy/60 font-medium">Experience</p>
                      <p className="text-xl font-display font-semibold text-brand-indigo">{matchData.experienceMatch}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-brand-navy/60 font-medium">Education</p>
                      <p className="text-xl font-display font-semibold text-brand-indigo">{matchData.educationMatch}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-brand-navy/60 font-medium">Role</p>
                      <p className="text-xl font-display font-semibold text-brand-indigo">{matchData.roleSimilarity}%</p>
                    </div>
                  </div>
                  
                  <div className="bg-semantic-success/10 border border-semantic-success/20 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-semantic-success shrink-0 mt-0.5" />
                    <p className="text-sm text-brand-navy font-medium">
                      Your profile is strongly aligned with this position. {matchData.explanation.strengths[0]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            {/* Resume Used */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Resume Used</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-brand-light rounded-xl border border-brand-gray/50">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-brand-indigo/10 rounded-lg shrink-0">
                        <FileText className="w-5 h-5 text-brand-indigo" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-navy break-all">Rahul_Kumar_Resume.pdf</p>
                        <p className="text-xs text-brand-navy/60 mt-1">Profile Score: {mockResumeAnalysis.score}%</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/candidate/resume")}>
                    View Resume
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notes */}
            <motion.div variants={slideUp}>
              <Card>
                <CardHeader>
                  <CardTitle>Application Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <textarea 
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Add private notes about this application (e.g. follow-up dates, interviewer names)..."
                    className="w-full h-32 bg-brand-light border border-brand-gray/50 rounded-xl p-3 text-sm text-brand-navy placeholder:text-brand-navy/40 outline-none focus:border-brand-indigo transition-colors resize-none"
                  />
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      onClick={handleSaveNote} 
                      disabled={isSavingNote || noteContent === application.notes}
                    >
                      {isSavingNote ? "Saving..." : "Save Note"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm"
              onClick={() => setShowWithdrawModal(false)}
            />
            <MotionSpotlightCard 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="glass-card relative w-full max-w-md overflow-hidden z-10"
            >
              <div className="p-6 sm:p-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-semantic-error/10 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="w-8 h-8 text-semantic-error" />
                </div>
                <h3 className="text-xl font-display font-semibold text-brand-navy mb-2">Withdraw application?</h3>
                <p className="text-brand-navy/60 mb-8 text-sm">
                  Are you sure you want to withdraw your application for <span className="font-semibold text-brand-navy">{application.title}</span> at <span className="font-semibold text-brand-navy">{application.company}</span>? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1" onClick={() => setShowWithdrawModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" className="flex-1 bg-semantic-error hover:bg-semantic-error/90" onClick={handleWithdraw}>
                    Withdraw
                  </Button>
                </div>
              </div>
            </MotionSpotlightCard>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
