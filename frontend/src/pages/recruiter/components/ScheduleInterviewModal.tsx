import * as React from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { Calendar as CalendarIcon, Clock, User, Briefcase, FileText } from "lucide-react"
import { recruiterCandidateService } from "../../../services/recruiterCandidateService"

interface ScheduleInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSchedule: (data: any) => void
  initialCandidate?: { id: string; name: string; role: string }
}

export function ScheduleInterviewModal({ isOpen, onClose, onSchedule, initialCandidate }: ScheduleInterviewModalProps) {
  const [candidate, setCandidate] = React.useState(initialCandidate?.id || "")
  const [job, setJob] = React.useState("")
  const [date, setDate] = React.useState("")
  const [time, setTime] = React.useState("")
  const [type, setType] = React.useState("")
  const [interviewer, setInterviewer] = React.useState("")
  const [duration, setDuration] = React.useState("")
  const [notes, setNotes] = React.useState("")
  
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const availableCandidates = React.useMemo(() => {
    const list = recruiterCandidateService.getCandidates()
    if (initialCandidate && !list.some(c => c.id === initialCandidate.id)) {
      return [{ id: initialCandidate.id, name: initialCandidate.name, appliedRole: initialCandidate.role, skills: [], education: [], projects: [], location: "", experience: "", matchScore: 90, status: "Applied" as const, appliedDate: "", screeningStatus: "Screened" as const, applicationHistory: [] }, ...list]
    }
    return list
  }, [initialCandidate])

  const [prevCandidateId, setPrevCandidateId] = React.useState(initialCandidate?.id)
  if (initialCandidate?.id !== prevCandidateId) {
    setPrevCandidateId(initialCandidate?.id)
    setCandidate(initialCandidate?.id || "")
    setJob(initialCandidate?.role || "")
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!candidate) newErrors.candidate = "Please select a candidate."
    if (!job) newErrors.job = "Please select a job."
    if (!date) newErrors.date = "Please select an interview date."
    if (!time) newErrors.time = "Please select an interview time."
    if (!type) newErrors.type = "Please select an interview type."
    if (!interviewer) newErrors.interviewer = "Please select an interviewer."
    if (!duration) newErrors.duration = "Please select a duration."

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const matchedCand = availableCandidates.find(c => c.id === candidate)

    onSchedule({
      candidateId: candidate,
      candidateName: matchedCand?.name || initialCandidate?.name || "Candidate",
      jobTitle: job,
      date,
      time,
      type,
      interviewer,
      duration,
      notes
    })
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Interview" className="p-0 sm:p-0 max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col">
        <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Candidate *</label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-brand-navy/40" />
              <select 
                value={candidate} 
                onChange={e => {
                  setCandidate(e.target.value)
                  const sel = availableCandidates.find(c => c.id === e.target.value)
                  if (sel?.appliedRole && !job) {
                    setJob(sel.appliedRole)
                  }
                }}
                className="w-full bg-white border border-brand-gray/40 rounded-lg h-10 pl-9 pr-3 text-sm focus:border-brand-indigo/50 outline-none"
              >
                <option value="">Select Candidate</option>
                {availableCandidates.length > 0 ? (
                  availableCandidates.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                ) : (
                  <option value="cand_manual">Candidate</option>
                )}
              </select>
            </div>
            {errors.candidate && <p className="text-xs text-semantic-error mt-1">{errors.candidate}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Job *</label>
            <div className="relative flex items-center">
              <Briefcase className="absolute left-3 w-4 h-4 text-brand-navy/40" />
              <select 
                value={job} 
                onChange={e => setJob(e.target.value)}
                className="w-full bg-white border border-brand-gray/40 rounded-lg h-10 pl-9 pr-3 text-sm focus:border-brand-indigo/50 outline-none"
              >
                <option value="">Select Job</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="AI Engineer">AI Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
              </select>
            </div>
            {errors.job && <p className="text-xs text-semantic-error mt-1">{errors.job}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Date *</label>
              <div className="relative flex items-center">
                <CalendarIcon className="absolute left-3 w-4 h-4 text-brand-navy/40" />
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-white border border-brand-gray/40 rounded-lg h-10 pl-9 pr-3 text-sm focus:border-brand-indigo/50 outline-none"
                />
              </div>
              {errors.date && <p className="text-xs text-semantic-error mt-1">{errors.date}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Time *</label>
              <div className="relative flex items-center">
                <Clock className="absolute left-3 w-4 h-4 text-brand-navy/40" />
                <input 
                  type="time" 
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-white border border-brand-gray/40 rounded-lg h-10 pl-9 pr-3 text-sm focus:border-brand-indigo/50 outline-none"
                />
              </div>
              {errors.time && <p className="text-xs text-semantic-error mt-1">{errors.time}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Type *</label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value)}
                className="w-full bg-white border border-brand-gray/40 rounded-lg h-10 px-3 text-sm focus:border-brand-indigo/50 outline-none"
              >
                <option value="">Select Type</option>
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Managerial">Managerial</option>
                <option value="Final Round">Final Round</option>
              </select>
              {errors.type && <p className="text-xs text-semantic-error mt-1">{errors.type}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Duration *</label>
              <select 
                value={duration} 
                onChange={e => setDuration(e.target.value)}
                className="w-full bg-white border border-brand-gray/40 rounded-lg h-10 px-3 text-sm focus:border-brand-indigo/50 outline-none"
              >
                <option value="">Select Duration</option>
                <option value="30 min">30 min</option>
                <option value="45 min">45 min</option>
                <option value="60 min">60 min</option>
                <option value="90 min">90 min</option>
              </select>
              {errors.duration && <p className="text-xs text-semantic-error mt-1">{errors.duration}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Interviewer *</label>
            <div className="relative flex items-center">
              <User className="absolute left-3 w-4 h-4 text-brand-navy/40" />
              <select 
                value={interviewer} 
                onChange={e => setInterviewer(e.target.value)}
                className="w-full bg-white border border-brand-gray/40 rounded-lg h-10 pl-9 pr-3 text-sm focus:border-brand-indigo/50 outline-none"
              >
                <option value="">Select Interviewer</option>
                <option value="Sarah Jenkins">Sarah Jenkins (Recruiter)</option>
                <option value="Michael Chen">Michael Chen (Eng Manager)</option>
                <option value="Priya Sharma">Priya Sharma (Sr. Dev)</option>
              </select>
            </div>
            {errors.interviewer && <p className="text-xs text-semantic-error mt-1">{errors.interviewer}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-navy/60 uppercase tracking-wider">Notes (Optional)</label>
            <div className="relative flex items-start">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-brand-navy/40" />
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any instructions for the interviewer..."
                className="w-full bg-white border border-brand-gray/40 rounded-lg py-2.5 pl-9 pr-3 text-sm focus:border-brand-indigo/50 outline-none min-h-[80px] resize-none"
              />
            </div>
          </div>

        </div>

        <div className="p-4 sm:p-6 border-t border-brand-gray/20 bg-brand-light/30 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 rounded-b-2xl">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto border-brand-gray/40 text-brand-navy">Cancel</Button>
          <Button onClick={handleSubmit} className="w-full sm:w-auto bg-brand-indigo hover:bg-brand-blue text-white">Schedule Interview</Button>
        </div>
    </Modal>
  )
}
