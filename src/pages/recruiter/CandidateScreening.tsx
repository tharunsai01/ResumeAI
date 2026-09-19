import * as React from "react"
import { motion } from "framer-motion"
import { ChevronLeft, CheckCircle2, AlertCircle, FileText, User, Calendar, Brain, X } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { staggerContainer, slideUp } from "../../lib/animations"
import { initialScreeningCandidates, jobRequirements, AI_SCREENING_THRESHOLD } from "../../data/screeningMockData"
import { CandidateMatchScore } from "./components/CandidateMatchScore"
import { RejectCandidateModal } from "./components/RejectCandidateModal"
import { cn } from "../../lib/utils"

export default function RecruiterCandidateScreening() {
  const navigate = useNavigate()
  const { jobId, candidateId } = useParams()
  
  const [candidate, setCandidate] = React.useState(initialScreeningCandidates.find(c => c.id === candidateId))
  const [loading, setLoading] = React.useState(true)
  const [candidateToReject, setCandidateToReject] = React.useState(false)
  const [shortlistMsg, setShortlistMsg] = React.useState<string | null>(null)

  const reqs = jobRequirements[jobId as keyof typeof jobRequirements] || jobRequirements["job_101"]

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

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
        <div className="flex justify-center py-24"><div className="w-8 h-8 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin" /></div>
      </DashboardShell>
    )
  }

  if (!candidate) return <DashboardShell type="recruiter" userName="Recruiter"><div className="p-12 text-center">Candidate not found</div></DashboardShell>

  const isQualified = candidate.overallMatch >= AI_SCREENING_THRESHOLD
  const recommendation = isQualified 
    ? { title: "AI Qualified", desc: "Candidate profile strongly aligns with the requirements and meets the AI screening threshold.", color: "text-semantic-success", bg: "bg-semantic-success/10", border: "border-semantic-success/30" }
    : { title: "Below Threshold", desc: "Candidate profile does not meet the minimum match threshold for automatic qualification.", color: "text-semantic-warning", bg: "bg-semantic-warning/10", border: "border-semantic-warning/30" }

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto space-y-6 pb-12">
        
        {/* HEADER & NOTIFICATION */}
        <motion.div variants={slideUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button onClick={() => navigate(`/recruiter/screening/${jobId}`)} className="flex items-center text-sm font-medium text-brand-navy/60 hover:text-brand-indigo transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Ranking
          </button>
          {shortlistMsg && (
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg border border-emerald-200 flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> {shortlistMsg}
            </div>
          )}
        </motion.div>

        {/* CANDIDATE HEADER */}
        <motion.div variants={slideUp}>
          <Card className="border-none shadow-md overflow-hidden bg-white">
            <div className="h-2 bg-gradient-to-r from-brand-indigo via-brand-blue to-transparent" />
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-brand-indigo/10 flex items-center justify-center border border-brand-indigo/20 shrink-0">
                  <span className="text-3xl font-display font-bold text-brand-indigo">
                    {candidate.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold text-brand-navy">{candidate.name}</h1>
                  <p className="text-brand-navy/60 font-medium mt-1">{candidate.role} • {candidate.experience} exp</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-4 pr-0 sm:pr-6 sm:border-r border-brand-gray/20">
                  <div className="text-right">
                    <div className="text-xs font-semibold uppercase tracking-wider text-brand-navy/50 mb-1">Overall Match</div>
                    <div className="text-2xl font-bold text-brand-indigo">{candidate.overallMatch}%</div>
                  </div>
                  <CandidateMatchScore score={candidate.overallMatch} size="lg" showLabel={false} />
                </div>
                <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto">
                  {candidate.status !== "Shortlisted" && candidate.status !== "Rejected" && (
                    isQualified ? (
                      <Button onClick={handleShortlist} className="flex-1 bg-brand-navy hover:bg-brand-navy/90 text-sm h-9">
                        Shortlist Candidate
                      </Button>
                    ) : (
                      <Button disabled className="flex-1 bg-brand-gray/20 text-brand-navy/40 cursor-not-allowed border border-brand-gray/30 text-sm h-9">
                        Below Threshold
                      </Button>
                    )
                  )}
                  {candidate.status !== "Shortlisted" && candidate.status !== "Rejected" && (
                    <Button onClick={() => setCandidateToReject(true)} variant="outline" className="flex-1 text-semantic-error border-brand-gray/40 hover:bg-semantic-error/10 text-sm h-9">
                      Reject Candidate
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => navigate(`/recruiter/candidates/${candidate.id}`)} className="flex-1 text-brand-indigo hover:bg-brand-indigo/10 text-sm h-9">
                    <User className="w-4 h-4 mr-2" /> View Full Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: MATCH BREAKDOWN & SKILLS */}
          <motion.div variants={slideUp} className="lg:col-span-2 space-y-6">
            
            {/* AI MATCH BREAKDOWN */}
            <Card>
              <CardHeader className="border-b border-brand-gray/20 bg-brand-light/30">
                <CardTitle className="flex items-center gap-2 text-brand-indigo">
                  <Brain className="w-5 h-5" /> AI Match Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {[
                    { label: "Skills Match", score: candidate.skillMatch },
                    { label: "Experience Match", score: candidate.experienceMatch },
                    { label: "Education Match", score: candidate.educationMatch },
                    { label: "Role Similarity", score: candidate.roleSimilarity },
                    { label: "Keyword Alignment", score: candidate.keywordMatch }
                  ].map(stat => (
                    <div key={stat.label}>
                      <div className="flex justify-between text-sm font-semibold text-brand-navy mb-2">
                        <span>{stat.label}</span>
                        <span className={cn(
                          stat.score >= 90 ? "text-semantic-success" : stat.score >= 75 ? "text-semantic-warning" : "text-semantic-error"
                        )}>{stat.score}%</span>
                      </div>
                      <div className="w-full bg-brand-gray/20 rounded-full h-2 overflow-hidden relative">
                        <div 
                          className={cn("absolute left-0 top-0 bottom-0 rounded-full transition-all duration-1000", 
                            stat.score >= 90 ? "bg-semantic-success" : stat.score >= 75 ? "bg-semantic-warning" : "bg-semantic-error"
                          )} 
                          style={{ width: `${stat.score}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* WHY MATCHES & GAPS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-semantic-success/20 bg-semantic-success/5 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-semantic-success text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Why this candidate matches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-brand-navy/80">
                  {candidate.matchedStrengths.map((str, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-semantic-success shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-semantic-warning/20 bg-semantic-warning/5 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-semantic-warning text-base flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> Potential Gaps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-brand-navy/80">
                  {candidate.potentialGaps.length > 0 ? candidate.potentialGaps.map((gap, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-semantic-warning shrink-0 mt-1.5" />
                      <span>{gap}</span>
                    </div>
                  )) : (
                    <div className="text-brand-navy/50 italic">No significant gaps identified.</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* REQUIRED SKILLS COMPARISON */}
            <Card>
              <CardHeader className="border-b border-brand-gray/20 bg-brand-light/30">
                <CardTitle>Required Skills vs Candidate Skills</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-semibold text-brand-navy mb-4 border-b border-brand-gray/20 pb-2">Required by Job</h4>
                    <div className="space-y-3">
                      {reqs.requiredSkills.map(skill => {
                        const cSkill = candidate.skills.find(s => s.name === skill)
                        return (
                          <div key={skill} className="flex items-center justify-between">
                            <span className="text-sm text-brand-navy">{skill}</span>
                            {cSkill?.matchType === "Matched" ? (
                              <span className="text-xs font-bold text-semantic-success flex items-center gap-1 bg-semantic-success/10 px-2 py-0.5 rounded"><CheckCircle2 className="w-3.5 h-3.5" /> Matched</span>
                            ) : cSkill?.matchType === "Partial" ? (
                              <span className="text-xs font-bold text-semantic-warning flex items-center gap-1 bg-semantic-warning/10 px-2 py-0.5 rounded"><AlertCircle className="w-3.5 h-3.5" /> Partial</span>
                            ) : (
                              <span className="text-xs font-bold text-semantic-error flex items-center gap-1 bg-semantic-error/10 px-2 py-0.5 rounded"><X className="w-3.5 h-3.5" /> Missing</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-brand-navy mb-4 border-b border-brand-gray/20 pb-2">Candidate Profile</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map(skill => (
                        <span key={skill.name} className={cn(
                          "px-2.5 py-1 text-xs font-medium rounded-md border",
                          skill.matchType === "Matched" ? "bg-semantic-success/10 border-semantic-success/20 text-semantic-success" :
                          skill.matchType === "Partial" ? "bg-semantic-warning/10 border-semantic-warning/20 text-semantic-warning" :
                          "bg-brand-gray/20 border-brand-gray/30 text-brand-navy/60"
                        )}>
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </motion.div>

          {/* RIGHT COLUMN: AI RECOMMENDATION & RESUME */}
          <motion.div variants={slideUp} className="space-y-6">
            
            {/* AI RECOMMENDATION */}
            <Card className={cn("border-2 shadow-sm", recommendation.border)}>
              <CardHeader className={cn("border-b pb-4", recommendation.border, recommendation.bg)}>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-brand-navy/50 mb-1">AI Recommendation</CardTitle>
                <div className={cn("text-xl font-display font-bold flex items-center gap-2", recommendation.color)}>
                  {recommendation.title}
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <p className="text-sm text-brand-navy/80 leading-relaxed mb-4">
                  {recommendation.desc}
                </p>
                <div className="bg-brand-gray/10 p-3 rounded-lg border border-brand-gray/20 text-xs text-brand-navy/60 italic flex items-start gap-2">
                  <Brain className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>AI recommendations are intended to support your review. Final hiring decisions remain with the recruiter.</span>
                </div>
              </CardContent>
            </Card>

            {/* RESUME ANALYSIS PREVIEW */}
            <Card>
              <CardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <CardTitle>Resume Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="bg-brand-light/50 border border-brand-gray/30 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileText className="w-5 h-5 text-brand-indigo" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-brand-navy">Resume.pdf</div>
                      <div className="text-xs text-brand-navy/50">Parsed successfully</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-navy/70">Professional Summary</span>
                    <CheckCircle2 className="w-4 h-4 text-semantic-success" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-navy/70">Experience Timeline</span>
                    <CheckCircle2 className="w-4 h-4 text-semantic-success" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-navy/70">Education Records</span>
                    <CheckCircle2 className="w-4 h-4 text-semantic-success" />
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-white text-brand-indigo border-brand-indigo/20 hover:bg-brand-indigo/5 mt-2" onClick={() => navigate(`/recruiter/candidates/${candidate.id}`)}>
                  View Full Resume
                </Button>
              </CardContent>
            </Card>

            {/* ACTION */}
            <Button onClick={() => navigate("/recruiter/interviews")} className="w-full bg-brand-light text-brand-navy border border-brand-gray/40 hover:bg-brand-gray/20 shadow-sm">
              <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
            </Button>

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
