import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarDays } from "lucide-react"
import { DashboardShell } from "../../components/layout/DashboardShell"
import { Button } from "../../components/ui/Button"
import { interviewService, type Interview } from "../../services/interviewService"

export default function CandidateInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>()
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const load = () => {
      void interviewService.fetchLiveInterviews()
        .then(items => { if (active) { setInterviews(items); setError(false) } })
        .catch(() => { if (active) setError(true) })
    }
    load()
    window.addEventListener("focus", load)
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") load() }, 30000)
    return () => {
      active = false
      window.clearInterval(timer)
      window.removeEventListener("focus", load)
    }
  }, [attempt])

  return (
    <DashboardShell type="candidate">
      <section className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-2xl font-semibold text-brand-navy dark:text-white">Interviews</h1>
        {error ? (
          <div role="alert" className="rounded-xl border border-brand-gray/30 p-4">
            <p>Couldn’t load your interviews.</p>
            <Button className="mt-2" variant="outline" onClick={() => setAttempt(value => value + 1)}>Retry</Button>
          </div>
        ) : !interviews ? <p role="status">Loading interviews…</p>
          : !interviews.length ? <p>No interviews have been scheduled for your applications.</p>
          : interviews.map(interview => (
            <article key={interview.id} className="rounded-xl border border-brand-gray/30 bg-white p-5 shadow-sm dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{interview.jobTitle || "Interview"}</h2>
                  {interview.company && <p className="text-sm text-slate-500 dark:text-slate-400">{interview.company}</p>}
                </div>
                <span className="rounded-full bg-brand-indigo/10 px-3 py-1 text-sm font-medium text-brand-indigo dark:text-indigo-300">{interview.status}</span>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 shrink-0" />
                {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : `${interview.date} · ${interview.time}`}
                {interview.durationMins ? ` · ${interview.durationMins} min` : ""}
              </p>
              <p className="mt-2 text-sm capitalize">{interview.type}{interview.mode ? ` · ${interview.mode === "onsite" ? "On-site" : interview.mode}` : ""}</p>
              {interview.interviewer && <p className="mt-1 text-sm">Interviewer {interview.interviewer}</p>}
              {interview.location && <p className="mt-1 break-words text-sm">{interview.location}</p>}
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-brand-indigo dark:text-indigo-300">
                {interview.status === "Scheduled" && /^https?:\/\//i.test(interview.meetingLink) && (
                  <a className="hover:underline" href={interview.meetingLink} target="_blank" rel="noreferrer">Join interview</a>
                )}
                {interview.applicationId && <Link className="hover:underline" to={`/candidate/applications/${interview.applicationId}`}>View application</Link>}
              </div>
            </article>
          ))}
      </section>
    </DashboardShell>
  )
}
