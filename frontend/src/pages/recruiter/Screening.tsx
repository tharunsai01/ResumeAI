import { motion } from 'framer-motion';
import { Download, EyeOff, GitCompare, ListOrdered, Play, Settings2, ShieldAlert, Star, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import { AIWorking } from '@/components/ai/AIProcessing';
import { ComponentBars, MatchBreakdown } from '@/components/ai/MatchBreakdown';
import { useChartColors } from '@/components/charts/Charts';
import { Avatar, Badge, Button, Card, ConfirmDialog, Drawer, EmptyState, ErrorState, Modal, PageHeader, ScoreRing, Select, SkeletonTable, Switch, Textarea } from '@/components/ui';
import { fadeUp, staggerChildren } from '@/config/motion';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks';
import { toApiError } from '@/services/api';
import { applicationsApi, jobsApi, resumeApi, screeningApi } from '@/services/endpoints';
import type { ApplicationStatus, MatchResult } from '@/types';
import { categoryTone, cn, STATUS_LABEL, timeAgo } from '@/utils/format';

interface Row {
  applicationId: string;
  rank: number | null;
  status: ApplicationStatus;
  candidate: { _id: string; name: string; email?: string };
  resume?: { _id: string; originalName: string; security?: { flagged: boolean }; reviewStatus?: string };
  match: MatchResult | null;
  appliedAt: string;
}

function CompareModal({ rows, open, onClose }: { rows: Row[]; open: boolean; onClose: () => void }) {
  const c = useChartColors();
  const palette = [c.primary, c.cyan, c.violet];
  const data = ['skills', 'experience', 'education', 'role'].map((k) => ({
    component: { skills: 'Skills', experience: 'Experience', education: 'Education', role: 'Role fit' }[k],
    ...Object.fromEntries(rows.map((r) => [r.candidate.name, r.match?.components[k as keyof MatchResult['components']] ?? 0])),
  }));
  return (
    <Modal open={open} onClose={onClose} title="Compare candidates" description="Component scores side by side. Same formula, same job." size="xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="75%">
              <PolarGrid stroke={c.line} />
              <PolarAngleAxis dataKey="component" tick={{ fill: c.muted, fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              {rows.map((r, i) => (
                <Radar key={r.applicationId} name={r.candidate.name} dataKey={r.candidate.name} stroke={palette[i]} fill={palette[i]} fillOpacity={0.15} strokeWidth={2} />
              ))}
              <RTooltip contentStyle={{ background: c.surface, border: `1px solid ${c.line}`, borderRadius: 12, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {rows.map((r, i) => (
            <Card key={r.applicationId} className="p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="size-3 rounded-full" style={{ background: palette[i] }} />
                <span className="flex-1 truncate font-bold text-ink">{r.candidate.name}</span>
                <span className="tabular text-xl font-extrabold text-ink">{r.match?.overallScore.toFixed(0) ?? '–'}</span>
              </div>
              {r.match && <ComponentBars components={r.match.components} compact />}
              <p className="mt-3 text-caption text-ink-muted">
                {r.match?.matchedSkills.length ?? 0} matched, {r.match?.missingSkills.length ?? 0} missing skills
              </p>
            </Card>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default function ScreeningHub() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const jobs = useAsync(() => jobsApi.mine({ limit: 50 }), []);
  const jobId = params.get('job') ?? '';
  useEffect(() => {
    if (!jobId && jobs.data?.items.length) {
      const withApps = jobs.data.items.find((j) => j.applicationsCount > 0) ?? jobs.data.items[0];
      setParams({ job: withApps._id }, { replace: true });
    }
  }, [jobId, jobs.data, setParams]);

  const results = useAsync(() => (jobId ? screeningApi.results(jobId) : Promise.resolve(null)), [jobId]);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [detail, setDetail] = useState<Row | null>(null);
  const [decision, setDecision] = useState<{ row: Row; status: 'shortlisted' | 'rejected' } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'strong' | 'unscored'>('all');
  const [notes, setNotes] = useState('');
  useEffect(() => setSelected([]), [jobId]);

  const rows: Row[] = useMemo(() => {
    const all: Row[] = results.data?.results ?? [];
    if (filter === 'strong') return all.filter((r) => (r.match?.overallScore ?? 0) >= (results.data?.settings.highlightThreshold ?? 80));
    if (filter === 'unscored') return all.filter((r) => !r.match);
    return all;
  }, [results.data, filter]);

  const run = async () => {
    setRunning(true);
    try {
      const r = await screeningApi.run(jobId);
      toast.success('Screening complete', `${r.total} applicants scored. ${r.screened} newly marked as screened.`);
      await results.reload(true);
    } catch (err) {
      toast.error('Screening failed', toApiError(err).message);
    } finally {
      setRunning(false);
    }
  };

  const decide = async (row: Row, status: 'shortlisted' | 'rejected', note: string) => {
    try {
      await applicationsApi.setStatus(row.applicationId, status, note || undefined);
      toast.success(status === 'shortlisted' ? `${row.candidate.name} shortlisted` : `${row.candidate.name} marked as not selected`, 'The candidate has been notified.');
      void results.reload(true);
    } catch (err) {
      toast.error('Could not update status', toApiError(err).message);
    }
  };

  const settings = results.data?.settings;
  const updateSettings = async (patch: Record<string, unknown>) => {
    try {
      await screeningApi.updateSettings(jobId, patch);
      void results.reload(true);
    } catch (err) {
      toast.error('Could not save settings', toApiError(err).message);
    }
  };

  return (
    <div>
      <PageHeader
        title="AI screening"
        description="Applicants ranked by the official formula. Screening never shortlists or rejects anyone; you do."
        actions={
          <>
            <Button variant="secondary" icon={<Settings2 className="size-4" />} onClick={() => setSettingsOpen(true)} disabled={!jobId}>
              Settings
            </Button>
            <Button icon={<Play className="size-4" />} onClick={run} loading={running} loadingText="Scoring applicants" disabled={!jobId}>
              Run screening
            </Button>
          </>
        }
      />
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end">
        <div className="md:w-96">
          <Select
            label="Job"
            value={jobId}
            onChange={(e) => setParams({ job: e.target.value })}
            options={jobs.data?.items.length ? jobs.data.items.map((j) => ({ value: j._id, label: `${j.title} (${j.applicationsCount})` })) : [{ value: '', label: jobs.loading ? 'Loading jobs' : 'No jobs yet' }]}
          />
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-2 md:justify-end">
          {(['all', 'strong', 'unscored'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={cn('rounded-full border px-3 py-1.5 text-caption font-semibold transition-colors', filter === f ? 'border-primary bg-primary-soft text-primary' : 'border-line text-ink-muted hover:text-ink')}>
              {f === 'all' ? 'All applicants' : f === 'strong' ? `Score ${settings?.highlightThreshold ?? 80}+` : 'Not scored yet'}
            </button>
          ))}
          <Button variant="secondary" size="sm" icon={<GitCompare className="size-4" />} disabled={selected.length < 2} onClick={() => setCompareOpen(true)}>
            Compare ({selected.length}/3)
          </Button>
        </div>
      </div>
      {running && <AIWorking label="Scoring every applicant against the job requirements" />}
      {settings?.blindReview && (
        <p className="mb-4 flex items-center gap-2 text-sm text-ink-muted">
          <EyeOff className="size-4" /> Blind review is on: names are hidden until you open a candidate.
        </p>
      )}
      {results.loading || jobs.loading ? (
        <SkeletonTable />
      ) : results.error ? (
        <ErrorState message={results.error.message} onRetry={() => results.reload()} />
      ) : !jobId ? (
        <EmptyState icon={<ListOrdered className="size-5" />} title="No jobs to screen" description="Post a job first. Applicants appear here as they apply." />
      ) : !rows.length ? (
        <EmptyState icon={<ListOrdered className="size-5" />} title={filter === 'all' ? 'No applicants yet' : 'Nobody matches this filter'} description={filter === 'all' ? 'Applicants will appear here and are scored automatically when they apply.' : undefined} />
      ) : (
        <motion.ol variants={staggerChildren(0.035)} initial="hidden" animate="show" className="space-y-3">
          {rows.map((r) => {
            const m = r.match;
            const highlight = m && m.overallScore >= (settings?.highlightThreshold ?? 80);
            const checked = selected.includes(r.applicationId);
            return (
              <motion.li key={r.applicationId} variants={fadeUp}>
                <Card className={cn('grid items-center gap-4 p-4 sm:p-5 lg:grid-cols-[auto_minmax(0,1.4fr)_minmax(0,1.5fr)_auto]', highlight && 'border-success/40')}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="size-4 accent-[var(--primary)]"
                      checked={checked}
                      disabled={!m || (!checked && selected.length >= 3)}
                      onChange={() => setSelected((s) => (checked ? s.filter((x) => x !== r.applicationId) : [...s, r.applicationId]))}
                      aria-label={`Select ${r.candidate.name} for comparison`}
                    />
                    <span className="tabular w-7 text-center text-lg font-extrabold text-ink-faint">{r.rank ?? '–'}</span>
                    <ScoreRing score={m?.overallScore} size={54} stroke={5} />
                  </div>
                  <div className="min-w-0">
                    <button onClick={() => setDetail(r)} className="flex items-center gap-2 text-left">
                      <Avatar name={r.candidate.name} size="sm" />
                      <span className="truncate font-bold text-ink hover:text-primary">{r.candidate.name}</span>
                    </button>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m && <Badge tone={categoryTone(m.category)}>{m.category}</Badge>}
                      <Badge>{STATUS_LABEL[r.status]}</Badge>
                      {r.resume?.security?.flagged && r.resume.reviewStatus !== 'cleared' && (
                        <Badge tone="warning">
                          <ShieldAlert className="size-3" /> Resume under review
                        </Badge>
                      )}
                      <span className="text-caption text-ink-faint">Applied {timeAgo(r.appliedAt)}</span>
                    </div>
                  </div>
                  <div>{m ? <ComponentBars components={m.components} compact /> : <p className="text-sm text-ink-muted">Not scored yet. Run screening to score this applicant.</p>}</div>
                  <div className="flex gap-2 lg:flex-col">
                    <Button size="sm" variant="secondary" icon={<Star className="size-3.5" />} disabled={!['applied', 'screened'].includes(r.status)} onClick={() => setDecision({ row: r, status: 'shortlisted' })}>
                      Shortlist
                    </Button>
                    <Button size="sm" variant="ghost" icon={<XCircle className="size-3.5" />} disabled={['rejected', 'hired', 'withdrawn'].includes(r.status)} onClick={() => setDecision({ row: r, status: 'rejected' })}>
                      Not a fit
                    </Button>
                  </div>
                </Card>
              </motion.li>
            );
          })}
        </motion.ol>
      )}

      <CompareModal rows={(results.data?.results ?? []).filter((r: Row) => selected.includes(r.applicationId))} open={compareOpen} onClose={() => setCompareOpen(false)} />

      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail?.candidate.name ?? ''}
        width="max-w-3xl"
        footer={
          detail && (
            <>
              {detail.resume && (
                <Button variant="secondary" icon={<Download className="size-4" />} onClick={() => resumeApi.download(detail.resume!._id, detail.resume!.originalName).catch((e) => toast.error('Download failed', toApiError(e).message))}>
                  Resume
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={async () => {
                  try {
                    await applicationsApi.setNotes(detail.applicationId, notes);
                    toast.success('Notes saved');
                  } catch (err) {
                    toast.error('Could not save notes', toApiError(err).message);
                  }
                }}
              >
                Save notes
              </Button>
            </>
          )
        }
      >
        {detail && (
          <div className="space-y-5">
            {detail.match ? <MatchBreakdown match={detail.match} audience="recruiter" /> : <EmptyState title="Not scored yet" description="Run screening to see this candidate's breakdown." />}
            <DetailExtras applicationId={detail.applicationId} onNotes={setNotes} notes={notes} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!decision}
        onClose={() => setDecision(null)}
        title={decision?.status === 'shortlisted' ? `Shortlist ${decision.row.candidate.name}?` : `Mark ${decision?.row.candidate.name} as not selected?`}
        description={decision?.status === 'shortlisted' ? 'They will be notified that they have been shortlisted.' : 'They will be told the application is not moving forward. You can undo this from the pipeline.'}
        confirmLabel={decision?.status === 'shortlisted' ? 'Shortlist' : 'Mark as not selected'}
        tone={decision?.status === 'rejected' ? 'danger' : 'primary'}
        withNote
        noteLabel="Reason (kept in the status history)"
        onConfirm={(note) => decide(decision!.row, decision!.status, note)}
      />

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Screening settings" description="Per-job settings. The scoring weights are fixed and cannot be changed.">
        {settings && (
          <div className="space-y-5">
            <Switch checked={settings.autoScreenOnApply} onChange={(v) => updateSettings({ autoScreenOnApply: v })} label="Score applicants when they apply" description="Each new application gets a match score straight away." />
            <Switch checked={settings.blindReview} onChange={(v) => updateSettings({ blindReview: v })} label="Blind review" description="Hide candidate names in the ranked list to reduce bias." />
            <Select label="Highlight applicants scoring at least" value={settings.highlightThreshold} onChange={(e) => updateSettings({ highlightThreshold: Number(e.target.value) })} options={[60, 70, 75, 80, 85, 90].map((v) => ({ value: v, label: String(v) }))} />
            <div className="rounded-xl border border-line bg-elevated/60 p-4 text-sm text-ink-muted">Weights: skills 50%, experience 20%, education 10%, role fit 20%.</div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DetailExtras({ applicationId, notes, onNotes }: { applicationId: string; notes: string; onNotes: (n: string) => void }) {
  const { data } = useAsync(() => applicationsApi.get(applicationId), [applicationId]);
  useEffect(() => {
    if (data) onNotes(data.recruiterNotes ?? '');
  }, [data, onNotes]);
  if (!data) return null;
  return (
    <div className="space-y-4">
      {data.coverLetter && (
        <Card className="p-5">
          <h3 className="mb-2 font-bold text-ink">Cover letter</h3>
          <p className="text-sm leading-relaxed whitespace-pre-line text-ink-muted">{data.coverLetter}</p>
        </Card>
      )}
      <Textarea label="Private notes" hint="Visible to you only, never to the candidate" value={notes} onChange={(e) => onNotes(e.target.value)} maxLength={3000} />
    </div>
  );
}
