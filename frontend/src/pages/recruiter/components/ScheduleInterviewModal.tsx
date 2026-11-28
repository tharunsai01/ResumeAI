import { useEffect, useState } from "react"
import { Modal } from "../../../components/ui/Modal"
import { Button } from "../../../components/ui/Button"
import { env } from "../../../config/env"
import { pipelineService } from "../../../services/pipelineService"
import type { InterviewSchedule } from "../../../services/interviewService"
import type { PipelineCandidate } from "../../../types/pipeline"

interface ScheduleInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSchedule: (data: InterviewSchedule) => void | Promise<void>
  applicationId?: string
  initialCandidate?: { id: string; name: string; role: string; applicationId?: string }
}

const fieldClass = "mt-1 w-full rounded-lg border border-brand-gray/50 bg-white px-3 py-2 text-brand-navy dark:bg-slate-900 dark:text-white"

export function ScheduleInterviewModal({ isOpen, onClose, onSchedule, applicationId, initialCandidate }: ScheduleInterviewModalProps) {
  const [choices, setChoices] = useState<PipelineCandidate[]>([])
  const [selected, setSelected] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const initialId = applicationId || initialCandidate?.applicationId || (env.useMock ? initialCandidate?.id : "")

  useEffect(() => {
    if (!isOpen) return
    let active = true
    setSelected(initialId || "")
    setError("")
    setLoading(true)
    pipelineService.listInterviewApplications()
      .then(items => { if (active) setChoices(items) })
      .catch(() => { if (active) setError("Couldn’t load applications. Reopen the form to retry.") })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isOpen, initialId])

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving) return
    const form = new FormData(event.currentTarget)
    const candidate = choices.find(item => (item.applicationId || item.id) === selected)
    if (!candidate && !initialCandidate) return
    const date = String(form.get("date"))
    const time = String(form.get("time"))
    if (new Date(`${date}T${time}`).getTime() <= Date.now()) {
      setError("Choose a date and time in the future.")
      return
    }

    setSaving(true)
    setError("")
    try {
      await onSchedule({
        applicationId: selected,
        candidateId: candidate?.id || initialCandidate?.id || "",
        candidateName: candidate?.name || initialCandidate?.name || "Candidate",
        jobTitle: candidate?.role || initialCandidate?.role || "",
        date, time,
        duration: String(form.get("duration")),
        type: String(form.get("type")),
        mode: form.get("mode") as InterviewSchedule["mode"],
        interviewer: String(form.get("interviewer")).trim(),
        meetingLink: String(form.get("meetingLink")).trim() || undefined,
        location: String(form.get("location")).trim() || undefined,
        notes: String(form.get("notes")).trim(),
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t save the interview. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const hasSelectedChoice = choices.some(item => (item.applicationId || item.id) === selected)

  return (
    <Modal isOpen={isOpen} onClose={() => { if (!saving) onClose() }} title="Schedule Interview" className="max-w-lg">
      {isOpen && <form onSubmit={submit} className="space-y-4">
        <div className="max-h-[65vh] space-y-3 overflow-y-auto px-1">
          <label className="block text-sm font-medium">Application
            <select name="application" aria-label="Application" className={fieldClass} required value={selected} onChange={event => setSelected(event.target.value)} disabled={loading}>
              <option value="">{loading ? "Loading applications…" : "Select a candidate and job"}</option>
              {selected && !hasSelectedChoice && initialCandidate && <option value={selected}>{initialCandidate.name} — {initialCandidate.role}</option>}
              {choices.map(item => <option key={item.applicationId || item.id} value={item.applicationId || item.id}>{item.name} — {item.role}</option>)}
            </select>
          </label>
          {!loading && choices.length === 0 && !initialCandidate && !error && <p className="text-sm">No applications are available to schedule.</p>}
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium">Date<input name="date" type="date" required className={fieldClass} /></label>
            <label className="text-sm font-medium">Local time<input name="time" type="time" required className={fieldClass} /></label>
            <label className="text-sm font-medium">Interview type
              <select name="type" className={fieldClass}>
                <option>Technical</option><option>HR</option><option>Behavioral</option><option>Managerial</option><option>Final Round</option>
              </select>
            </label>
            <label className="text-sm font-medium">Duration
              <select name="duration" className={fieldClass}>
                <option value="30 min">30 min</option><option value="45 min">45 min</option><option value="60 min">60 min</option><option value="90 min">90 min</option>
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium">Interviewer<input name="interviewer" maxLength={120} className={fieldClass} /></label>
          <label className="block text-sm font-medium">Format
            <select name="mode" className={fieldClass}><option value="video">Video</option><option value="phone">Phone</option><option value="onsite">On-site</option></select>
          </label>
          <label className="block text-sm font-medium">Meeting link<input name="meetingLink" type="url" placeholder="https://…" className={fieldClass} /></label>
          <label className="block text-sm font-medium">Location or dial-in details<input name="location" className={fieldClass} /></label>
          <label className="block text-sm font-medium">Internal notes<textarea name="notes" className={fieldClass} /></label>
        </div>
        {error && <p role="alert" className="text-sm text-semantic-error">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving || loading || !selected}>{saving ? "Saving…" : "Schedule Interview"}</Button>
        </div>
      </form>}
    </Modal>
  )
}
