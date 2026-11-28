import { useEffect, useState } from "react"
import { Play } from "lucide-react"
import { AdminShell } from "../../components/layout/AdminShell"
import { AdminPageHeader } from "../../components/admin/AdminPageHeader"
import { Button } from "../../components/ui/Button"
import { httpClient } from "../../services/api/httpClient"

interface EvaluationRun {
  id: string
  status: "running" | "completed" | "failed"
  startedAt: string
  finishedAt?: string
  progress?: string[]
  error?: { code: string }
  result?: { report: {
    modelInfo: { modelVersion: string; evaluationDataset: string }
    skillExtraction: {
      accuracy: string
      correctSkills: number
      missedSkills: number
      incorrectSkills: number
      perCase: { id: string; correct: number; missed: string[]; incorrect: string[] }[]
    }
    scoreStability: { stability: string; evaluationSamples: number; changedResults: number }
    fairness: {
      threshold: number
      comparisonPairs: { id: string; label: string; scoreA: number; scoreB: number; difference: number; status: string }[]
      noiseFloor: { maximumDifference: number }
    }
  } }
}

export function LiveAiEvaluation() {
  const [run, setRun] = useState<EvaluationRun | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController()
    let timer: number | undefined
    async function refresh() {
      let pollAgain = false
      try {
        const { data } = await httpClient.get<{ data: { run: EvaluationRun | null } }>("/admin/ai-evaluation", { signal: controller.signal })
        if (controller.signal.aborted) return
        setRun(data.run)
        setError("")
        pollAgain = data.run?.status === "running"
      } catch {
        if (controller.signal.aborted) return
        setError("Couldn’t read the evaluation status. Retrying…")
        pollAgain = true
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          if (pollAgain) timer = window.setTimeout(refresh, 3000)
        }
      }
    }
    if (!starting) void refresh()
    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [starting])

  async function startRun() {
    setStarting(true)
    try {
      const { data } = await httpClient.post<{ data: EvaluationRun }>("/admin/ai-evaluation", {})
      setRun(data)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t start the evaluation.")
    } finally {
      setStarting(false)
    }
  }

  const report = run?.result?.report
  const busy = loading || starting || run?.status === "running"

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <AdminPageHeader
          title="AI Evaluation & Fairness"
          description="Measure the configured model against a small, synthetic test dataset."
          action={<Button disabled={busy} onClick={() => void startRun()}><Play className="mr-2 h-4 w-4" />Run Live Evaluation</Button>}
        />
        <p className="rounded-xl border border-brand-indigo/20 bg-brand-indigo/5 p-4 text-sm text-brand-navy">
          This benchmark uses three synthetic résumés across frontend, backend, and data engineering. It measures skill extraction, repeatability, and score differences when only the name changes on two résumés. These comparisons cover the benchmark cases.
        </p>
        {error && <p role="alert" className="text-sm text-semantic-error">{error}</p>}
        <section className="rounded-xl border border-brand-gray/30 bg-white p-5 dark:bg-slate-900" aria-live="polite">
          <h2 className="font-semibold text-brand-navy">Latest run</h2>
          <p className="mt-2 text-sm text-brand-navy/70">
            {loading ? "Checking for a previous run…" : starting ? "Starting evaluation…" : !run ? "No live evaluation has run yet." :
              run.status === "running" ? "Evaluation running. This page will update automatically." :
              run.status === "failed" ? (
                run.error?.code === "NO_API_KEY" ? "Evaluation failed. The model provider key is missing." :
                  run.error?.code === "RATE_LIMITED" ? "Evaluation failed. The provider rate limit was reached." :
                    "Evaluation failed. Check the AI service logs and retry."
              ) : `Completed ${new Date(run.finishedAt ?? run.startedAt).toLocaleString()}`}
          </p>
          {run?.status === "running" && <p className="mt-1 text-sm text-brand-navy/70">{run.progress?.at(-1)}</p>}
        </section>
        {report && (
          <>
            <p className="text-sm text-brand-navy/70">{report.modelInfo.modelVersion} · {report.modelInfo.evaluationDataset}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <section className="rounded-xl border border-brand-gray/30 bg-white p-5 dark:bg-slate-900">
                <h2 className="font-semibold text-brand-navy">Skill extraction</h2>
                <p className="my-2 text-2xl font-semibold text-brand-indigo">{report.skillExtraction.accuracy}</p>
                <p className="text-sm text-brand-navy/70">{report.skillExtraction.correctSkills} correct · {report.skillExtraction.missedSkills} missed · {report.skillExtraction.incorrectSkills} extra</p>
                <ul className="mt-3 space-y-2 text-sm text-brand-navy/70">
                  {report.skillExtraction.perCase.map(item => (
                    <li key={item.id}>
                      <span className="font-medium capitalize">{item.id.replace(/-/g, " ")}</span>
                      <span> · {item.correct} correct</span>
                      {!!item.missed.length && <span> · Missed {item.missed.join(", ")}</span>}
                      {!!item.incorrect.length && <span> · Extra {item.incorrect.join(", ")}</span>}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-xl border border-brand-gray/30 bg-white p-5 dark:bg-slate-900">
                <h2 className="font-semibold text-brand-navy">Score stability</h2>
                <p className="my-2 text-2xl font-semibold text-brand-indigo">{report.scoreStability.stability}</p>
                <p className="text-sm text-brand-navy/70">{report.scoreStability.changedResults} changed results across {report.scoreStability.evaluationSamples} samples</p>
              </section>
            </div>
            <section className="rounded-xl border border-brand-gray/30 bg-white p-5 dark:bg-slate-900">
              <h2 className="font-semibold text-brand-navy">Fairness comparison</h2>
              <p className="my-2 text-sm text-brand-navy/70">Largest score change when the original résumé was repeated: {report.fairness.noiseFloor.maximumDifference} points.</p>
              {!report.fairness.comparisonPairs.length && <p className="text-sm text-brand-navy/70">The model did not extract a name that could be varied.</p>}
              <div className="space-y-2">
                {report.fairness.comparisonPairs.map(pair => (
                  <div key={pair.id} className="rounded-lg border border-brand-gray/30 p-3 text-sm text-brand-navy">
                    <p className="font-medium">{pair.label}</p>
                    <p>{pair.scoreA} vs {pair.scoreB} · {pair.difference} points apart · {pair.status}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AdminShell>
  )
}
