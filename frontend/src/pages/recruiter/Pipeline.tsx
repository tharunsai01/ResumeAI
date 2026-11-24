import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { GripVertical, History, KanbanSquare, MoreHorizontal, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Avatar, Badge, ConfirmDialog, Drawer, Dropdown, EmptyState, ErrorState, Input, PageHeader, ScoreRing, Select, Skeleton } from '@/components/ui';
import { spring } from '@/config/motion';
import { useToast } from '@/context/ToastContext';
import { useAsync, useDebounce } from '@/hooks';
import { toApiError } from '@/services/api';
import { applicationsApi, jobsApi } from '@/services/endpoints';
import type { Application, ApplicationStatus } from '@/types';
import { cn, formatDateTime, STATUS_LABEL, timeAgo } from '@/utils/format';

const COLUMNS: ApplicationStatus[] = ['applied', 'screened', 'shortlisted', 'interview', 'hired', 'rejected'];
/** Mirrors the API's allowed transitions so invalid drops are refused before a request is sent. */
const TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  applied: ['screened', 'shortlisted', 'rejected'],
  screened: ['applied', 'shortlisted', 'rejected'],
  shortlisted: ['screened', 'interview', 'rejected'],
  interview: ['shortlisted', 'hired', 'rejected'],
  hired: [],
  rejected: ['applied', 'screened', 'shortlisted'],
  withdrawn: [],
};
const COLUMN_TONE: Record<string, string> = {
  applied: 'bg-ink-faint',
  screened: 'bg-primary',
  shortlisted: 'bg-cyan',
  interview: 'bg-violet',
  hired: 'bg-success',
  rejected: 'bg-danger',
};

const candidateName = (a: Application) => (typeof a.candidate === 'string' ? 'Candidate' : a.candidate.name);

function CardBody({ app, dragging }: { app: Application; dragging?: boolean }) {
  const last = app.statusHistory[app.statusHistory.length - 1];
  return (
    <div className={cn('rounded-2xl border border-line bg-surface p-3.5 shadow-soft', dragging && 'rotate-[1.5deg] border-primary/50 shadow-lifted')}>
      <div className="flex items-start gap-2.5">
        <Avatar name={candidateName(app)} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{candidateName(app)}</p>
          <p className="truncate text-caption text-ink-muted">{app.job?.title}</p>
        </div>
        {app.matchScore != null && <ScoreRing score={app.matchScore} size={34} stroke={3.5} />}
      </div>
      <p className="mt-2.5 text-[0.6875rem] text-ink-faint">In this stage since {timeAgo(last?.at ?? app.createdAt)}</p>
    </div>
  );
}

function DraggableCard({ app, onMove, onHistory }: { app: Application; onMove: (a: Application, to: ApplicationStatus) => void; onHistory: (a: Application) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: app._id, data: { app } });
  return (
    <motion.li layout layoutId={app._id} transition={spring.layout} className={cn('group relative', isDragging && 'opacity-30')}>
      <div ref={setNodeRef} {...listeners} {...attributes} aria-roledescription="Draggable candidate card" aria-label={`${candidateName(app)}, ${STATUS_LABEL[app.status]}. Press space to pick up.`} className="cursor-grab touch-none rounded-2xl active:cursor-grabbing">
        <CardBody app={app} />
      </div>
      <div className="absolute top-2 right-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <Dropdown
          label={`Actions for ${candidateName(app)}`}
          trigger={(props) => (
            <button {...props} className="rounded-lg bg-surface p-1 text-ink-faint shadow-soft hover:text-ink" aria-label={`Move ${candidateName(app)}`}>
              <MoreHorizontal className="size-4" />
            </button>
          )}
          items={[
            ...TRANSITIONS[app.status].map((to) => ({ label: `Move to ${STATUS_LABEL[to]}`, onSelect: () => onMove(app, to) })),
            { label: 'Status history', icon: <History className="size-4" />, onSelect: () => onHistory(app) },
          ]}
        />
      </div>
    </motion.li>
  );
}

function Column({ status, apps, activeFrom, onMove, onHistory }: { status: ApplicationStatus; apps: Application[]; activeFrom: ApplicationStatus | null; onMove: (a: Application, to: ApplicationStatus) => void; onHistory: (a: Application) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const allowed = activeFrom ? activeFrom === status || TRANSITIONS[activeFrom].includes(status) : true;
  return (
    <section aria-label={`${STATUS_LABEL[status]}, ${apps.length} candidates`} className="flex w-72 shrink-0 flex-col">
      <header className="mb-3 flex items-center gap-2 px-1">
        <span className={cn('size-2 rounded-full', COLUMN_TONE[status])} />
        <h2 className="text-sm font-bold text-ink">{STATUS_LABEL[status]}</h2>
        <motion.span key={apps.length} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="tabular ml-auto rounded-full bg-elevated px-2 py-0.5 text-caption font-bold text-ink-muted">
          {apps.length}
        </motion.span>
      </header>
      <ul
        ref={setNodeRef}
        className={cn(
          'scrollbar-thin flex min-h-[22rem] flex-1 flex-col gap-2.5 overflow-y-auto rounded-2xl border border-dashed p-2.5 transition-colors duration-150',
          isOver && allowed ? 'border-primary bg-primary-soft' : isOver ? 'border-danger bg-danger-soft' : activeFrom && !allowed ? 'border-line opacity-50' : 'border-line bg-elevated/40',
        )}
      >
        <AnimatePresence initial={false}>
          {apps.map((a) => (
            <DraggableCard key={a._id} app={a} onMove={onMove} onHistory={onHistory} />
          ))}
        </AnimatePresence>
        {!apps.length && <li className="flex flex-1 items-center justify-center px-4 text-center text-caption text-ink-faint">Drop candidates here</li>}
      </ul>
    </section>
  );
}

export default function Pipeline() {
  const toast = useToast();
  const [jobId, setJobId] = useState('');
  const [q, setQ] = useState('');
  const query = useDebounce(q);
  const jobs = useAsync(() => jobsApi.mine({ limit: 50 }), []);
  const { data, loading, error, reload, setData } = useAsync(() => applicationsApi.forRecruiter({ jobId, q: query, limit: 100 }), [jobId, query]);
  const [active, setActive] = useState<Application | null>(null);
  const [pending, setPending] = useState<{ app: Application; to: ApplicationStatus } | null>(null);
  const [history, setHistory] = useState<Application | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));

  const grouped = useMemo(() => {
    const g = Object.fromEntries(COLUMNS.map((c) => [c, [] as Application[]])) as Record<ApplicationStatus, Application[]>;
    for (const a of data?.items ?? []) if (g[a.status]) g[a.status].push(a);
    return g;
  }, [data]);

  const commit = async (app: Application, to: ApplicationStatus, note?: string) => {
    const before = data;
    setData((d) => (d ? { ...d, items: d.items.map((a) => (a._id === app._id ? { ...a, status: to, statusHistory: [...a.statusHistory, { from: a.status, to, actor: 'recruiter', note, at: new Date().toISOString() }] } : a)) } : d));
    try {
      await applicationsApi.setStatus(app._id, to, note);
      toast.success(`${candidateName(app)} moved to ${STATUS_LABEL[to]}`, 'The candidate has been notified.');
    } catch (err) {
      setData(before);
      toast.error('Move failed', toApiError(err).message);
    }
  };

  const requestMove = (app: Application, to: ApplicationStatus) => {
    if (app.status === to) return;
    if (!TRANSITIONS[app.status].includes(to)) {
      toast.warning(`Can't move from ${STATUS_LABEL[app.status]} to ${STATUS_LABEL[to]}`, to === 'hired' ? 'Candidates need an interview stage before an offer.' : undefined);
      return;
    }
    if (to === 'hired' || to === 'rejected' || to === 'interview') setPending({ app, to });
    else void commit(app, to);
  };

  const onDragStart = (e: DragStartEvent) => setActive((e.active.data.current as { app: Application }).app);
  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    const app = (e.active.data.current as { app: Application } | undefined)?.app;
    if (app && e.over) requestMove(app, e.over.id as ApplicationStatus);
  };

  return (
    <div>
      <PageHeader title="Hiring pipeline" description="Drag candidates between stages, or use a card's menu. Every move is recorded and the candidate is notified." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[18rem_16rem]">
        <Select label="Job" value={jobId} onChange={(e) => setJobId(e.target.value)} options={[{ value: '', label: 'All jobs' }, ...(jobs.data?.items ?? []).map((j) => ({ value: j._id, label: j.title }))]} />
        <Input label="Search candidates" leading={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {COLUMNS.map((c) => (
            <Skeleton key={c} className="h-96 w-72 shrink-0 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => reload()} />
      ) : !data?.items.length ? (
        <EmptyState icon={<KanbanSquare className="size-5" />} title="No candidates in the pipeline" description={query ? 'No candidate names match your search.' : 'Applications appear here as candidates apply.'} />
      ) : (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActive(null)}>
          <div className="scrollbar-thin -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            {COLUMNS.map((c) => (
              <Column key={c} status={c} apps={grouped[c]} activeFrom={active?.status ?? null} onMove={requestMove} onHistory={setHistory} />
            ))}
          </div>
          <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
            {active ? (
              <div className="w-72">
                <CardBody app={active} dragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      <p className="mt-2 flex items-center gap-1.5 text-caption text-ink-faint">
        <GripVertical className="size-3.5" /> Keyboard: focus a card, press space, use arrow keys, press space again to drop.
      </p>

      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        title={pending ? `Move ${candidateName(pending.app)} to ${STATUS_LABEL[pending.to]}?` : ''}
        description={pending?.to === 'hired' ? 'This records a hiring decision and notifies the candidate.' : pending?.to === 'rejected' ? 'The candidate will be told this application is not moving forward.' : 'Schedule the interview from the Interviews page so the candidate gets the time and link.'}
        confirmLabel={pending ? `Move to ${STATUS_LABEL[pending.to]}` : 'Move'}
        tone={pending?.to === 'rejected' ? 'danger' : 'primary'}
        withNote
        noteLabel="Note for the status history (optional)"
        onConfirm={(note) => commit(pending!.app, pending!.to, note)}
      />

      <Drawer open={!!history} onClose={() => setHistory(null)} title={history ? `${candidateName(history)}: status history` : ''} width="max-w-md">
        {history && (
          <ol className="space-y-4 border-l-2 border-line pl-5">
            {[...history.statusHistory].reverse().map((h, i) => (
              <li key={i} className="relative">
                <span className={cn('absolute top-1 -left-[1.65rem] size-3 rounded-full border-2 border-surface', COLUMN_TONE[h.to] ?? 'bg-primary')} />
                <p className="text-sm font-bold text-ink">
                  {h.from ? `${STATUS_LABEL[h.from]} to ${STATUS_LABEL[h.to]}` : STATUS_LABEL[h.to]}
                </p>
                <p className="text-caption text-ink-faint">
                  {formatDateTime(h.at)} by {h.actor === 'system' ? 'automatic screening' : h.actor}
                </p>
                {h.note && <p className="mt-1 text-sm text-ink-muted">{h.note}</p>}
              </li>
            ))}
          </ol>
        )}
        {history && <Badge className="mt-6">{history.job?.title}</Badge>}
      </Drawer>
    </div>
  );
}
