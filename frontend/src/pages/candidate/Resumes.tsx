import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, CloudUpload, Download, Eye, FileText, GraduationCap, MoreHorizontal, RefreshCw, ShieldAlert, Star, Trash2, Wand2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AIProcessing } from '@/components/ai/AIProcessing';
import { Badge, Button, Card, CardHeader, ConfirmDialog, Dropdown, EmptyState, ErrorState, Modal, PageHeader, ScoreRing, SkeletonCard } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useAsync, usePolling } from '@/hooks';
import { toApiError } from '@/services/api';
import { resumeApi } from '@/services/endpoints';
import type { Resume, ResumeStage } from '@/types';
import { cn, formatBytes, formatDate, timeAgo } from '@/utils/format';

const MAX_MB = 5;
const ACCEPT = ['.pdf', '.docx'];
const PROCESSING: ResumeStage[] = ['uploaded', 'validating', 'extracting', 'detecting_skills', 'analysing_experience', 'generating_report'];

function validateFile(file: File): string | null {
  const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
  if (!ACCEPT.includes(ext)) return 'Only PDF and DOCX files are accepted.';
  if (file.size > MAX_MB * 1024 * 1024) return `This file is ${formatBytes(file.size)}. The limit is ${MAX_MB} MB.`;
  if (file.size < 100) return 'This file looks empty.';
  return null;
}

function Dropzone({ onFile, disabled }: { onFile: (f: File) => void; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="Upload a resume. Drop a PDF or DOCX file here, or press Enter to choose a file."
      onClick={() => !disabled && input.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !disabled && (e.preventDefault(), input.current?.click())}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f && !disabled) onFile(f);
      }}
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[var(--radius-card)] border-2 border-dashed px-6 py-12 text-center transition-[border-color,background-color] duration-200',
        drag ? 'border-primary bg-primary-soft' : 'border-line-strong bg-surface hover:border-primary/60',
        disabled && 'pointer-events-none opacity-60',
      )}
    >
      <motion.span animate={drag ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }} className="flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--violet))] text-white shadow-lifted">
        <CloudUpload className="size-6" aria-hidden />
      </motion.span>
      <p className="mt-4 font-bold text-ink">{drag ? 'Drop to upload' : 'Drag your resume here, or click to browse'}</p>
      <p className="mt-1 text-sm text-ink-muted">PDF or DOCX, up to {MAX_MB} MB. Text-based files work best.</p>
      <input
        ref={input}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) onFile(f);
        }}
      />
    </div>
  );
}

function AnalysisReport({ resume, onApplied }: { resume: Resume; onApplied: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const a = resume.analysis;
  if (!a) return null;
  const p = a.profile;
  const byCategory = p.skills.reduce<Record<string, string[]>>((acc, s) => ((acc[s.category] ??= []).push(s.name), acc), {});
  return (
    <div className="space-y-5">
      {resume.security.flagged && (
        <div role="alert" className="flex gap-3 rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
          <div>
            <p className="font-bold text-ink">{resume.reviewStatus === 'rejected' ? 'This resume did not pass review' : 'Sent for a routine manual review'}</p>
            <p className="mt-0.5 text-ink-muted">
              {resume.reviewStatus === 'rejected'
                ? 'It contained content we cannot accept, such as hidden instructions. Please upload a clean version.'
                : 'We found text that looks like instructions to an AI system, or text hidden from human readers. An administrator will check it; your score is calculated from structured data either way.'}
            </p>
          </div>
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-[auto_1fr]">
        <Card className="flex flex-col items-center gap-2 p-5">
          <ScoreRing score={a.completeness.score} size={96} label={`Resume completeness ${a.completeness.score}%`} />
          <p className="text-sm font-bold text-ink">Completeness</p>
          <p className="text-caption text-ink-faint">{a.extraction_method === 'deterministic' ? 'Rule-based extraction' : 'AI-assisted extraction'}</p>
        </Card>
        <Card className="p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-caption font-semibold text-ink-faint">Experience</p>
              <p className="mt-1 text-xl font-extrabold text-ink">{p.total_experience_years} years</p>
              <p className="text-caption text-ink-muted">{p.experience.length} dated roles found</p>
            </div>
            <div>
              <p className="text-caption font-semibold text-ink-faint">Highest education</p>
              <p className="mt-1 text-xl font-extrabold text-ink">{p.highest_education_label}</p>
            </div>
            <div>
              <p className="text-caption font-semibold text-ink-faint">Skills detected</p>
              <p className="mt-1 text-xl font-extrabold text-ink">{p.skills.length}</p>
              {p.unknown_skills.length > 0 && <p className="text-caption text-ink-muted">{p.unknown_skills.length} sent for taxonomy review</p>}
            </div>
          </div>
          {a.suggestions.length > 0 && (
            <ul className="mt-5 space-y-1.5 border-t border-line pt-4 text-sm text-ink-muted">
              {a.suggestions.map((s) => (
                <li key={s} className="flex gap-2">
                  <Wand2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Skills by category" />
          <div className="space-y-4 p-5">
            {Object.entries(byCategory).map(([cat, skills]) => (
              <div key={cat}>
                <p className="mb-1.5 text-caption font-semibold text-ink-muted">{cat}</p>
                <div className="flex flex-wrap gap-1.5">{skills.map((s) => <Badge key={s} tone="primary">{s}</Badge>)}</div>
              </div>
            ))}
            {!p.skills.length && <p className="text-sm text-ink-muted">No skills recognised. Add a Skills section to your resume.</p>}
          </div>
        </Card>
        <Card>
          <CardHeader title="Experience and education" />
          <ul className="space-y-3 p-5">
            {p.experience.map((e, i) => (
              <li key={i} className="border-l-2 border-primary/40 pl-3">
                <p className="text-sm font-bold text-ink">{e.title || 'Untitled role'}</p>
                <p className="text-caption text-ink-muted">
                  {e.company && `${e.company}, `}
                  {e.start} to {e.end} ({Math.round(e.months / 12 * 10) / 10} yrs)
                </p>
              </li>
            ))}
            {p.education.map((e, i) => (
              <li key={`e${i}`} className="flex gap-2 border-l-2 border-cyan/40 pl-3">
                <GraduationCap className="mt-0.5 size-4 text-cyan" aria-hidden />
                <div>
                  <p className="text-sm font-bold text-ink">{e.degree}</p>
                  <p className="text-caption text-ink-muted">{[e.institution, e.year].filter(Boolean).join(', ')}</p>
                </div>
              </li>
            ))}
            {!p.experience.length && !p.education.length && <li className="text-sm text-ink-muted">No dated roles or degrees were found.</li>}
          </ul>
        </Card>
      </div>
      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <CheckCircle2 className="size-6 shrink-0 text-success" aria-hidden />
        <div className="flex-1">
          <p className="font-bold text-ink">Review and copy to your profile</p>
          <p className="text-sm text-ink-muted">Adds skills you don't already list, and fills experience, education and summary only where your profile is empty. You can edit everything afterwards.</p>
        </div>
        <Button
          loading={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await resumeApi.applyToProfile(resume._id);
              toast.success('Profile updated', 'Check your profile to adjust anything that looks wrong.');
              onApplied();
            } catch (err) {
              toast.error('Could not update profile', toApiError(err).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          Copy to profile
        </Button>
      </Card>
    </div>
  );
}

export default function ResumeHub() {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(() => resumeApi.list(), []);
  const [upload, setUpload] = useState<{ name: string; pct: number } | null>(null);
  const [current, setCurrent] = useState<Resume | null>(null);
  const [deleting, setDeleting] = useState<Resume | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Show the newest resume by default
  useEffect(() => {
    if (!current && data?.length) setCurrent(data[0]);
  }, [data, current]);

  const processing = !!current && PROCESSING.includes(current.status);
  usePolling(
    useCallback(async () => {
      if (!current) return;
      const fresh = await resumeApi.get(current._id);
      setCurrent(fresh);
      if (!PROCESSING.includes(fresh.status)) {
        void reload(true);
        if (fresh.status === 'completed') toast.success('Resume analysed', fresh.security.flagged ? 'It was also sent for a routine manual review.' : `${fresh.analysis?.profile.skills.length ?? 0} skills found.`);
        else toast.error('Processing failed', fresh.error ?? undefined);
      }
    }, [current, reload, toast]),
    processing,
    900,
  );

  const onFile = async (file: File) => {
    const problem = validateFile(file);
    setFileError(problem);
    if (problem) return;
    setUpload({ name: file.name, pct: 0 });
    try {
      const created = await resumeApi.upload(file, (pct) => setUpload({ name: file.name, pct }));
      setUpload(null);
      setCurrent({ _id: created._id, originalName: created.originalName, status: 'uploaded', stageHistory: [], security: { riskScore: 0, riskLevel: 'none', flagged: false, findings: [] }, reviewStatus: 'none', isActive: false, fileType: 'pdf', size: file.size, createdAt: new Date().toISOString() });
    } catch (err) {
      setUpload(null);
      setFileError(toApiError(err).message);
    }
  };

  const activate = async (r: Resume) => {
    try {
      await resumeApi.activate(r._id);
      setData((d) => d?.map((x) => ({ ...x, isActive: x._id === r._id })));
      toast.success('Active resume updated', 'New applications will use this resume.');
    } catch (err) {
      toast.error('Could not set active resume', toApiError(err).message);
    }
  };

  const showPreview = async (r: Resume) => {
    try {
      setPreview({ url: await resumeApi.previewUrl(r._id), name: r.originalName });
    } catch (err) {
      toast.error('Preview unavailable', toApiError(err).message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Resume hub" description="Upload a resume to build your profile and power your match scores. Files stay private to you and the recruiters you apply to." />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <AnimatePresence mode="wait">
              {upload || processing || (current && ['failed'].includes(current.status) && !upload) ? (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AIProcessing stage={upload ? 'uploading' : current!.status} uploadPct={upload?.pct} error={current?.error} fileName={upload?.name ?? current?.originalName} />
                  {current?.status === 'failed' && !upload && (
                    <div className="mt-5 flex flex-wrap justify-end gap-2">
                      <Button variant="ghost" onClick={() => setCurrent(data?.find((r) => r.status === 'completed') ?? null)}>
                        Dismiss
                      </Button>
                      <Button
                        variant="secondary"
                        icon={<RefreshCw className="size-4" />}
                        onClick={async () => {
                          try {
                            await resumeApi.reprocess(current._id);
                            setCurrent({ ...current, status: 'uploaded', error: undefined });
                          } catch (err) {
                            toast.error('Could not retry', toApiError(err).message);
                          }
                        }}
                      >
                        Try again
                      </Button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Dropzone onFile={onFile} />
                  {fileError && (
                    <p role="alert" className="mt-3 flex items-center gap-2 rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
                      <AlertTriangle className="size-4" /> {fileError}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
          {current?.status === 'completed' && current.analysis && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="mb-3 text-h3 font-bold text-ink">Analysis of {current.originalName}</h2>
              <AnalysisReport resume={current} onApplied={() => undefined} />
            </motion.div>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader title="Your resumes" description="The active resume is used for matching and applications" />
          <div className="p-3">
            {loading ? (
              <SkeletonCard lines={3} />
            ) : error ? (
              <ErrorState message={error.message} onRetry={() => reload()} />
            ) : !data?.length ? (
              <EmptyState icon={<FileText className="size-5" />} title="No resumes yet" description="Your uploads will be listed here." className="m-2" />
            ) : (
              <ul className="space-y-1">
                {data.map((r) => (
                  <li key={r._id}>
                    <div className={cn('flex items-center gap-3 rounded-xl px-3 py-3 transition-colors', current?._id === r._id ? 'bg-primary-soft' : 'hover:bg-elevated')}>
                      <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => setCurrent(r)}>
                        <FileText className={cn('size-5 shrink-0', r.fileType === 'pdf' ? 'text-danger' : 'text-primary')} aria-hidden />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-ink">{r.originalName}</span>
                          <span className="block text-caption text-ink-faint">
                            {formatBytes(r.size)}, {timeAgo(r.createdAt)}
                          </span>
                        </span>
                      </button>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {r.isActive && <Badge tone="success">Active</Badge>}
                        {r.security?.flagged && r.reviewStatus !== 'cleared' && <Badge tone="warning">Review</Badge>}
                        {r.status === 'failed' && <Badge tone="danger">Failed</Badge>}
                        {PROCESSING.includes(r.status) && <Badge tone="primary">Processing</Badge>}
                        <Dropdown
                          label={`Actions for ${r.originalName}`}
                          trigger={(props) => (
                            <button {...props} className="rounded-lg p-1.5 text-ink-faint hover:bg-surface hover:text-ink" aria-label={`Actions for ${r.originalName}`}>
                              <MoreHorizontal className="size-4" />
                            </button>
                          )}
                          items={[
                            { label: 'Make active', icon: <Star className="size-4" />, onSelect: () => activate(r), disabled: r.isActive || r.status !== 'completed' },
                            { label: 'Preview', icon: <Eye className="size-4" />, onSelect: () => showPreview(r), disabled: r.fileType !== 'pdf' },
                            { label: 'Download', icon: <Download className="size-4" />, onSelect: () => resumeApi.download(r._id, r.originalName).catch((e) => toast.error('Download failed', toApiError(e).message)) },
                            { label: 'Delete', icon: <Trash2 className="size-4" />, danger: true, onSelect: () => setDeleting(r) },
                          ]}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="border-t border-line px-5 py-3 text-caption text-ink-faint">You can keep up to 10 resumes. {data?.length ? `First uploaded ${formatDate(data[data.length - 1].createdAt)}.` : ''}</p>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete this resume?"
        description={`${deleting?.originalName} and the text extracted from it will be deleted. Applications you already sent keep their match scores.`}
        confirmLabel="Delete resume"
        tone="danger"
        onConfirm={async () => {
          try {
            await resumeApi.remove(deleting!._id);
            setData((d) => d?.filter((r) => r._id !== deleting!._id));
            if (current?._id === deleting!._id) setCurrent(null);
            toast.success('Resume deleted');
          } catch (err) {
            toast.error('Could not delete', toApiError(err).message);
          }
        }}
      />
      <Modal open={!!preview} onClose={() => { if (preview) URL.revokeObjectURL(preview.url); setPreview(null); }} title={preview?.name ?? ''} size="xl">
        {preview && <iframe title={`Preview of ${preview.name}`} src={preview.url} className="h-[70vh] w-full rounded-xl border border-line bg-white" />}
      </Modal>
    </div>
  );
}
