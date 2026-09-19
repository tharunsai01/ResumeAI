import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Calendar as CalendarIcon, User, Briefcase, Video, FileText, CheckCircle2, AlertCircle, Star } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Modal } from "../../components/ui/Modal"
import { staggerContainer, slideUp } from "../../lib/animations"
import { initialInterviews } from "../../data/pipelineMockData"
import type { MockInterview } from "../../data/pipelineMockData"
import { ScheduleInterviewModal } from "./components/ScheduleInterviewModal"
import { cn } from "../../lib/utils"

export default function RecruiterInterviewDetails() {
  const navigate = useNavigate()
  const { interviewId } = useParams()
  
  const [loading, setLoading] = React.useState(true)
  const [interview, setInterview] = React.useState<MockInterview | undefined>(initialInterviews.find(i => i.id === interviewId))
  
  // Actions state
  const [rescheduleModalOpen, setRescheduleModalOpen] = React.useState(false)
  const [cancelModalOpen, setCancelModalOpen] = React.useState(false)
  
  // Feedback state
  const [overall, setOverall] = React.useState(0)
  const [technical, setTechnical] = React.useState(0)
  const [communication, setCommunication] = React.useState(0)
  const [problemSolving, setProblemSolving] = React.useState(0)
  const [comments, setComments] = React.useState("")
  const [recommendation, setRecommendation] = React.useState("")
  
  const [toastMsg, setToastMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleReschedule = (data: any) => {
    if (interview) {
      setInterview({
        ...interview,
        date: data.date,
        time: data.time,
        duration: data.duration,
        type: data.type,
        interviewer: data.interviewer
      })
      showToast("Interview rescheduled successfully.")
    }
  }

  const handleCancel = () => {
    if (interview) {
      setInterview({ ...interview, status: "Cancelled" })
      setCancelModalOpen(false)
      showToast("Interview cancelled.")
    }
  }

  const handleMarkCompleted = () => {
    if (interview) {
      setInterview({ ...interview, status: "Completed" })
      showToast("Interview marked as completed. Please add feedback.")
    }
  }

  const handleSaveFeedback = () => {
    if (interview && recommendation) {
      setInterview({
        ...interview,
        status: "Needs Decision", // Advance pipeline
        feedback: {
          overall,
          technical,
          communication,
          problemSolving,
          comments,
          recommendation: recommendation as any
        }
      })
      showToast("Feedback saved successfully.")
    }
  }

  if (loading) {
    return (
      <DashboardShell type="recruiter" userName="Recruiter">
        <div className="flex justify-center py-24"><div className="w-8 h-8 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin" /></div>
      </DashboardShell>
    )
  }

  if (!interview) return <DashboardShell type="recruiter" userName="Recruiter"><div className="p-12 text-center">Interview not found</div></DashboardShell>

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Scheduled": return <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20 rounded-md">Scheduled</span>
      case "Completed": return <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-semantic-success/10 text-semantic-success border border-semantic-success/20 rounded-md">Completed</span>
      case "Cancelled": return <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-brand-gray/10 text-brand-navy/50 border border-brand-gray/20 rounded-md">Cancelled</span>
      case "Needs Decision": return <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/20 rounded-md">Needs Decision</span>
      default: return <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-brand-gray/10 text-brand-navy/60 rounded-md">{status}</span>
    }
  }

  const RatingStars = ({ value, onChange, readonly }: { value: number, onChange?: (val: number) => void, readonly?: boolean }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange && onChange(star)}
          className={cn(
            "p-1 transition-colors focus:outline-none",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
            star <= value ? "text-semantic-warning" : "text-brand-gray/40"
          )}
        >
          <Star className={cn("w-5 h-5", star <= value ? "fill-current" : "")} />
        </button>
      ))}
    </div>
  )

  return (
    <DashboardShell type="recruiter" userName="Recruiter">
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-6 pb-12 relative">
        
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
          <button onClick={() => navigate("/recruiter/interviews")} className="flex items-center text-sm font-medium text-brand-navy/60 hover:text-brand-indigo transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Interviews
          </button>
          <div className="flex items-center gap-3">
            {interview.status === "Scheduled" && (
              <>
                <Button variant="outline" className="text-semantic-error border-brand-gray/30 hover:bg-semantic-error/10" onClick={() => setCancelModalOpen(true)}>
                  Cancel Interview
                </Button>
                <Button variant="outline" className="text-brand-indigo border-brand-indigo/30 hover:bg-brand-indigo/10" onClick={() => setRescheduleModalOpen(true)}>
                  Reschedule
                </Button>
                <Button className="bg-brand-indigo hover:bg-brand-blue" onClick={handleMarkCompleted}>
                  Mark Completed
                </Button>
              </>
            )}
            {interview.status === "Completed" && !interview.feedback && (
              <div className="bg-semantic-warning/10 text-semantic-warning border border-semantic-warning/30 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Feedback Required
              </div>
            )}
          </div>
        </motion.div>

        {/* DETAILS CARD */}
        <motion.div variants={slideUp}>
          <Card className="overflow-hidden border-none shadow-md bg-white">
            <div className="h-2 bg-gradient-to-r from-brand-indigo to-brand-blue" />
            <CardContent className="p-0">
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-brand-gray/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-brand-indigo/10 flex items-center justify-center border border-brand-indigo/20 shrink-0">
                    <span className="text-2xl font-display font-bold text-brand-indigo">
                      {interview.candidateName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-display font-bold text-brand-navy">{interview.candidateName}</h1>
                    <p className="text-brand-navy/60 font-medium">{interview.jobTitle}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(interview.status)}
                  <Button variant="ghost" size="sm" className="text-brand-indigo hover:bg-brand-indigo/10 -mr-2" onClick={() => navigate(`/recruiter/candidates/${interview.candidateId}`)}>
                    <User className="w-4 h-4 mr-2" /> View Candidate
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-brand-gray/20 bg-brand-light/30">
                <div className="p-5 flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-brand-indigo shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Date & Time</div>
                    <div className="font-medium text-brand-navy">{interview.date}</div>
                    <div className="text-sm text-brand-navy/70">{interview.time} ({interview.duration})</div>
                  </div>
                </div>
                <div className="p-5 flex items-start gap-3">
                  <Video className="w-5 h-5 text-brand-indigo shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Type</div>
                    <div className="font-medium text-brand-navy">{interview.type}</div>
                  </div>
                </div>
                <div className="p-5 flex items-start gap-3">
                  <User className="w-5 h-5 text-brand-indigo shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Interviewer</div>
                    <div className="font-medium text-brand-navy">{interview.interviewer}</div>
                  </div>
                </div>
                <div className="p-5 flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-brand-indigo shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-brand-navy/50 uppercase tracking-wider mb-1">Job</div>
                    <div className="font-medium text-brand-navy">{interview.jobTitle}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FEEDBACK SECTION */}
        <AnimatePresence>
          {(interview.status === "Completed" || interview.status === "Needs Decision") && (
            <motion.div variants={slideUp} initial="initial" animate="animate" exit={{ opacity: 0, height: 0 }}>
              <Card>
                <CardHeader className="border-b border-brand-gray/20 bg-brand-light/30">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-indigo" /> Interview Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {interview.feedback ? (
                    // Display saved feedback
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <div className="text-sm text-brand-navy/60 mb-2">Overall Assessment</div>
                          <RatingStars value={interview.feedback.overall} readonly />
                        </div>
                        <div>
                          <div className="text-sm text-brand-navy/60 mb-2">Technical Skills</div>
                          <RatingStars value={interview.feedback.technical} readonly />
                        </div>
                        <div>
                          <div className="text-sm text-brand-navy/60 mb-2">Communication</div>
                          <RatingStars value={interview.feedback.communication} readonly />
                        </div>
                        <div>
                          <div className="text-sm text-brand-navy/60 mb-2">Problem Solving</div>
                          <RatingStars value={interview.feedback.problemSolving} readonly />
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-semibold text-brand-navy mb-2">Recommendation</div>
                        <span className={cn(
                          "px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md border",
                          interview.feedback.recommendation === "Strong Hire" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                          interview.feedback.recommendation === "Hire" ? "bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20" :
                          interview.feedback.recommendation === "Further Review" ? "bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20" :
                          "bg-semantic-error/10 text-semantic-error border-semantic-error/20"
                        )}>
                          {interview.feedback.recommendation}
                        </span>
                      </div>

                      <div className="bg-brand-light/50 p-4 rounded-xl border border-brand-gray/30">
                        <div className="text-sm font-semibold text-brand-navy mb-2">Comments</div>
                        <p className="text-sm text-brand-navy/80 whitespace-pre-wrap">{interview.feedback.comments}</p>
                      </div>
                    </div>
                  ) : (
                    // Feedback Form
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                          <div className="text-sm font-medium text-brand-navy mb-2">Overall Assessment</div>
                          <RatingStars value={overall} onChange={setOverall} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-brand-navy mb-2">Technical Skills</div>
                          <RatingStars value={technical} onChange={setTechnical} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-brand-navy mb-2">Communication</div>
                          <RatingStars value={communication} onChange={setCommunication} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-brand-navy mb-2">Problem Solving</div>
                          <RatingStars value={problemSolving} onChange={setProblemSolving} />
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-brand-navy mb-2">Recommendation *</div>
                        <div className="flex flex-wrap gap-3">
                          {["Strong Hire", "Hire", "Further Review", "Do Not Proceed"].map(rec => (
                            <button
                              key={rec}
                              onClick={() => setRecommendation(rec)}
                              className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                                recommendation === rec 
                                  ? "bg-brand-indigo text-white border-brand-indigo shadow-md shadow-brand-indigo/20" 
                                  : "bg-white text-brand-navy/70 border-brand-gray/40 hover:border-brand-indigo/50 hover:bg-brand-indigo/5"
                              )}
                            >
                              {rec}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-brand-navy mb-2">Comments</div>
                        <textarea 
                          value={comments}
                          onChange={e => setComments(e.target.value)}
                          placeholder="Add interview feedback and notes..."
                          className="w-full bg-white border border-brand-gray/40 rounded-xl p-4 text-sm focus:border-brand-indigo/50 outline-none min-h-[120px] resize-none"
                        />
                      </div>

                      <div className="flex justify-end pt-4 border-t border-brand-gray/20">
                        <Button 
                          onClick={handleSaveFeedback} 
                          disabled={!recommendation}
                          className="bg-brand-indigo hover:bg-brand-blue disabled:opacity-50"
                        >
                          Save Feedback
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <ScheduleInterviewModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        onSchedule={handleReschedule}
        initialCandidate={{ id: interview.candidateId, name: interview.candidateName, role: interview.jobTitle }}
      />

      <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Cancel Interview?" className="max-w-md">
          <div className="py-4">
            <p className="text-sm text-brand-navy/80">
              Are you sure you want to cancel the interview with <span className="font-semibold text-brand-navy">{interview.candidateName}</span>? This action will mark the interview status as cancelled.
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} className="border-brand-gray/40 text-brand-navy">Keep Interview</Button>
            <Button onClick={handleCancel} className="bg-semantic-error hover:bg-semantic-error/90 text-white">Cancel Interview</Button>
          </div>
      </Modal>
    </DashboardShell>
  )
}
