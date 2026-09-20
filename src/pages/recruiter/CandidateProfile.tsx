import * as React from "react"
import { motion } from "framer-motion"
import { ChevronLeft, MapPin, Mail, Briefcase, Download, Eye, Calendar, Sparkles, AlertCircle, CheckCircle2, FileText } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { staggerContainer, slideUp } from "../../lib/animations"
import { initialRecruiterCandidates } from "../../data/recruiterMockData"
import type { RecruiterCandidate } from "../../data/recruiterMockData"
import { CandidateStatusBadge } from "./components/CandidateStatusBadge"
import { CandidateMatchScore } from "./components/CandidateMatchScore"
import { RejectCandidateModal } from "./components/RejectCandidateModal"
import { cn } from "../../lib/utils"

export default function RecruiterCandidateProfile() {
  const navigate = useNavigate()
  const { candidateId } = useParams()
  
  const [candidate, setCandidate] = React.useState<RecruiterCandidate | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [candidateToReject, setCandidateToReject] = React.useState<boolean>(false)
  const [shortlistMsg, setShortlistMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    const found = initialRecruiterCandidates.find(c => c.id === candidateId)
    if (found) setCandidate(found)
    setLoading(false)
  }, [candidateId])

  const handleShortlist = () => {
    if (candidate) {
      setCandidate({ ...candidate, status: "Shortlisted" })
      setShortlistMsg("Candidate shortlisted successfully.")
      setTimeout(() => setShortlistMsg(null), 3000)
    }
  }

  const handleReject = () => {
    if (candidate) {
      setCandidate({ ...candidate, status: "Rejected" })
      setCandidateToReject(false)
    }
  }

  if (loading) {
    return (
      <DashboardShell type="recruiter" userName="Recruiter">
        <div className="max-w-5xl mx-auto flex justify-center py-24 text-brand-navy/40">
          <div className="w-8 h-8 border-2 border-brand-navy/20 border-t-brand-indigo rounded-full animate-spin" />
        </div>
      </DashboardShell>
    )
  }

  if (!candidate) {
    return (
      <DashboardShell type="recruiter" userName="Recruiter">
        <div className="max-w-5xl mx-auto text-center py-20">
          <h2 className="text-2xl font-semibold text-brand-navy mb-2">Candidate not found</h2>
          <Button onClick={() => navigate("/recruiter/candidates")}>Back to Candidates</Button>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto pb-16 space-y-6">
        
        {/* TOP NAVIGATION & SUCCESS MSG */}
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button onClick={() => navigate("/recruiter/candidates")} className="flex items-center text-sm font-medium text-brand-navy/60 hover:text-brand-indigo transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Candidates
          </button>
          {shortlistMsg && (
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg border border-emerald-200 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4" /> {shortlistMsg}
            </div>
          )}
        </motion.div>

        {/* HEADER PROFILE CARD */}
        <motion.div variants={slideUp}>
          <Card className="overflow-hidden border-none shadow-md">
            <div className="h-24 w-full bg-gradient-to-r from-brand-indigo via-brand-blue to-brand-navy/80" />
            <CardContent className="px-6 pb-6 pt-0 relative sm:flex justify-between items-end gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-10 mb-4 sm:mb-0 relative z-10">
                <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-brand-indigo/10 to-brand-blue/10 rounded-xl flex items-center justify-center border border-brand-gray/30">
                    <span className="text-3xl font-display font-bold text-brand-indigo">
                      {candidate.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                </div>
                <div className="pb-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-navy">{candidate.name}</h1>
                    <CandidateStatusBadge status={candidate.status} />
                  </div>
                  <div className="text-base font-medium text-brand-navy/80">{candidate.title}</div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-brand-navy/60 pt-1">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {candidate.location}</span>
                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {candidate.email}</span>
                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {candidate.experience} exp.</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0">
                {candidate.status !== "Rejected" && candidate.status !== "Shortlisted" && (
                  <Button variant="outline" className="text-semantic-error hover:bg-semantic-error/5 hover:text-semantic-error border-brand-gray/40 bg-white" onClick={() => setCandidateToReject(true)}>
                    Reject
                  </Button>
                )}
                {candidate.status !== "Shortlisted" && (
                  <Button variant="outline" className="bg-white border-brand-gray/40 hover:bg-brand-light text-brand-navy" onClick={handleShortlist}>
                    Shortlist
                  </Button>
                )}
                <Button onClick={() => navigate("/recruiter/interviews")} className="bg-gradient-to-r from-brand-indigo to-brand-blue shadow-sm">
                  <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* MAIN CONTENT COLUMN */}
          <motion.div variants={slideUp} className="lg:col-span-2 space-y-6">
            
            {/* OVERVIEW */}
            <Card>
              <CardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-brand-navy/80 leading-relaxed text-sm">
                  Results-driven {candidate.title} with {candidate.experience} of experience specializing in {candidate.skills.slice(0,2).map(s => s.name).join(" and ")}. 
                  Proven track record in delivering high-quality software solutions and collaborating effectively with cross-functional teams.
                  Passionate about continuous learning and adopting new technologies to solve complex problems.
                </p>
              </CardContent>
            </Card>

            {/* EXPERIENCE */}
            <Card>
              <CardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <CardTitle>Experience</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {candidate.experience === "Fresher" ? (
                  <div className="text-sm text-brand-navy/60 italic">No professional experience listed.</div>
                ) : (
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-indigo/20 before:via-brand-blue/20 before:to-transparent">
                    {/* Mock static experience entries for visual structure */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-brand-indigo bg-white text-brand-indigo shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-brand-light p-4 rounded-xl border border-brand-gray/30 shadow-sm ml-4 md:ml-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-brand-navy text-sm">{candidate.title}</h4>
                          <span className="text-[10px] font-medium bg-white px-2 py-0.5 rounded-full border border-brand-gray/30 text-brand-navy/70 whitespace-nowrap">Current</span>
                        </div>
                        <div className="text-xs text-brand-indigo font-medium mb-2">TechCorp Solutions</div>
                        <p className="text-xs text-brand-navy/70 leading-relaxed">
                          Spearheaded the development of core infrastructure. Reduced latency by 40% and improved overall system reliability.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PROJECTS */}
            <Card>
              <CardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <CardTitle>Projects</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {candidate.projects.map((proj, idx) => (
                  <div key={idx} className="bg-brand-light/50 p-4 rounded-xl border border-brand-gray/30">
                    <h4 className="font-semibold text-brand-navy text-sm mb-1">{proj.title}</h4>
                    <p className="text-xs text-brand-navy/70 mb-3">{proj.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map(tech => (
                        <span key={tech} className="px-2 py-0.5 bg-white text-brand-navy/70 text-[10px] font-medium rounded-md border border-brand-gray/30">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* EDUCATION */}
            <Card>
              <CardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {candidate.education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-brand-navy text-sm">{edu.degree}</h4>
                      <div className="text-xs text-brand-navy/70 mt-0.5">{edu.institution}</div>
                    </div>
                    <div className="text-xs font-medium text-brand-navy/50">{edu.year}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

          </motion.div>

          {/* SIDEBAR COLUMN */}
          <motion.div variants={slideUp} className="space-y-6">
            
            {/* AI MATCH PREVIEW */}
            <Card className="border-brand-indigo/20 shadow-[0_4px_20px_-10px_rgba(79,70,229,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-indigo/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              <CardHeader className="border-b border-brand-gray/20 bg-brand-indigo/[0.02] pb-4">
                <CardTitle className="flex items-center gap-2 text-brand-indigo">
                  <Sparkles className="w-5 h-5" /> AI Match Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm font-semibold text-brand-navy">Overall Match</div>
                    <div className="text-xs text-brand-navy/50 mt-0.5">Based on job requirements</div>
                  </div>
                  <CandidateMatchScore score={candidate.matchScore} size="lg" showLabel={false} />
                </div>
                
                <div className="space-y-3 mb-6">
                  {[
                    { label: "Skills Match", score: Math.min(100, candidate.matchScore + 4) },
                    { label: "Experience Match", score: Math.max(0, candidate.matchScore - 5) },
                    { label: "Role Similarity", score: Math.min(100, candidate.matchScore + 2) }
                  ].map(stat => (
                    <div key={stat.label}>
                      <div className="flex justify-between text-xs font-medium text-brand-navy/70 mb-1">
                        <span>{stat.label}</span>
                        <span>{stat.score}%</span>
                      </div>
                      <div className="w-full bg-brand-gray/20 rounded-full h-1.5 overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-1000", stat.score >= 80 ? "bg-semantic-success" : stat.score >= 60 ? "bg-semantic-warning" : "bg-semantic-error")} style={{ width: `${stat.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-brand-gray/20">
                  <div className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider mb-2">Key Insights</div>
                  <div className="flex items-start gap-2 text-xs text-brand-navy/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-semantic-success shrink-0 mt-0.5" />
                    <span>Strong alignment with core technical requirements.</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-brand-navy/80">
                    <AlertCircle className="w-3.5 h-3.5 text-semantic-warning shrink-0 mt-0.5" />
                    <span>Slightly less experience than ideally preferred.</span>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 bg-brand-indigo/5 border-t border-brand-gray/20">
                <Button onClick={() => navigate("/recruiter/screening")} className="w-full bg-white text-brand-indigo border-brand-indigo/20 hover:bg-brand-indigo hover:text-white transition-colors">
                  View Full AI Screening
                </Button>
              </div>
            </Card>

            {/* SKILLS */}
            <Card>
              <CardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex flex-col gap-3">
                  {candidate.skills.map(skill => (
                    <div key={skill.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-brand-navy">{skill.name}</span>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                        skill.proficiency === "Strong" ? "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20" :
                        skill.proficiency === "Intermediate" ? "bg-brand-blue/10 text-brand-blue border-brand-blue/20" :
                        "bg-brand-gray/20 text-brand-navy/60 border-brand-gray/30"
                      )}>
                        {skill.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* RESUME */}
            <Card>
              <CardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <CardTitle>Resume</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="bg-brand-light rounded-xl border border-brand-gray/30 p-4 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <FileText className="w-6 h-6 text-brand-indigo" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-brand-navy mb-0.5">{candidate.name.replace(" ", "_")}_Resume.pdf</div>
                    <div className="text-xs text-brand-navy/50">Updated {candidate.appliedDate}</div>
                  </div>
                  <div className="flex w-full gap-2 mt-2">
                    <Button variant="outline" className="flex-1 h-9 text-xs bg-white">
                      <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
                    </Button>
                    <Button variant="outline" className="flex-1 h-9 text-xs bg-white">
                      <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* APPLICATION HISTORY */}
            <Card>
              <CardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <CardTitle>Application History</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {candidate.applicationHistory.map((hist, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full mt-1.5",
                          idx === 0 ? "bg-brand-indigo" : "bg-brand-gray"
                        )} />
                        {idx !== candidate.applicationHistory.length - 1 && (
                          <div className="w-px h-full bg-brand-gray/30 my-1" />
                        )}
                      </div>
                      <div className="pb-2">
                        <div className="text-sm font-medium text-brand-navy">{hist.role}</div>
                        <div className="text-xs text-brand-navy/50 mb-1">{hist.date}</div>
                        <CandidateStatusBadge status={hist.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </motion.div>
        </div>
      </motion.div>
      
      <RejectCandidateModal
        isOpen={candidateToReject}
        candidateName={candidate?.name}
        onClose={() => setCandidateToReject(false)}
        onConfirm={handleReject}
      />
    </DashboardShell>
  )
}
