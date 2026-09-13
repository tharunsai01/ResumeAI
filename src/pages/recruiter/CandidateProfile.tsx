import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Mail, MapPin, Briefcase, CheckCircle2, XCircle, Calendar, Sparkles, ChevronLeft, Download, AlertCircle } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { applicationService, type Application, type ApplicationStatus } from "../../services/applicationService"
import { jobService } from "../../services/jobService"
import { interviewService } from "../../services/interviewService"
import { mockCandidates } from "../../data/mockCandidates"
import type { Job } from "../../data/mockJobs"
import { staggerContainer, slideUp } from "../../lib/animations"
import { cn } from "../../lib/utils"

export default function RecruiterCandidateProfile() {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = React.useState(true)
  const [app, setApp] = React.useState<Application | null>(null)
  const [candidate, setCandidate] = React.useState<typeof mockCandidates[0] | null>(null)
  const [job, setJob] = React.useState<Job | null>(null)
  
  const [isInterviewModalOpen, setIsInterviewModalOpen] = React.useState(false)
  const [interviewData, setInterviewData] = React.useState({
    date: "",
    time: "",
    type: "Technical" as const,
    meetingLink: "",
    notes: ""
  })

  React.useEffect(() => {
    const fetchData = async () => {
      if (!candidateId) return
      // We pass the application ID in the URL as candidateId for the route /recruiter/candidates/:applicationId
      const application = applicationService.getApplication(candidateId)
      if (application) {
        setApp(application)
        setCandidate(mockCandidates.find(c => c.id === application.candidateId) || null)
        const jobData = await jobService.getJobById(application.jobId)
        setJob(jobData || null)
      }
      setLoading(false)
    }
    fetchData()
  }, [candidateId])

  const handleUpdateStatus = (status: ApplicationStatus) => {
    if (!app) return
    applicationService.updateApplicationStatus(app.id, status)
    setApp({ ...app, status, timeline: [...app.timeline, { status, date: new Date().toISOString() }] })
  }

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!app || !candidate || !job) return
    
    interviewService.scheduleInterview({
      applicationId: app.id,
      jobId: job.id,
      candidateId: candidate.id,
      ...interviewData
    })
    
    handleUpdateStatus("Interview")
    setIsInterviewModalOpen(false)
  }

  if (loading) return <DashboardShell type="recruiter"><div className="p-8 text-center">Loading...</div></DashboardShell>
  if (!app || !candidate || !job) return <DashboardShell type="recruiter"><div className="p-8 text-center text-semantic-error">Candidate not found</div></DashboardShell>

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto pb-12 space-y-6">
        
        {/* Header */}
        <motion.div variants={slideUp} className="flex items-start gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-brand-gray/50 transition-colors text-brand-navy/60 mt-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-brand-indigo/10 flex items-center justify-center text-brand-indigo font-display text-2xl font-bold border border-brand-indigo/20">
                  {candidate.personalInfo.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-display font-semibold text-brand-navy">{candidate.personalInfo.name}</h1>
                  <p className="text-brand-navy/60 mt-1 flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> Applied for: {job.title}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {candidate.personalInfo.location}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {app.status === "Applied" || app.status === "AI Screened" ? (
                  <>
                    <Button variant="outline" className="border-semantic-error text-semantic-error hover:bg-semantic-error/10" onClick={() => handleUpdateStatus("Rejected")}>
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                    <Button className="bg-semantic-warning hover:bg-semantic-warning/90 text-white" onClick={() => handleUpdateStatus("Shortlisted")}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Shortlist
                    </Button>
                  </>
                ) : app.status === "Shortlisted" ? (
                  <>
                    <Button variant="outline" onClick={() => handleUpdateStatus("Rejected")}>Reject</Button>
                    <Button onClick={() => setIsInterviewModalOpen(true)}>
                      <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
                    </Button>
                  </>
                ) : app.status === "Interview" ? (
                  <>
                    <Button variant="outline" onClick={() => handleUpdateStatus("Rejected")}>Reject</Button>
                    <Button className="bg-semantic-success hover:bg-semantic-success/90" onClick={() => handleUpdateStatus("Offer")}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Move to Offer
                    </Button>
                  </>
                ) : (
                  <span className="px-4 py-2 rounded-xl bg-brand-light text-brand-navy font-semibold">
                    Current Status: {app.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <motion.div variants={slideUp} className="lg:col-span-2 space-y-6">
            
            {/* AI Analysis */}
            {app.aiScreening && (
              <Card className="border-brand-indigo/30 shadow-[0_4px_20px_-10px_rgba(79,70,229,0.15)] overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-brand-indigo to-brand-blue" />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-brand-indigo">
                    <Sparkles className="w-5 h-5" /> AI Candidate Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex flex-col items-center justify-center p-6 bg-brand-light/50 rounded-2xl border border-brand-indigo/10 flex-1">
                      <span className="text-sm font-semibold text-brand-navy/60 uppercase tracking-wider mb-2">Overall Match</span>
                      <span className={cn(
                        "text-5xl font-bold",
                        app.matchScore >= 85 ? "text-semantic-success" : 
                        app.matchScore >= 70 ? "text-semantic-warning" : "text-semantic-error"
                      )}>
                        {app.matchScore}%
                      </span>
                    </div>
                    
                    <div className="flex-1 space-y-3 justify-center flex flex-col">
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1 text-brand-navy">
                          <span>Skill Match</span>
                          <span>{app.aiScreening.skillMatch}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-brand-gray/30 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-indigo rounded-full" style={{ width: `${app.aiScreening.skillMatch}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1 text-brand-navy">
                          <span>Experience Match</span>
                          <span>{app.aiScreening.experienceMatch}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-brand-gray/30 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-indigo rounded-full" style={{ width: `${app.aiScreening.experienceMatch}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1 text-brand-navy">
                          <span>Education Match</span>
                          <span>{app.aiScreening.educationMatch}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-brand-gray/30 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-indigo rounded-full" style={{ width: `${app.aiScreening.educationMatch}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-semantic-success/5 rounded-xl border border-semantic-success/20">
                      <h4 className="font-semibold text-semantic-success flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4" /> Strengths
                      </h4>
                      <ul className="text-sm text-brand-navy/70 space-y-1 list-disc pl-4">
                        {app.aiScreening.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="p-4 bg-semantic-warning/5 rounded-xl border border-semantic-warning/20">
                      <h4 className="font-semibold text-semantic-warning flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4" /> Missing / Needs Review
                      </h4>
                      <ul className="text-sm text-brand-navy/70 space-y-1 list-disc pl-4">
                        {app.aiScreening.missingSkills.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="text-xs text-brand-navy/40 flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>AI-generated recommendation. This score is generated from available resume and job information. It may contain errors and should not be used as the sole basis for hiring decisions.</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resume Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Professional Summary</CardTitle>
                <Button variant="ghost" size="sm" className="text-brand-indigo">
                  <Download className="w-4 h-4 mr-2" /> Resume
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-brand-navy/70 text-sm leading-relaxed mb-6">{candidate.summary}</p>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-brand-navy mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {[...candidate.skills.languages, ...candidate.skills.frameworks, ...candidate.skills.tools].map(s => (
                        <span key={s} className="px-2.5 py-1 bg-brand-light border border-brand-gray/50 rounded-md text-xs font-medium text-brand-navy">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-brand-navy mb-3">Experience</h3>
                    <div className="space-y-4">
                      {candidate.experience.map((exp, i) => (
                        <div key={i} className="border-l-2 border-brand-gray/50 pl-4 pb-2">
                          <h4 className="font-semibold text-brand-navy">{exp.role}</h4>
                          <p className="text-sm text-brand-navy/60 mb-2">{exp.company} • {exp.duration}</p>
                          <ul className="text-sm text-brand-navy/70 space-y-1 list-disc pl-4">
                            {exp.highlights.map((h, j) => <li key={j}>{h}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </motion.div>

          <motion.div variants={slideUp} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-brand-navy/70">
                  <Mail className="w-4 h-4 text-brand-navy/40" />
                  <a href={`mailto:${candidate.personalInfo.email}`} className="hover:text-brand-indigo transition-colors">{candidate.personalInfo.email}</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-brand-navy/70">
                  <User className="w-4 h-4 text-brand-navy/40" />
                  {candidate.personalInfo.phone}
                </div>
                <div className="flex items-center gap-3 text-sm text-brand-navy/70">
                  <Briefcase className="w-4 h-4 text-brand-navy/40" />
                  <a href={`https://${candidate.personalInfo.linkedin}`} target="_blank" rel="noreferrer" className="hover:text-brand-indigo transition-colors">{candidate.personalInfo.linkedin}</a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-brand-gray/50 before:to-transparent">
                  {app.timeline.map((event, index) => (
                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-brand-light bg-brand-indigo text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-[-9px] md:ml-0"></div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-brand-gray/30 bg-white shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-brand-navy text-sm">{event.status}</h4>
                        </div>
                        <time className="text-xs text-brand-navy/50">{new Date(event.date).toLocaleDateString()}</time>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Schedule Interview Modal */}
      <AnimatePresence>
        {isInterviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInterviewModalOpen(false)}
              className="absolute inset-0 bg-brand-navy/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <form onSubmit={handleScheduleInterview}>
                <div className="p-6 border-b border-brand-gray/30">
                  <h2 className="text-xl font-display font-semibold text-brand-navy">Schedule Interview</h2>
                  <p className="text-sm text-brand-navy/60 mt-1">Set up a meeting with {candidate.personalInfo.name}</p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={interviewData.date}
                      onChange={e => setInterviewData({...interviewData, date: e.target.value})}
                      className="w-full bg-brand-light border border-brand-gray/50 rounded-xl px-4 py-2 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1">Time</label>
                    <input 
                      type="time" 
                      required
                      value={interviewData.time}
                      onChange={e => setInterviewData({...interviewData, time: e.target.value})}
                      className="w-full bg-brand-light border border-brand-gray/50 rounded-xl px-4 py-2 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1">Interview Type</label>
                    <select 
                      value={interviewData.type}
                      onChange={e => setInterviewData({...interviewData, type: e.target.value as any})}
                      className="w-full bg-brand-light border border-brand-gray/50 rounded-xl px-4 py-2 outline-none"
                    >
                      <option>Technical</option>
                      <option>HR</option>
                      <option>Managerial</option>
                      <option>Final</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1">Meeting Link (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="https://zoom.us/j/..."
                      value={interviewData.meetingLink}
                      onChange={e => setInterviewData({...interviewData, meetingLink: e.target.value})}
                      className="w-full bg-brand-light border border-brand-gray/50 rounded-xl px-4 py-2 outline-none" 
                    />
                  </div>
                </div>
                <div className="p-4 bg-brand-light/50 border-t border-brand-gray/30 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsInterviewModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Schedule</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
