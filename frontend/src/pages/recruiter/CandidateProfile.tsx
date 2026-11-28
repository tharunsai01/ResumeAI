import * as React from "react"
import { motion } from "framer-motion"
import { ChevronLeft, MapPin, Mail, Briefcase, Download, Eye, Calendar, Sparkles, CheckCircle2, FileText } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle } from "../../components/ui/PremiumCard"
import { httpClient } from "../../services/api/httpClient"
import { Modal } from "../../components/ui/Modal"
import { Button } from "../../components/ui/Button"
import { staggerContainer, slideUp } from "../../lib/animations"
import { recruiterCandidateService } from "../../services/recruiterCandidateService"
import type { RecruiterCandidate } from "../../services/recruiterCandidateService"
import { CandidateStatusBadge } from "./components/CandidateStatusBadge"
import { CandidateMatchScore } from "./components/CandidateMatchScore"
import { cn } from "../../lib/utils"
import { RejectCandidateModal } from "./components/RejectCandidateModal"

export default function RecruiterCandidateProfile() {
  const navigate = useNavigate()
  const { candidateId } = useParams()
  
  const [candidate, setCandidate] = React.useState<RecruiterCandidate | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [candidateToReject, setCandidateToReject] = React.useState<boolean>(false)
  const [shortlistMsg, setShortlistMsg] = React.useState<string | null>(null)

  const [resumeError, setResumeError] = React.useState("")
  const [previewUrl, setPreviewUrl] = React.useState<string>()
  const [fileLoading, setFileLoading] = React.useState(false)
  React.useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  async function openResume(preview: boolean) {
    if (!candidate?.resume || fileLoading) return
    const { id, fileName } = candidate.resume
    setFileLoading(true)
    setResumeError("")
    try {
      const file = await httpClient.get<Blob>(`/resumes/${encodeURIComponent(id)}/download`, { responseType: "blob" })
      const url = URL.createObjectURL(file)
      if (preview) {
        setPreviewUrl(url)
      } else {
        const link = document.createElement("a")
        link.href = url
        link.download = fileName
        link.click()
        window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
      }
    } catch {
      setResumeError("The submitted résumé could not be opened.")
    } finally {
      setFileLoading(false)
    }
  }

  React.useEffect(() => {
    let active = true
    const refresh = () => {
      void recruiterCandidateService.fetchLiveCandidates({ candidateId }).then(items => {
        if (!active) return
        setCandidate(items.find(item => item.id === candidateId) ?? null)
        setLoading(false)
      }).catch(() => {
        if (active) {
          setCandidate(null)
          setLoading(false)
        }
      })
    }
    refresh()
    window.addEventListener("focus", refresh)
    return () => { active = false; window.removeEventListener("focus", refresh) }
  }, [candidateId])

  const [saving, setSaving] = React.useState(false)
  const changeStatus = async (status: "Shortlisted" | "Rejected") => {
    if (!candidate || saving) return
    setSaving(true)
    try {
      const updated = await recruiterCandidateService.setApplicationStatus(candidate, status)
      setCandidate(updated)
      setCandidateToReject(false)
      setShortlistMsg(`Application ${status.toLowerCase()} successfully.`)
    } catch (error) {
      setShortlistMsg(error instanceof Error ? error.message : "Couldn’t update the application.")
    } finally {
      setSaving(false)
      setTimeout(() => setShortlistMsg(null), 3000)
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
          <PremiumCard className="overflow-hidden border-none shadow-md">
            <div className="h-12 w-full bg-gradient-to-r from-brand-indigo via-brand-blue to-brand-navy/80" />
            <PremiumCardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 sm:pt-5 relative flex flex-col md:flex-row justify-between md:items-end gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5 mb-2 sm:mb-0 relative z-10 min-w-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1.5 shadow-lg shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-brand-indigo/10 to-brand-blue/10 rounded-xl flex items-center justify-center border border-brand-gray/30">
                    <span className="text-2xl sm:text-3xl font-display font-bold text-brand-indigo">
                      {candidate.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                </div>
                <div className="pb-1 space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-brand-navy break-words">{candidate.name}</h1>
                    <CandidateStatusBadge status={candidate.status} />
                  </div>
                  <div className="text-sm sm:text-base font-medium text-brand-navy/80 break-words">{candidate.title}</div>
                  {candidate.applicationId && <p className="text-sm text-brand-navy/70">Application for {candidate.appliedRole}</p>}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-brand-navy/60 pt-1">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {candidate.location}</span>
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {candidate.email}</span>
                    <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> {candidate.experience}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0">
                {["Applied", "Screening"].includes(candidate.status) && (
                  <Button variant="outline" className="w-full sm:w-auto text-semantic-error hover:bg-semantic-error/5 hover:text-semantic-error border-brand-gray/40 bg-white" onClick={() => setCandidateToReject(true)}>
                    Reject
                  </Button>
                )}
                {["Applied", "Screening"].includes(candidate.status) && (
                  <Button variant="outline" className="w-full sm:w-auto bg-white border-brand-gray/40 hover:bg-brand-light text-brand-navy" disabled={saving} onClick={() => void changeStatus("Shortlisted")}>
                    Shortlist
                  </Button>
                )}
                {["Hired", "Rejected", "Withdrawn"].includes(candidate.status) ? (
                  <Button variant="outline" onClick={() => navigate("/recruiter/hiring")}>View Hiring Pipeline</Button>
                ) : (
                <Button onClick={() => navigate("/recruiter/interviews", { state: { applicationId: candidate.applicationId } })} className="w-full sm:w-auto bg-gradient-to-r from-brand-indigo to-brand-blue shadow-sm">
                  <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
                </Button>
                )}
              </div>
            </PremiumCardContent>
          </PremiumCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 items-start gap-4">
          {/* MAIN CONTENT COLUMN */}
          <motion.div variants={slideUp} className="lg:col-span-2 space-y-6">
            
            {/* OVERVIEW */}
            <PremiumCard style={{ height: "auto" }}>
              <PremiumCardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <PremiumCardTitle>Professional Summary</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="p-4 sm:p-6">
                <p className="text-brand-navy/80 leading-relaxed text-sm">
                  {candidate.summary || "No summary was extracted from the submitted résumé."}
                </p>
              </PremiumCardContent>
            </PremiumCard>

            {/* EXPERIENCE */}
            <PremiumCard style={{ height: "auto" }}>
              <PremiumCardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <PremiumCardTitle>Experience</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="p-4 sm:p-6">
                {!candidate.workHistory?.length ? (
                  <p className="text-sm text-brand-navy/60">No experience section was extracted from the submitted résumé.</p>
                ) : (
                  <ul className="space-y-3 text-sm text-brand-navy/80">
                    {candidate.workHistory.map((entry, idx) => (
                      <li key={idx} className="rounded-lg border border-brand-gray/30 p-3">
                        {typeof entry === "string" ? entry : (
                          <>
                            <h4 className="font-semibold">{entry.title}</h4>
                            <p className="text-brand-navy/70">{[entry.company, entry.duration].filter(Boolean).join(" · ")}</p>
                            {Array.isArray(entry.description) && entry.description.map((line, index) => <p key={index} className="mt-1">{line}</p>)}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </PremiumCardContent>
            </PremiumCard>

            {/* PROJECTS */}
            <PremiumCard style={{ height: "auto" }}>
              <PremiumCardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <PremiumCardTitle>Projects</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="p-4 sm:p-6 space-y-4">
                {!candidate.projects.length && !candidate.projectText?.length && (
                  <p className="text-sm text-brand-navy/60">No projects section was extracted from the submitted résumé.</p>
                )}
                {!!candidate.projectText?.length && (
                  <ul className="space-y-2 text-sm text-brand-navy/80">
                    {candidate.projectText.map((line, index) => <li key={index}>{line}</li>)}
                  </ul>
                )}
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
              </PremiumCardContent>
            </PremiumCard>

            {/* EDUCATION */}
            <PremiumCard style={{ height: "auto" }}>
              <PremiumCardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <PremiumCardTitle>Education</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="p-4 sm:p-6 space-y-4">
                {!candidate.education.length && <p className="text-sm text-brand-navy/60">No education was extracted.</p>}
                {candidate.education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-brand-navy text-sm">{edu.degree}</h4>
                      <div className="text-xs text-brand-navy/70 mt-0.5">{edu.institution}</div>
                    </div>
                    <div className="text-xs font-medium text-brand-navy/50">{edu.year}</div>
                  </div>
                ))}
              </PremiumCardContent>
            </PremiumCard>

          </motion.div>

          {/* SIDEBAR COLUMN */}
          <motion.div variants={slideUp} className="space-y-6">
            
            {/* AI MATCH PREVIEW */}
            <PremiumCard style={{ height: "auto" }} className="border-brand-indigo/20 shadow-[0_4px_20px_-10px_rgba(79,70,229,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-indigo/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              <PremiumCardHeader className="border-b border-brand-gray/20 bg-brand-indigo/[0.02] pb-4">
                <PremiumCardTitle className="flex items-center gap-2 text-brand-indigo">
                  <Sparkles className="w-5 h-5" /> AI Match Preview
                </PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-sm font-semibold text-brand-navy">Overall Match</div>
                    <div className="text-xs text-brand-navy/50 mt-0.5">Based on job requirements</div>
                  </div>
                  {candidate.hasMatchScore !== false ? <CandidateMatchScore score={candidate.matchScore} size="lg" showLabel={false} /> : <span className="text-sm text-brand-navy/60">Awaiting score</span>}
                </div>
                
              </PremiumCardContent>
              <div className="p-4 bg-brand-indigo/5 border-t border-brand-gray/20">
                <Button onClick={() => navigate("/recruiter/screening")} className="w-full bg-white text-brand-indigo border-brand-indigo/20 hover:bg-brand-indigo hover:text-white transition-colors">
                  View Full AI Screening
                </Button>
              </div>
            </PremiumCard>

            {/* SKILLS */}
            <PremiumCard style={{ height: "auto" }}>
              <PremiumCardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <PremiumCardTitle>Skills & Expertise</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="p-5">
                <div className="flex flex-col gap-3">
                  {!candidate.skills.length && <p className="text-sm text-brand-navy/60">No skills were extracted.</p>}
                  {candidate.skills.map(skill => (
                    <div key={skill.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-brand-navy">{skill.name}</span>

                    </div>
                  ))}
                </div>
              </PremiumCardContent>
            </PremiumCard>

            {/* RESUME */}
            <PremiumCard style={{ height: "auto" }}>
              <PremiumCardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <PremiumCardTitle>Resume</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="p-5">
                {candidate.resume ? (
                  <div className="rounded-xl border border-brand-gray/30 bg-brand-light p-4">
                    <p className="flex items-center gap-2 break-all text-sm font-semibold">
                      <FileText className="h-5 w-5 shrink-0 text-brand-indigo" /> {candidate.resume.fileName}
                    </p>
                    <p className="mt-1 text-xs text-brand-navy/60">Submitted with this application</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {candidate.resume.mimeType === "application/pdf" && (
                        <Button variant="outline" size="sm" disabled={fileLoading} onClick={() => void openResume(true)}>
                          <Eye className="mr-1.5 h-4 w-4" /> Preview
                        </Button>
                      )}
                      <Button variant="outline" size="sm" disabled={fileLoading} onClick={() => void openResume(false)}>
                        <Download className="mr-1.5 h-4 w-4" /> Download
                      </Button>
                    </div>
                    {resumeError && <p role="alert" className="mt-2 text-sm text-semantic-error">{resumeError}</p>}
                  </div>
                ) : <p className="text-sm text-brand-navy/60">The original upload is unavailable for this application.</p>}
                <Modal isOpen={!!previewUrl} onClose={() => setPreviewUrl(undefined)} title={candidate.resume?.fileName} className="max-w-5xl">
                  {previewUrl && <iframe title="Submitted résumé preview" src={previewUrl} className="h-[65vh] w-full rounded-lg border" />}
                </Modal>
              </PremiumCardContent>
            </PremiumCard>

            {/* APPLICATION HISTORY */}
            <PremiumCard style={{ height: "auto" }}>
              <PremiumCardHeader className="border-b border-brand-gray/20 bg-brand-light/30 pb-4">
                <PremiumCardTitle>Application History</PremiumCardTitle>
              </PremiumCardHeader>
              <PremiumCardContent className="p-5">
                <div className="space-y-4">
                  {candidate.applicationHistory.map((hist, idx) => (
                    <div key={hist.id || idx} className="flex gap-3">
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
              </PremiumCardContent>
            </PremiumCard>

          </motion.div>
        </div>
      </motion.div>
      
      <RejectCandidateModal
        isOpen={candidateToReject}
        candidateName={candidate?.name}
        onClose={() => setCandidateToReject(false)}
        onConfirm={() => void changeStatus("Rejected")}
      />
    </DashboardShell>
  )
}
