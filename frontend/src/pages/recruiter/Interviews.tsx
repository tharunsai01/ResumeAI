import { AnimatePresence, motion } from 'framer-motion';
import { CalendarClock, CalendarDays, ChevronLeft, ChevronRight, List, MapPin, Plus, Star, Video } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Avatar, Badge, Button, Card, Drawer, EmptyState, ErrorState, Input, Modal, PageHeader, Segmented, Select, SkeletonCard, Textarea } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks';
import { toApiError } from '@/services/api';
import { applicationsApi, interviewsApi } from '@/services/endpoints';
import type { Interview } from '@/types';
import { cn, formatDateTime } from '@/utils/format';

const TYPE_LABEL = { phone: 'Phone', video: 'Video', onsite: 'On-site', technical: 'Technical', hr: 'HR' } as const;
const STATUS_TONE = { scheduled: 'primary', completed: 'success', cancelled: 'neutral', no_show: 'danger' } as const;

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday
  return x;
}
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const toLocalInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

function ScheduleModal({ open, onClose, onDone, initial }: { open: boolean; onClose: () => void; onDone: () => void; initial?: Interview | null }) {
  const toast = useToast();
  const apps = useAsync(() => applicationsApi.forRecruiter({ limit: 100 }), [open], { enabled: open && !initial });
  const eligible = (apps.data?.items ?? []).filter((a) => ['screened', 'shortlisted', 'interview', 'applied'].includes(a.status));
  const defaultTime = () => {
    const d = new Date(Date.now() + 86400000);
    d.setHours(10, 0, 0, 0);
    return toLocalInput(d);
  };
  const [form, setForm] = useState({ applicationId: '', scheduledAt: defaultTime(), durationMinutes: 45, type: 'video', meetingUrl: '', location: '', notes: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (initial) setForm({ applicationId: initial.application, scheduledAt: toLocalInput(new Date(initial.scheduledAt)), durationMinutes: initial.durationMinutes, type: initial.type, meetingUrl: initial.meetingUrl, location: initial.location, notes: initial.notes });
    else setForm((f) => ({ ...f, applicationId: '', scheduledAt: defaultTime() }));
  }, [open, initial]);
  useEffect(() => {
    if (!form.applicationId && eligible.length && !initial) setForm((f) => ({ ...f, applicationId: eligible[0]._id }));
  }, [eligible, form.applicationId, initial]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const body = { ...form, scheduledAt: new Date(form.scheduledAt).toISOString(), durationMinutes: Number(form.durationMinutes) };
    try {
      if (initial) {
        const { applicationId: _a, ...rest } = body;
        await interviewsApi.update(initial._id, rest);
        toast.success('Interview updated', 'The candidate has been notified of the change.');
      } else {
        await interviewsApi.schedule(body);
        toast.success('Interview scheduled', 'The candidate has been notified.');
      }
      onDone();
      onClose();
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Reschedule interview' : 'Schedule an interview'}
      description="The candidate is notified with the time and meeting link."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy} disabled={!form.applicationId}>
            {initial ? 'Save changes' : 'Schedule interview'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {!initial && (
          <Select
            wrapperClassName="sm:col-span-2"
            label="Candidate and job"
            value={form.applicationId}
            onChange={(e) => setForm({ ...form, applicationId: e.target.value })}
            options={eligible.length ? eligible.map((a) => ({ value: a._id, label: `${typeof a.candidate === 'string' ? 'Candidate' : a.candidate.name}, ${a.job?.title}` })) : [{ value: '', label: apps.loading ? 'Loading applicants' : 'No eligible applicants' }]}
          />
        )}
        <Input label="Date and time" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
        <Select label="Duration" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} options={[15, 30, 45, 60, 90, 120].map((m) => ({ value: m, label: `${m} minutes` }))} />
        <Select label="Interview type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label }))} />
        <Input label="Meeting link" type="url" placeholder="https://" value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })} />
        <Input wrapperClassName="sm:col-span-2" label="Location (for on-site)" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <Textarea wrapperClassName="sm:col-span-2" label="Notes for interviewers" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-20" />
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </Modal>
  );
}

function FeedbackForm({ interview, onSaved }: { interview: Interview; onSaved: (i: Interview) => void }) {
  const toast = useToast();
  const [rating, setRating] = useState(interview.feedback?.rating ?? 0);
  const [form, setForm] = useState({ strengths: interview.feedback?.strengths ?? '', concerns: interview.feedback?.concerns ?? '', recommendation: interview.feedback?.recommendation ?? 'hold', notes: interview.feedback?.notes ?? '' });
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!rating) return toast.warning('Pick a rating from 1 to 5');
        setBusy(true);
        try {
          onSaved(await interviewsApi.feedback(interview._id, { ...form, rating }));
          toast.success('Feedback saved');
        } catch (err) {
          toast.error('Could not save feedback', toApiError(err).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset>
        <legend className="mb-2 text-[0.8125rem] font-semibold text-ink">Overall rating</legend>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} of 5`} whileTap={{ scale: 0.85 }} onClick={() => setRating(n)} className="rounded-lg p-1">
              <Star className={cn('size-7 transition-colors', n <= rating ? 'fill-warning text-warning' : 'text-line-strong')} />
            </motion.button>
          ))}
        </div>
      </fieldset>
      <Textarea label="Strengths" value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} className="min-h-20" />
      <Textarea label="Concerns" value={form.concerns} onChange={(e) => setForm({ ...form, concerns: e.target.value })} className="min-h-20" />
      <Select label="Recommendation" value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value as 'hold' })} options={[{ value: 'advance', label: 'Advance' }, { value: 'hold', label: 'Hold' }, { value: 'decline', label: 'Decline' }]} />
      <Textarea label="Other notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-16" />
      <Button type="submit" loading={busy} className="w-full">
        Save feedback
      </Button>
    </form>
  );
}

export default function Interviews() {
  const toast = useToast();
  const [view, setView] = useState<'week' | 'list'>('week');
  const [week, setWeek] = useState(() => startOfWeek(new Date()));
  const range = view === 'week' ? { from: week.toISOString(), to: addDays(week, 7).toISOString() } : {};
  const { data, loading, error, reload, setData } = useAsync(() => interviewsApi.list(range), [view, week.getTime()]);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editing, setEditing] = useState<Interview | null>(null);
  const [selected, setSelected] = useState<Interview | null>(null);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(week, i)), [week]);

  const setStatus = async (i: Interview, status: Interview['status']) => {
    try {
      const updated = await interviewsApi.update(i._id, { status });
      setData((d) => d?.map((x) => (x._id === i._id ? { ...x, status: updated.status } : x)));
      setSelected((s) => (s ? { ...s, status: updated.status } : s));
      toast.success(`Marked as ${status.replace('_', ' ')}`);
    } catch (err) {
      toast.error('Could not update', toApiError(err).message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Interviews"
        description="Your schedule. Times are shown in your local time zone."
        actions={
          <>
            <Segmented label="View" value={view} onChange={setView} options={[{ value: 'week', label: 'Week', icon: <CalendarDays className="size-4" /> }, { value: 'list', label: 'All', icon: <List className="size-4" /> }]} />
            <Button icon={<Plus className="size-4" />} onClick={() => { setEditing(null); setScheduleOpen(true); }}>
              Schedule
            </Button>
          </>
        }
      />
      {view === 'week' && (
        <div className="mb-4 flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={() => setWeek(addDays(week, -7))} aria-label="Previous week">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={() => setWeek(addDays(week, 7))} aria-label="Next week">
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setWeek(startOfWeek(new Date()))}>
            This week
          </Button>
          <p className="ml-2 text-sm font-semibold text-ink">
            {week.toLocaleDateString('en', { month: 'long', day: 'numeric' })} to {addDays(week, 6).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      )}
      {loading ? (
        <SkeletonCard lines={8} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => reload()} />
      ) : view === 'week' ? (
        <AnimatePresence mode="wait">
          <motion.div key={week.toISOString()} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="grid gap-3 md:grid-cols-7">
            {days.map((d) => {
              const today = sameDay(d, new Date());
              const items = (data ?? []).filter((i) => sameDay(new Date(i.scheduledAt), d));
              return (
                <Card key={d.toISOString()} className={cn('flex min-h-40 flex-col p-3', today && 'border-primary/50')}>
                  <p className={cn('mb-2 text-caption font-bold', today ? 'text-primary' : 'text-ink-muted')}>
                    {d.toLocaleDateString('en', { weekday: 'short' })} {d.getDate()}
                  </p>
                  <ul className="space-y-2">
                    {items.map((i) => (
                      <li key={i._id}>
                        <button onClick={() => setSelected(i)} className={cn('w-full rounded-xl border-l-4 bg-elevated/70 p-2 text-left text-xs transition-colors hover:bg-elevated', i.status === 'cancelled' ? 'border-line-strong opacity-60' : i.status === 'completed' ? 'border-success' : 'border-primary')}>
                          <span className="block font-bold text-ink">{new Date(i.scheduledAt).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</span>
                          <span className="block truncate font-semibold text-ink">{i.candidate?.name}</span>
                          <span className="block truncate text-ink-muted">{TYPE_LABEL[i.type]}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </motion.div>
        </AnimatePresence>
      ) : !data?.length ? (
        <EmptyState icon={<CalendarClock className="size-5" />} title="No interviews yet" description="Schedule an interview with a shortlisted candidate." action={<Button onClick={() => setScheduleOpen(true)}>Schedule interview</Button>} />
      ) : (
        <ul className="space-y-3">
          {data.map((i) => (
            <li key={i._id}>
              <Card className="flex flex-wrap items-center gap-4 p-4">
                <Avatar name={i.candidate?.name ?? '?'} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">{i.candidate?.name}</p>
                  <p className="text-sm text-ink-muted">{i.job?.title}</p>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-ink">{formatDateTime(i.scheduledAt)}</p>
                  <p className="text-ink-muted">
                    {TYPE_LABEL[i.type]}, {i.durationMinutes} min
                  </p>
                </div>
                <Badge tone={STATUS_TONE[i.status]}>{i.status.replace('_', ' ')}</Badge>
                <Button variant="secondary" size="sm" onClick={() => setSelected(i)}>
                  Details
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} onDone={() => reload(true)} initial={editing} />

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected ? `${selected.candidate?.name}: ${TYPE_LABEL[selected.type]} interview` : ''} width="max-w-lg">
        {selected && (
          <div className="space-y-6">
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-ink">{selected.job?.title}</p>
              <p className="flex items-center gap-2 text-ink-muted">
                <CalendarClock className="size-4" /> {formatDateTime(selected.scheduledAt)}, {selected.durationMinutes} minutes
              </p>
              {selected.meetingUrl && (
                <a href={selected.meetingUrl} target="_blank" rel="noreferrer noopener" className="flex items-center gap-2 font-semibold text-primary hover:underline">
                  <Video className="size-4" /> Join meeting
                </a>
              )}
              {selected.location && (
                <p className="flex items-center gap-2 text-ink-muted">
                  <MapPin className="size-4" /> {selected.location}
                </p>
              )}
              {selected.notes && <p className="rounded-xl bg-elevated/70 p-3 text-ink-muted">{selected.notes}</p>}
              <Badge tone={STATUS_TONE[selected.status]}>{selected.status.replace('_', ' ')}</Badge>
            </div>
            {selected.status === 'scheduled' && (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => { setEditing(selected); setScheduleOpen(true); }}>
                  Reschedule
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setStatus(selected, 'completed')}>
                  Mark completed
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setStatus(selected, 'no_show')}>
                  No-show
                </Button>
                <Button variant="ghost" size="sm" className="text-danger" onClick={() => setStatus(selected, 'cancelled')}>
                  Cancel interview
                </Button>
              </div>
            )}
            <div>
              <h3 className="mb-3 font-bold text-ink">Interview feedback</h3>
              <FeedbackForm
                key={selected._id}
                interview={selected}
                onSaved={(u) => {
                  setSelected({ ...selected, feedback: u.feedback, status: u.status });
                  setData((d) => d?.map((x) => (x._id === u._id ? { ...x, feedback: u.feedback, status: u.status } : x)));
                }}
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
