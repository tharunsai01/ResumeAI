import { motion } from 'framer-motion';
import { CheckCircle2, FlaskConical, Play, Scale, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AIWorking } from '@/components/ai/AIProcessing';
import { BarsChart } from '@/components/charts/Charts';
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, PageHeader, Segmented, Select, SkeletonCard } from '@/components/ui';
import { fadeUp, staggerChildren } from '@/config/motion';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks';
import { toApiError } from '@/services/api';
import { adminApi, jobsApi } from '@/services/endpoints';
import type { AiEvaluationRun } from '@/types';
import { cn, formatDateTime } from '@/utils/format';

function Check({ label, passed, detail }: { label: string; passed: boolean | null | undefined; detail: string }) {
  const known = passed !== null && passed !== undefined;
  return (
    <div className={cn('rounded-2xl border p-4', !known ? 'border-line' : passed ? 'border-success/30 bg-success-soft' : 'border-danger/30 bg-danger-soft')}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-ink">{label}</p>
        {known ? (
          <span className={cn('flex items-center gap-1 text-xs font-bold', passed ? 'text-success' : 'text-danger')}>
            {passed ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            {passed ? 'Pass' : 'Fail'}
          </span>
        ) : (
          <Badge>Not applicable</Badge>
        )}
      </div>
      <p className="mt-1.5 text-caption text-ink-muted">{detail}</p>
    </div>
  );
}

function RunReport({ run }: { run: AiEvaluationRun }) {
  const r = run.result;
  if (!r) return <SkeletonCard lines={6} />;
  const histogram = Object.entries(r.score_distribution.histogram as Record<string, number>).map(([range, count]) => ({ range, count }));
  const groups = Object.entries((r.group_stats ?? {}) as Record<string, { count: number; mean_score: number; selection_rate: number }>);
  return (
    <motion.div variants={staggerChildren(0.06)} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={fadeUp} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Check label="Counterfactual fairness" passed={r.counterfactual_fairness.passed} detail={`Largest score change when identity text was swapped: ${r.counterfactual_fairness.max_delta}`} />
        <Check label="Score stability" passed={r.stability.passed} detail={`Largest change after harmless rewrites: ${r.stability.max_delta}`} />
        <Check label="Four-fifths rule" passed={r.adverse_impact ? r.adverse_impact.passes_four_fifths_rule : null} detail={r.adverse_impact ? `Lowest to highest group selection ratio: ${r.adverse_impact.ratio}` : 'Needs group labels. Real applicants have none, because protected data is never collected; use the benchmark.'} />
        <Check label="Formula validation" passed={r.formula_validation.all_valid} detail="Every result re-checked against 50/20/10/20 weights and category thresholds" />
      </motion.div>
      <motion.div variants={fadeUp} className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Score distribution" description={`${r.candidate_count} profiles. Mean ${r.score_distribution.mean}, median ${r.score_distribution.median}, standard deviation ${r.score_distribution.stdev}`} />
          <div className="p-5 pt-3">
            <BarsChart data={histogram} xKey="range" yKey="count" name="Profiles" height={230} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Categories" />
          <ul className="space-y-2 p-5">
            {Object.entries(r.score_distribution.categories as Record<string, number>).map(([k, v]) => (
              <li key={k} className="flex items-center justify-between rounded-xl border border-line px-4 py-2.5 text-sm">
                <span className="font-semibold text-ink">{k}</span>
                <span className="tabular font-bold text-ink">{v}</span>
              </li>
            ))}
          </ul>
          {groups.length > 0 && (
            <>
              <CardHeader title="Outcomes by evaluation group" description="Shortlist threshold 60" className="pt-0" />
              <ul className="space-y-2 p-5">
                {groups.map(([g, s]) => (
                  <li key={g} className="grid grid-cols-[1fr_auto_auto] gap-4 rounded-xl border border-line px-4 py-2.5 text-sm">
                    <span className="font-semibold text-ink">{g}</span>
                    <span className="tabular text-ink-muted">mean {s.mean_score}</span>
                    <span className="tabular font-bold text-ink">{Math.round(s.selection_rate * 100)}% selected</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </motion.div>
      <motion.div variants={fadeUp}>
        <Card className="p-5">
          <h3 className="font-bold text-ink">Model comparison: role similarity</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Active engine <span className="font-semibold text-ink">{r.model_comparison.active_backend}</span> against the <span className="font-semibold text-ink">{r.model_comparison.baseline_backend}</span> baseline. Mean absolute difference {r.model_comparison.mean_abs_difference} points
            {r.model_comparison.rank_correlation != null ? `, rank correlation ${r.model_comparison.rank_correlation.toFixed(2)}` : ''}.
            {r.model_comparison.active_backend === r.model_comparison.baseline_backend && ' MiniLM is not loaded on this server, so both columns use the fallback.'}
          </p>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function AiEvaluation() {
  const toast = useToast();
  const history = useAsync(() => adminApi.evaluations(), []);
  const jobs = useAsync(() => jobsApi.list({ limit: 50 }), []);
  const [mode, setMode] = useState<'benchmark' | 'job'>('benchmark');
  const [jobId, setJobId] = useState('');
  const [running, setRunning] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useAsync(() => (selectedId ? adminApi.evaluation(selectedId) : Promise.resolve(null)), [selectedId]);

  useEffect(() => {
    if (!selectedId && history.data?.length) setSelectedId(history.data[0]._id);
  }, [history.data, selectedId]);
  useEffect(() => {
    if (!jobId && jobs.data?.items.length) setJobId(jobs.data.items[0]._id);
  }, [jobs.data, jobId]);

  const run = async () => {
    setRunning(true);
    try {
      const r = await adminApi.runEvaluation(mode, mode === 'job' ? jobId : undefined);
      toast.success('Evaluation finished', `${r.candidateCount} profiles scored.`);
      await history.reload(true);
      setSelectedId(r._id);
    } catch (err) {
      toast.error('Evaluation failed', toApiError(err).message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI evaluation" description="Test the scoring engine for fairness, stability and formula correctness. Runs are stored so results can be compared over time." />
      <Card className="flex flex-col gap-4 p-5 lg:flex-row lg:items-end">
        <div>
          <p className="mb-1.5 text-[0.8125rem] font-semibold text-ink">Dataset</p>
          <Segmented label="Evaluation dataset" value={mode} onChange={setMode} options={[{ value: 'benchmark', label: 'Synthetic benchmark' }, { value: 'job', label: 'Real applicants' }]} />
        </div>
        {mode === 'job' && (
          <div className="lg:w-80">
            <Select label="Job" value={jobId} onChange={(e) => setJobId(e.target.value)} options={(jobs.data?.items ?? []).map((j) => ({ value: j._id, label: j.title }))} />
          </div>
        )}
        <p className="flex-1 text-caption text-ink-muted">
          {mode === 'benchmark' ? '80 synthetic profiles in matched pairs that differ only in identity-related text and an evaluation group label.' : 'Scores the selected job’s applicants. Group outcomes are not available because protected data is never collected.'}
        </p>
        <Button icon={<Play className="size-4" />} onClick={run} loading={running} loadingText="Running evaluation" disabled={mode === 'job' && !jobId}>
          Run evaluation
        </Button>
      </Card>
      {running && <AIWorking label="Scoring profiles, swapping identity text and re-scoring" />}
      <div className="grid gap-6 xl:grid-cols-[18rem_1fr]">
        <Card className="h-fit">
          <CardHeader title="History" />
          <div className="p-3">
            {history.loading ? (
              <SkeletonCard lines={4} />
            ) : history.error ? (
              <ErrorState message={history.error.message} onRetry={() => history.reload()} />
            ) : !history.data?.length ? (
              <EmptyState icon={<FlaskConical className="size-5" />} title="No runs yet" description="Run the benchmark to get a baseline." className="m-1" />
            ) : (
              <ul className="space-y-1">
                {history.data.map((h) => (
                  <li key={h._id}>
                    <button onClick={() => setSelectedId(h._id)} aria-current={selectedId === h._id} className={cn('w-full rounded-xl px-3 py-2.5 text-left transition-colors', selectedId === h._id ? 'bg-primary-soft' : 'hover:bg-elevated')}>
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-ink">{h.mode === 'benchmark' ? 'Benchmark' : h.job?.title ?? 'Job'}</span>
                        {h.summary.counterfactualPassed && h.summary.formulaValid ? <CheckCircle2 className="size-4 text-success" aria-label="Checks passed" /> : <Scale className="size-4 text-warning" aria-label="Some checks failed" />}
                      </span>
                      <span className="block text-caption text-ink-faint">
                        {formatDateTime(h.createdAt)}, {h.candidateCount} profiles
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
        <div>{selected.loading ? <SkeletonCard lines={8} /> : selected.data ? <RunReport run={selected.data} /> : !history.loading && <EmptyState title="Select a run" description="Pick a run from the history to see its report." />}</div>
      </div>
    </div>
  );
}
