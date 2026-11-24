import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Ban, Briefcase, CheckCircle2, Cpu, Database, FileText, HeartPulse, MessageSquare, Pencil, Plus, RefreshCw, Search, Server, ShieldAlert, ShieldCheck, Tags, Trash2, UserCheck, Users, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DonutChart, TimelineChart } from '@/components/charts/Charts';
import { Avatar, Badge, Button, Card, CardHeader, ConfirmDialog, DashboardSkeleton, DataTable, Drawer, EmptyState, ErrorState, Input, Modal, PageHeader, Pagination, Select, SkeletonCard, SkeletonTable, StatCard, Tabs, TagInput, Textarea } from '@/components/ui';
import { fadeUp, staggerChildren } from '@/config/motion';
import { useToast } from '@/context/ToastContext';
import { useAsync, useDebounce, usePolling } from '@/hooks';
import { toApiError } from '@/services/api';
import { adminApi, complaintsApi, skillsApi } from '@/services/endpoints';
import type { AuditLog, Complaint, Skill, User } from '@/types';
import { cn, formatDate, formatDateTime, STATUS_LABEL, timeAgo } from '@/utils/format';

const SEVERITY_TONE = { info: 'neutral', warning: 'warning', critical: 'danger' } as const;

// --- Overview -------------------------------------------------------------------------------------
export function AdminOverview() {
  const { data, loading, error, reload } = useAsync(() => adminApi.analytics(), []);
  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <ErrorState message={error?.message ?? 'Could not load analytics'} onRetry={() => reload()} />;
  const t = data.totals;
  const statusData = Object.entries(data.applicationsByStatus as Record<string, number>).map(([k, v]) => ({ name: STATUS_LABEL[k as keyof typeof STATUS_LABEL] ?? k, value: v }));
  return (
    <motion.div variants={staggerChildren(0.06)} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <PageHeader title="Platform overview" description="Live counts from the database. Nothing on this page is estimated." />
      </motion.div>
      {(t.flaggedResumes > 0 || t.openTickets > 0) && (
        <motion.div variants={fadeUp} className="grid gap-3 md:grid-cols-2">
          {t.flaggedResumes > 0 && (
            <Link to="/admin/security" className="flex items-center gap-3 rounded-2xl border border-warning/40 bg-warning-soft p-4 transition-colors hover:border-warning">
              <ShieldAlert className="size-5 text-warning" aria-hidden />
              <span className="text-sm font-semibold text-ink">{t.flaggedResumes} flagged {t.flaggedResumes === 1 ? 'resume needs' : 'resumes need'} review</span>
            </Link>
          )}
          {t.openTickets > 0 && (
            <Link to="/admin/complaints" className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary-soft p-4 transition-colors hover:border-primary">
              <MessageSquare className="size-5 text-primary" aria-hidden />
              <span className="text-sm font-semibold text-ink">{t.openTickets} open support {t.openTickets === 1 ? 'ticket' : 'tickets'}</span>
            </Link>
          )}
        </motion.div>
      )}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Users" value={t.users} icon={<Users className="size-4" />} hint={`${t.suspended} suspended`} />
        <StatCard label="Candidates" value={t.candidates} icon={<UserCheck className="size-4" />} tone="cyan" />
        <StatCard label="Recruiters" value={t.recruiters} icon={<Briefcase className="size-4" />} tone="violet" />
        <StatCard label="Jobs" value={t.jobs} icon={<Briefcase className="size-4" />} hint={`${t.publishedJobs} published`} />
        <StatCard label="Applications" value={t.applications} icon={<FileText className="size-4" />} tone="success" />
        <StatCard label="Resumes" value={t.resumes} icon={<FileText className="size-4" />} tone="warning" hint={`${t.interviews} interviews booked`} />
      </motion.div>
      <motion.div variants={fadeUp} className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Platform activity" description="Daily totals, last 30 days" />
          <div className="p-5 pt-3">
            <TimelineChart data={data.series} height={260} series={[{ key: 'registrations', name: 'Registrations', color: 'primary' }, { key: 'applications', name: 'Applications', color: 'cyan' }, { key: 'resumes', name: 'Resumes', color: 'violet' }]} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Applications by status" />
          <div className="p-5">{statusData.length ? <DonutChart data={statusData} centerLabel="applications" /> : <EmptyState title="No applications yet" />}</div>
        </Card>
      </motion.div>
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader title="Recent audit events" action={<Link to="/admin/audit" className="text-sm font-semibold text-primary hover:underline">Full audit log</Link>} />
          <ul className="divide-y divide-line px-5 pb-2">
            {data.recentActivity.map((a: AuditLog) => (
              <li key={a._id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <Badge tone={SEVERITY_TONE[a.severity]}>{a.severity}</Badge>
                  <span className="truncate font-semibold text-ink">{a.action}</span>
                  <span className="hidden truncate text-ink-muted sm:inline">{a.actorEmail}</span>
                </div>
                <span className="shrink-0 text-caption text-ink-faint">{timeAgo(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// --- Users ----------------------------------------------------------------------------------------
function UserDrawer({ id, onClose, onChanged }: { id: string | null; onClose: () => void; onChanged: () => void }) {
  const toast = useToast();
  const { data, loading, reload } = useAsync(() => (id ? adminApi.user(id) : Promise.resolve(null)), [id]);
  const [suspending, setSuspending] = useState(false);
  const u: User | undefined = data?.user;
  return (
    <Drawer open={!!id} onClose={onClose} title={u?.name ?? 'User'} width="max-w-lg">
      {loading || !data || !u ? (
        <SkeletonCard lines={8} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar name={u.name} size="lg" />
            <div>
              <p className="font-bold text-ink">{u.email}</p>
              <div className="mt-1 flex gap-2">
                <Badge tone="primary">{u.role}</Badge>
                <Badge tone={u.status === 'active' ? 'success' : 'danger'} dot>
                  {u.status}
                </Badge>
              </div>
            </div>
          </div>
          {u.status === 'suspended' && u.suspendedReason && <p className="rounded-xl bg-danger-soft p-3 text-sm text-danger">Suspended: {u.suspendedReason}</p>}
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-line p-3">
              <dt className="text-caption text-ink-faint">Joined</dt>
              <dd className="font-semibold text-ink">{formatDate(u.createdAt)}</dd>
            </div>
            <div className="rounded-xl border border-line p-3">
              <dt className="text-caption text-ink-faint">Last sign-in</dt>
              <dd className="font-semibold text-ink">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'Never'}</dd>
            </div>
            {Object.entries(data.stats ?? {}).map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line p-3">
                <dt className="text-caption text-ink-faint capitalize">{k}</dt>
                <dd className="tabular font-semibold text-ink">{String(v)}</dd>
              </div>
            ))}
          </dl>
          {u.role !== 'admin' && (
            <div className="flex gap-2">
              {u.status === 'active' ? (
                <Button variant="danger" icon={<Ban className="size-4" />} onClick={() => setSuspending(true)}>
                  Suspend account
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  icon={<UserCheck className="size-4" />}
                  onClick={async () => {
                    try {
                      await adminApi.reactivate(u._id);
                      toast.success('Account reactivated');
                      void reload(true);
                      onChanged();
                    } catch (err) {
                      toast.error('Could not reactivate', toApiError(err).message);
                    }
                  }}
                >
                  Reactivate account
                </Button>
              )}
            </div>
          )}
          <div>
            <h3 className="mb-3 font-bold text-ink">Account history</h3>
            <ol className="space-y-3 border-l-2 border-line pl-4">
              {data.history.map((h: AuditLog) => (
                <li key={h._id} className="text-sm">
                  <p className="font-semibold text-ink">{h.action}</p>
                  <p className="text-caption text-ink-faint">
                    {formatDateTime(h.createdAt)}
                    {h.ip ? `, from ${h.ip}` : ''}
                  </p>
                </li>
              ))}
              {!data.history.length && <li className="text-sm text-ink-muted">No recorded activity.</li>}
            </ol>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={suspending}
        onClose={() => setSuspending(false)}
        title={`Suspend ${u?.name}?`}
        description="They will be signed out everywhere and cannot sign in until reactivated."
        confirmLabel="Suspend"
        tone="danger"
        withNote
        noteRequired
        noteLabel="Reason (recorded in the audit log)"
        onConfirm={async (reason) => {
          try {
            await adminApi.suspend(u!._id, reason);
            toast.success('Account suspended');
            void reload(true);
            onChanged();
          } catch (err) {
            toast.error('Could not suspend', toApiError(err).message);
          }
        }}
      />
    </Drawer>
  );
}

export function AdminUsers() {
  const [q, setQ] = useState('');
  const query = useDebounce(q);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);
  const { data, loading, error, reload } = useAsync(() => adminApi.users({ q: query, role, status, page, limit: 20 }), [query, role, status, page]);
  useEffect(() => setPage(1), [query, role, status]);
  return (
    <div>
      <PageHeader title="Users" description="Search accounts, review their history and suspend or reactivate them." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_12rem_12rem]">
        <Input aria-label="Search users" placeholder="Name or email" leading={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} />
        <Select aria-label="Role" value={role} onChange={(e) => setRole(e.target.value)} options={[{ value: '', label: 'All roles' }, { value: 'candidate', label: 'Candidates' }, { value: 'recruiter', label: 'Recruiters' }, { value: 'admin', label: 'Admins' }]} />
        <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: '', label: 'Any status' }, { value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} />
      </div>
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => reload()} />
      ) : (
        <>
          <DataTable
            caption="Users"
            rows={data?.items ?? []}
            rowKey={(u) => u._id}
            onRowClick={(u) => setOpen(u._id)}
            empty={<EmptyState icon={<Users className="size-5" />} title="No users match" />}
            columns={[
              { key: 'name', header: 'User', primary: true, cell: (u) => <div className="flex items-center gap-3"><Avatar name={u.name} size="sm" /><div className="min-w-0"><p className="truncate font-semibold text-ink">{u.name}</p><p className="truncate text-caption text-ink-muted">{u.email}</p></div></div> },
              { key: 'role', header: 'Role', cell: (u) => <Badge tone={u.role === 'admin' ? 'violet' : u.role === 'recruiter' ? 'cyan' : 'primary'}>{u.role}</Badge> },
              { key: 'status', header: 'Status', cell: (u) => <Badge tone={u.status === 'active' ? 'success' : 'danger'} dot>{u.status}</Badge> },
              { key: 'provider', header: 'Sign-in', hideOnMobile: true, cell: (u) => <span className="text-ink-muted capitalize">{u.authProvider}</span> },
              { key: 'joined', header: 'Joined', hideOnMobile: true, cell: (u) => <span className="text-ink-muted">{formatDate(u.createdAt)}</span> },
            ]}
          />
          <Pagination page={page} pages={data?.meta?.pages ?? 1} total={data?.meta?.total} onChange={setPage} />
        </>
      )}
      <UserDrawer id={open} onClose={() => setOpen(null)} onChanged={() => reload(true)} />
    </div>
  );
}

// --- Complaints -------------------------------------------------------------------------------------
const PRIORITY_TONE = { low: 'neutral', medium: 'primary', high: 'warning', urgent: 'danger' } as const;
const TICKET_TONE = { open: 'primary', in_progress: 'warning', resolved: 'success', closed: 'neutral' } as const;

export function TicketThread({ id, admin, onChanged }: { id: string; admin?: boolean; onChanged?: () => void }) {
  const toast = useToast();
  const { data, loading, reload, setData } = useAsync(() => complaintsApi.get(id), [id]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  if (loading || !data) return <SkeletonCard lines={6} />;
  const author = (a: Complaint['responses'][number]['author']) => (typeof a === 'string' ? 'User' : a.name);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Badge tone={TICKET_TONE[data.status]}>{data.status.replace('_', ' ')}</Badge>
        <Badge tone={PRIORITY_TONE[data.priority]}>{data.priority} priority</Badge>
        <Badge>{data.category}</Badge>
      </div>
      {admin && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Select label="Status" value={data.status} onChange={async (e) => { try { setData(await adminApi.updateComplaint(id, { status: e.target.value })); onChanged?.(); void reload(true); } catch (err) { toast.error('Update failed', toApiError(err).message); } }} options={['open', 'in_progress', 'resolved', 'closed'].map((s) => ({ value: s, label: s.replace('_', ' ') }))} />
          <Select label="Priority" value={data.priority} onChange={async (e) => { try { setData(await adminApi.updateComplaint(id, { priority: e.target.value })); onChanged?.(); void reload(true); } catch (err) { toast.error('Update failed', toApiError(err).message); } }} options={['low', 'medium', 'high', 'urgent'].map((s) => ({ value: s, label: s }))} />
        </div>
      )}
      <ol className="space-y-3">
        <li className="rounded-2xl border border-line p-4">
          <p className="text-caption text-ink-faint">
            {typeof data.user === 'string' ? '' : data.user.name}, {formatDateTime(data.createdAt)}
          </p>
          <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-ink">{data.description}</p>
        </li>
        {data.responses.map((r, i) => (
          <motion.li key={r._id ?? i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn('rounded-2xl p-4', r.role === 'admin' ? 'ml-6 bg-primary-soft' : 'mr-6 border border-line')}>
            <p className="text-caption text-ink-faint">
              {author(r.author)} {r.role === 'admin' && '(support)'}, {formatDateTime(r.at)}
            </p>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-ink">{r.message}</p>
          </motion.li>
        ))}
      </ol>
      {data.history.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold text-ink-muted">Resolution history ({data.history.length})</summary>
          <ul className="mt-2 space-y-1 text-caption text-ink-muted">
            {data.history.map((h, i) => (
              <li key={i}>
                {h.field} changed from {h.from} to {h.to}, {formatDateTime(h.at)}
              </li>
            ))}
          </ul>
        </details>
      )}
      {data.status !== 'closed' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!message.trim()) return;
            setBusy(true);
            try {
              setData(await complaintsApi.respond(id, message.trim()));
              setMessage('');
              void reload(true);
              onChanged?.();
            } catch (err) {
              toast.error('Could not send reply', toApiError(err).message);
            } finally {
              setBusy(false);
            }
          }}
          className="space-y-2"
        >
          <Textarea label="Reply" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={5000} className="min-h-24" />
          <div className="flex justify-end">
            <Button type="submit" loading={busy} disabled={!message.trim()}>
              Send reply
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function AdminComplaints() {
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<Complaint | null>(null);
  const { data, loading, error, reload } = useAsync(() => adminApi.complaints({ status, priority, page, limit: 20 }), [status, priority, page]);
  return (
    <div>
      <PageHeader title="Support tickets" description="Complaints and questions from candidates and recruiters." />
      <div className="mb-5 grid gap-3 sm:w-[28rem] sm:grid-cols-2">
        <Select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} options={[{ value: '', label: 'Any status' }, ...['open', 'in_progress', 'resolved', 'closed'].map((s) => ({ value: s, label: s.replace('_', ' ') }))]} />
        <Select aria-label="Priority" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }} options={[{ value: '', label: 'Any priority' }, ...['urgent', 'high', 'medium', 'low'].map((s) => ({ value: s, label: s }))]} />
      </div>
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => reload()} />
      ) : (
        <>
          <DataTable
            caption="Support tickets"
            rows={data?.items ?? []}
            rowKey={(c) => c._id}
            onRowClick={setOpen}
            empty={<EmptyState icon={<MessageSquare className="size-5" />} title="No tickets" description="Nothing matches these filters." />}
            columns={[
              { key: 'subject', header: 'Subject', primary: true, cell: (c) => <div><p className="font-semibold text-ink">{c.subject}</p><p className="text-caption text-ink-muted">{typeof c.user === 'string' ? '' : `${c.user.name}, ${c.user.role}`}</p></div> },
              { key: 'priority', header: 'Priority', cell: (c) => <Badge tone={PRIORITY_TONE[c.priority]}>{c.priority}</Badge> },
              { key: 'status', header: 'Status', cell: (c) => <Badge tone={TICKET_TONE[c.status]} dot>{c.status.replace('_', ' ')}</Badge> },
              { key: 'replies', header: 'Replies', hideOnMobile: true, className: 'tabular', cell: (c) => c.responses.length },
              { key: 'created', header: 'Opened', hideOnMobile: true, cell: (c) => <span className="text-ink-muted">{timeAgo(c.createdAt)}</span> },
            ]}
          />
          <Pagination page={page} pages={data?.meta?.pages ?? 1} total={data?.meta?.total} onChange={setPage} />
        </>
      )}
      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.subject ?? ''} width="max-w-xl">
        {open && <TicketThread id={open._id} admin onChanged={() => reload(true)} />}
      </Drawer>
    </div>
  );
}

// --- Skills taxonomy ----------------------------------------------------------------------------------
function SkillModal({ skill, open, onClose, onSaved, categories }: { skill: Skill | null; open: boolean; onClose: () => void; onSaved: () => void; categories: string[] }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', category: 'Other', aliases: [] as string[], related: [] as string[], status: 'approved' as Skill['status'] });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) setForm(skill ? { name: skill.name, category: skill.category, aliases: skill.aliases, related: skill.related, status: skill.status === 'pending' ? 'approved' : skill.status } : { name: '', category: 'Other', aliases: [], related: [], status: 'approved' });
  }, [open, skill]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={skill ? (skill.status === 'pending' ? `Review "${skill.name}"` : `Edit ${skill.name}`) : 'Add a skill'}
      description="Aliases are matched as the same skill. Related skills earn half credit in matching."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={busy}
            disabled={!form.name.trim()}
            onClick={async () => {
              setBusy(true);
              try {
                if (skill) await skillsApi.update(skill._id, form);
                else await skillsApi.create(form);
                toast.success(skill ? 'Skill updated' : 'Skill added', 'It is used in matching from the next score onwards.');
                onSaved();
                onClose();
              } catch (err) {
                toast.error('Could not save skill', toApiError(err).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {skill?.status === 'pending' ? 'Approve' : 'Save'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Category" list="skill-categories" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <datalist id="skill-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        <div className="sm:col-span-2">
          <TagInput label="Aliases" value={form.aliases} onChange={(v) => setForm({ ...form, aliases: v })} placeholder="e.g. ReactJS" />
        </div>
        <div className="sm:col-span-2">
          <TagInput label="Related skills" value={form.related} onChange={(v) => setForm({ ...form, related: v })} placeholder="e.g. Vue.js" />
        </div>
        <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Skill['status'] })} options={[{ value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }]} />
      </div>
    </Modal>
  );
}

export function AdminSkills() {
  const toast = useToast();
  const [tab, setTab] = useState<'approved' | 'pending' | 'rejected'>('approved');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const query = useDebounce(q);
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAsync(() => skillsApi.list({ status: tab, q: query, category, page, limit: 25 }), [tab, query, category, page]);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState<Skill | null>(null);
  useEffect(() => setPage(1), [tab, query, category]);
  const categories = (data?.meta?.categories as string[]) ?? [];
  return (
    <div>
      <PageHeader title="Skill taxonomy" description="The vocabulary matching uses. Unknown skills found in resumes wait here for review." actions={<Button icon={<Plus className="size-4" />} onClick={() => { setEditing(null); setModalOpen(true); }}>Add skill</Button>} />
      <Tabs label="Skill status" value={tab} onChange={setTab} tabs={[{ value: 'approved', label: 'Approved' }, { value: 'pending', label: 'Needs review' }, { value: 'rejected', label: 'Rejected' }]} className="mb-5" />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_16rem]">
        <Input aria-label="Search skills" placeholder="Search names and aliases" leading={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} />
        <Select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: c }))]} />
      </div>
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => reload()} />
      ) : (
        <>
          <DataTable
            caption="Skills"
            rows={data?.items ?? []}
            rowKey={(s) => s._id}
            empty={<EmptyState icon={<Tags className="size-5" />} title={tab === 'pending' ? 'Nothing to review' : 'No skills match'} />}
            columns={[
              { key: 'name', header: 'Skill', primary: true, cell: (s) => <div><p className="font-semibold text-ink">{s.name}</p>{s.aliases.length > 0 && <p className="text-caption text-ink-muted">Also: {s.aliases.slice(0, 4).join(', ')}{s.aliases.length > 4 ? '…' : ''}</p>}</div> },
              { key: 'category', header: 'Category', cell: (s) => <Badge>{s.category}</Badge> },
              { key: 'related', header: 'Related', hideOnMobile: true, cell: (s) => <span className="text-caption text-ink-muted">{s.related.slice(0, 3).join(', ') || '–'}</span> },
              { key: 'source', header: 'Source', hideOnMobile: true, cell: (s) => <span className="text-caption text-ink-muted">{s.source === 'resume' ? `Seen in ${s.occurrences} resumes` : s.source}</span> },
              {
                key: 'actions',
                header: <span className="sr-only">Actions</span>,
                className: 'text-right',
                cell: (s) => (
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant={s.status === 'pending' ? 'primary' : 'ghost'} icon={s.status === 'pending' ? <CheckCircle2 className="size-3.5" /> : <Pencil className="size-3.5" />} onClick={() => { setEditing(s); setModalOpen(true); }}>
                      {s.status === 'pending' ? 'Review' : 'Edit'}
                    </Button>
                    <Button size="icon" variant="ghost" className="size-8 text-ink-faint hover:text-danger" onClick={() => setDeleting(s)} aria-label={`Delete ${s.name}`}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
          <Pagination page={page} pages={data?.meta?.pages ?? 1} total={data?.meta?.total} onChange={setPage} />
        </>
      )}
      <SkillModal open={modalOpen} skill={editing} onClose={() => setModalOpen(false)} onSaved={() => reload(true)} categories={categories} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Delete ${deleting?.name}?`}
        description="Built-in skills stay in the AI service's own list; this removes only the database entry and any custom aliases."
        confirmLabel="Delete"
        tone="danger"
        onConfirm={async () => {
          try {
            await skillsApi.remove(deleting!._id);
            toast.success('Skill deleted');
            void reload(true);
          } catch (err) {
            toast.error('Could not delete', toApiError(err).message);
          }
        }}
      />
    </div>
  );
}

// --- Security audit --------------------------------------------------------------------------------------
export function AdminSecurity() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => adminApi.securityEvents(), []);
  const [review, setReview] = useState<{ id: string; name: string; decision: 'cleared' | 'rejected' } | null>(null);
  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <ErrorState message={error?.message ?? 'Could not load events'} onRetry={() => reload()} />;
  const pending = data.flaggedResumes.filter((r) => r.reviewStatus === 'pending');
  return (
    <div className="space-y-6">
      <PageHeader title="Security audit" description="Documents flagged for possible prompt injection, and authentication events that need attention." />
      <Card>
        <CardHeader title="Flagged resumes" description={`${pending.length} awaiting review`} />
        <ul className="divide-y divide-line">
          {data.flaggedResumes.length === 0 && <li className="p-5 text-sm text-ink-muted">No flagged documents.</li>}
          {data.flaggedResumes.map((r: any) => (
            <li key={r._id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start">
              <div className="flex flex-1 gap-3">
                <ShieldAlert className={cn('mt-0.5 size-5 shrink-0', r.security.riskLevel === 'high' ? 'text-danger' : 'text-warning')} aria-hidden />
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {r.originalName} <span className="font-normal text-ink-muted">from {r.candidate?.name ?? 'deleted user'}</span>
                  </p>
                  <p className="text-caption text-ink-faint">
                    Risk {r.security.riskScore}/100 ({r.security.riskLevel}), uploaded {timeAgo(r.createdAt)}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {r.security.findings.map((f: any, i: number) => (
                      <li key={i} className="rounded-lg bg-elevated/70 px-3 py-2 text-caption">
                        <span className="font-bold text-ink">{f.type.replace(/_/g, ' ')}</span>
                        <span className="text-ink-muted">: "{f.excerpt}"</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {r.reviewStatus === 'pending' ? (
                  <>
                    <Button size="sm" variant="secondary" icon={<ShieldCheck className="size-3.5" />} onClick={() => setReview({ id: r._id, name: r.originalName, decision: 'cleared' })}>
                      Clear
                    </Button>
                    <Button size="sm" variant="danger" icon={<XCircle className="size-3.5" />} onClick={() => setReview({ id: r._id, name: r.originalName, decision: 'rejected' })}>
                      Reject
                    </Button>
                  </>
                ) : (
                  <Badge tone={r.reviewStatus === 'cleared' ? 'success' : 'danger'}>{r.reviewStatus}</Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <CardHeader title="Authentication and AI security events" description="Warnings and critical events, newest first" />
        <ul className="divide-y divide-line">
          {data.events.length === 0 && <li className="p-5 text-sm text-ink-muted">No warning or critical events.</li>}
          {data.events.map((e) => (
            <li key={e._id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
              <Badge tone={SEVERITY_TONE[e.severity]}>{e.severity}</Badge>
              <span className="font-semibold text-ink">{e.action}</span>
              <span className="text-ink-muted">{e.actorEmail ?? (e.metadata as any)?.email ?? ''}</span>
              <span className="ml-auto text-caption text-ink-faint">
                {formatDateTime(e.createdAt)}
                {e.ip ? `, ${e.ip}` : ''}
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <ConfirmDialog
        open={!!review}
        onClose={() => setReview(null)}
        title={review?.decision === 'cleared' ? `Clear ${review?.name}?` : `Reject ${review?.name}?`}
        description={review?.decision === 'cleared' ? 'The flag is removed and the candidate is told the review passed.' : 'The candidate is asked to upload a clean resume. This resume cannot be used for new applications.'}
        confirmLabel={review?.decision === 'cleared' ? 'Clear resume' : 'Reject resume'}
        tone={review?.decision === 'rejected' ? 'danger' : 'primary'}
        withNote
        onConfirm={async (note) => {
          try {
            await adminApi.reviewResume(review!.id, review!.decision, note || undefined);
            toast.success(review!.decision === 'cleared' ? 'Resume cleared' : 'Resume rejected');
            void reload(true);
          } catch (err) {
            toast.error('Review failed', toApiError(err).message);
          }
        }}
      />
    </div>
  );
}

// --- Audit log ---------------------------------------------------------------------------------------------
export function AdminAudit() {
  const [q, setQ] = useState('');
  const query = useDebounce(q);
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<AuditLog | null>(null);
  const { data, loading, error, reload } = useAsync(() => adminApi.auditLogs({ q: query, category, severity, page, limit: 25 }), [query, category, severity, page]);
  useEffect(() => setPage(1), [query, category, severity]);
  return (
    <div>
      <PageHeader title="Audit log" description="Sign-ins, administrative actions, resume events and AI security events. Kept for 365 days." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_12rem_12rem]">
        <Input aria-label="Search audit log" placeholder="Action or email" leading={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} />
        <Select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} options={[{ value: '', label: 'All categories' }, ...['auth', 'admin', 'resume', 'ai_security', 'application', 'job', 'interview', 'system'].map((c) => ({ value: c, label: c.replace('_', ' ') }))]} />
        <Select aria-label="Severity" value={severity} onChange={(e) => setSeverity(e.target.value)} options={[{ value: '', label: 'Any severity' }, { value: 'info', label: 'Info' }, { value: 'warning', label: 'Warning' }, { value: 'critical', label: 'Critical' }]} />
      </div>
      {loading ? (
        <SkeletonTable rows={10} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => reload()} />
      ) : (
        <>
          <DataTable
            caption="Audit events"
            rows={data?.items ?? []}
            rowKey={(a) => a._id}
            onRowClick={setOpen}
            empty={<EmptyState title="No events match" />}
            columns={[
              { key: 'action', header: 'Action', primary: true, cell: (a) => <span className="font-semibold text-ink">{a.action}</span> },
              { key: 'severity', header: 'Severity', cell: (a) => <Badge tone={SEVERITY_TONE[a.severity]}>{a.severity}</Badge> },
              { key: 'category', header: 'Category', hideOnMobile: true, cell: (a) => <span className="text-ink-muted">{a.category.replace('_', ' ')}</span> },
              { key: 'actor', header: 'Actor', hideOnMobile: true, cell: (a) => <span className="text-ink-muted">{a.actorEmail ?? (a.actorRole ? a.actorRole : 'system')}</span> },
              { key: 'time', header: 'When', cell: (a) => <span className="text-ink-muted">{formatDateTime(a.createdAt)}</span> },
            ]}
          />
          <Pagination page={page} pages={data?.meta?.pages ?? 1} total={data?.meta?.total} onChange={setPage} />
        </>
      )}
      <Drawer open={!!open} onClose={() => setOpen(null)} title={open?.action ?? ''} width="max-w-lg">
        {open && (
          <dl className="space-y-3 text-sm">
            {[
              ['When', formatDateTime(open.createdAt)],
              ['Category', open.category],
              ['Severity', open.severity],
              ['Actor', `${open.actorEmail ?? 'system'}${open.actorRole ? ` (${open.actorRole})` : ''}`],
              ['Target', open.targetType ? `${open.targetType} ${open.targetId ?? ''}` : '–'],
              ['IP address', open.ip ?? '–'],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7rem_1fr] gap-3">
                <dt className="text-ink-faint">{k}</dt>
                <dd className="font-medium break-all text-ink">{v}</dd>
              </div>
            ))}
            {open.metadata && (
              <div>
                <dt className="mb-1 text-ink-faint">Details</dt>
                <dd>
                  <pre className="scrollbar-thin overflow-x-auto rounded-xl bg-elevated p-3 text-xs text-ink">{JSON.stringify(open.metadata, null, 2)}</pre>
                </dd>
              </div>
            )}
          </dl>
        )}
      </Drawer>
    </div>
  );
}

// --- System health --------------------------------------------------------------------------------------------
function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', ok ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger')}>
      {ok ? <CheckCircle2 className="size-3.5" aria-hidden /> : <AlertTriangle className="size-3.5" aria-hidden />}
      {ok ? 'Operational' : 'Unavailable'}
    </span>
  );
}

export function AdminHealth() {
  const { data, loading, error, reload } = useAsync(() => adminApi.health(), []);
  const history = useRef<{ date: string; api: number; db: number; ai: number }[]>([]);
  const [, force] = useState(0);
  usePolling(() => reload(true), true, 15000);
  useEffect(() => {
    if (!data) return;
    history.current = [...history.current.slice(-29), { date: new Date().toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit', second: '2-digit' }), api: data.backend.avgResponseMs ?? 0, db: data.database.latencyMs ?? 0, ai: data.ai.latencyMs ?? 0 }];
    force((n) => n + 1);
  }, [data]);
  if (loading && !data) return <DashboardSkeleton />;
  if (error && !data) return <ErrorState message={error.message} onRetry={() => reload()} />;
  const b = data.backend;
  const formatUptime = (s: number) => (s > 86400 ? `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h` : s > 3600 ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m` : `${Math.floor(s / 60)}m`);
  const services = [
    { name: 'API server', icon: Server, ok: b.ok, rows: [['Uptime', formatUptime(b.uptimeSeconds)], ['Requests served', b.requests.toLocaleString()], ['Avg response', b.avgResponseMs != null ? `${b.avgResponseMs} ms` : '–'], ['p95 response', b.p95ResponseMs != null ? `${b.p95ResponseMs} ms` : '–'], ['Server error rate', `${b.errorRate}%`], ['Memory', `${b.memoryMb} MB`]] },
    { name: 'MongoDB', icon: Database, ok: data.database.ok, rows: [['State', data.database.state], ['Ping latency', data.database.latencyMs != null ? `${data.database.latencyMs} ms` : '–']] },
    { name: 'AI service', icon: Cpu, ok: data.ai.ok, rows: [['Latency', data.ai.latencyMs != null ? `${data.ai.latencyMs} ms` : '–'], ['Uptime', data.ai.uptime_seconds != null ? formatUptime(data.ai.uptime_seconds) : '–'], ['Model version', data.ai.model_version ?? '–'], ['Semantic engine', data.ai.embedding_backend ?? '–'], ['Groq LLM', data.ai.llm ? (data.ai.llm.configured ? `Configured (${data.ai.llm.model})` : 'Not configured, rule-based fallback') : '–']] },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="System health" description={`Checked ${timeAgo(data.checkedAt)}. Refreshes every 15 seconds.`} actions={<Button variant="secondary" icon={<RefreshCw className="size-4" />} onClick={() => reload(true)}>Refresh</Button>} />
      <div className="grid gap-5 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.name} className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-ink">
                <s.icon className="size-5 text-primary" aria-hidden /> {s.name}
              </h2>
              <StatusPill ok={s.ok} />
            </div>
            <dl className="mt-5 space-y-2.5 text-sm">
              {s.rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="tabular text-right font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader title="Response times during this session" description="Collected each refresh while this page is open" />
        <div className="p-5 pt-3">
          {history.current.length > 1 ? (
            <TimelineChart data={history.current} xFormat={(v) => v} series={[{ key: 'api', name: 'API avg (ms)', color: 'primary' }, { key: 'db', name: 'DB ping (ms)', color: 'cyan' }, { key: 'ai', name: 'AI health (ms)', color: 'violet' }]} height={220} />
          ) : (
            <p className="flex items-center gap-2 text-sm text-ink-muted">
              <Activity className="size-4" /> Collecting samples. The chart appears after the next refresh.
            </p>
          )}
        </div>
      </Card>
      <p className="flex items-center gap-2 text-caption text-ink-faint">
        <HeartPulse className="size-3.5" /> Error rates count 5xx responses since the API process started.
      </p>
    </div>
  );
}
