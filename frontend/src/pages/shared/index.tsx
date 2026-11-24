import { motion } from 'framer-motion';
import { Bell, CheckCheck, KeyRound, LifeBuoy, Monitor, Moon, Palette, Plus, Sun } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, CardHeader, Drawer, EmptyState, ErrorState, Input, Modal, PageHeader, Pagination, Segmented, Select, SkeletonCard, Switch, Tabs, Textarea } from '@/components/ui';
import { fadeUp, staggerChildren } from '@/config/motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks';
import { toApiError } from '@/services/api';
import { authApi, complaintsApi, notificationsApi } from '@/services/endpoints';
import type { Complaint, ThemePref } from '@/types';
import { cn, formatDateTime, timeAgo } from '@/utils/format';
import { TicketThread } from '../admin';

// --- Notifications ---------------------------------------------------------------------------------
export function NotificationsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload, setData } = useAsync(() => notificationsApi.list({ page, limit: 20, unread: tab === 'unread' ? 'true' : undefined }), [tab, page]);
  const unread = (data?.meta?.unread as number) ?? 0;
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Updates about your applications, jobs, resumes and support tickets."
        actions={
          <Button
            variant="secondary"
            icon={<CheckCheck className="size-4" />}
            disabled={!unread}
            onClick={async () => {
              await notificationsApi.readAll();
              void reload(true);
            }}
          >
            Mark all as read
          </Button>
        }
      />
      <Tabs label="Filter notifications" value={tab} onChange={(t) => { setTab(t); setPage(1); }} tabs={[{ value: 'all', label: 'All' }, { value: 'unread', label: 'Unread', count: unread }]} className="mb-5" />
      {loading ? (
        <SkeletonCard lines={6} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => reload()} />
      ) : !data?.items.length ? (
        <EmptyState icon={<Bell className="size-5" />} title={tab === 'unread' ? 'No unread notifications' : 'No notifications yet'} />
      ) : (
        <>
          <Card>
            <motion.ul variants={staggerChildren(0.03)} initial="hidden" animate="show" className="divide-y divide-line">
              {data.items.map((n) => (
                <motion.li key={n._id} variants={fadeUp}>
                  <button
                    onClick={async () => {
                      if (!n.readAt) {
                        await notificationsApi.read(n._id);
                        setData((d) => (d ? { ...d, items: d.items.map((x) => (x._id === n._id ? { ...x, readAt: new Date().toISOString() } : x)) } : d));
                      }
                      if (n.link) navigate(n.link);
                    }}
                    className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-elevated/60"
                  >
                    <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.readAt ? 'bg-line-strong' : 'bg-primary')} aria-label={n.readAt ? 'Read' : 'Unread'} />
                    <span className="min-w-0 flex-1">
                      <span className={cn('block text-sm', n.readAt ? 'font-medium text-ink-muted' : 'font-bold text-ink')}>{n.title}</span>
                      {n.message && <span className="mt-0.5 block text-sm text-ink-muted">{n.message}</span>}
                    </span>
                    <span className="shrink-0 text-caption text-ink-faint">{timeAgo(n.createdAt)}</span>
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </Card>
          <Pagination page={page} pages={data.meta?.pages ?? 1} onChange={setPage} />
        </>
      )}
    </div>
  );
}

// --- Support ------------------------------------------------------------------------------------------
export function SupportPage() {
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => complaintsApi.mine(), []);
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState<Complaint | null>(null);
  const [form, setForm] = useState({ subject: '', description: '', category: 'technical', priority: 'medium' });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  return (
    <div className="max-w-4xl">
      <PageHeader title="Help and support" description="Report a problem, question a match score or ask about your account. Our team replies here." actions={<Button icon={<Plus className="size-4" />} onClick={() => setCreating(true)}>New ticket</Button>} />
      {loading ? (
        <SkeletonCard lines={4} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => reload()} />
      ) : !data?.length ? (
        <EmptyState icon={<LifeBuoy className="size-5" />} title="No tickets yet" description="If something isn't working, open a ticket and we'll follow up here." action={<Button onClick={() => setCreating(true)}>Open a ticket</Button>} />
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {data.map((c) => (
              <li key={c._id}>
                <button onClick={() => setOpen(c)} className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-left hover:bg-elevated/60">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{c.subject}</span>
                    <span className="block text-caption text-ink-faint">
                      Opened {formatDateTime(c.createdAt)}, {c.responses.length} {c.responses.length === 1 ? 'reply' : 'replies'}
                    </span>
                  </span>
                  <Badge tone={c.status === 'resolved' ? 'success' : c.status === 'closed' ? 'neutral' : c.status === 'in_progress' ? 'warning' : 'primary'} dot>
                    {c.status.replace('_', ' ')}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New support ticket"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button
              loading={busy}
              onClick={async () => {
                const errs: Record<string, string> = {};
                if (form.subject.trim().length < 3) errs.subject = 'Add a short subject';
                if (form.description.trim().length < 10) errs.description = 'Describe the problem in at least 10 characters';
                setErrors(errs);
                if (Object.keys(errs).length) return;
                setBusy(true);
                try {
                  await complaintsApi.create(form);
                  toast.success('Ticket created', 'You will be notified when the team replies.');
                  setForm({ subject: '', description: '', category: 'technical', priority: 'medium' });
                  setCreating(false);
                  void reload(true);
                } catch (err) {
                  toast.error('Could not create ticket', toApiError(err).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Create ticket
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input wrapperClassName="sm:col-span-2" label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} error={errors.subject} maxLength={150} required />
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={[{ value: 'technical', label: 'Something is not working' }, { value: 'account', label: 'My account' }, { value: 'job', label: 'A job post' }, { value: 'ai', label: 'A match score or AI result' }, { value: 'other', label: 'Other' }]} />
          <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }]} />
          <Textarea wrapperClassName="sm:col-span-2" label="What happened?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} error={errors.description} maxLength={5000} className="min-h-32" required />
        </div>
      </Modal>
      <Drawer open={!!open} onClose={() => { setOpen(null); void reload(true); }} title={open?.subject ?? ''} width="max-w-xl">
        {open && <TicketThread id={open._id} />}
      </Drawer>
    </div>
  );
}

// --- Settings ---------------------------------------------------------------------------------------------
export function SettingsPage() {
  const toast = useToast();
  const { user, setUser } = useAuth();
  const { preference, setPreference } = useTheme();
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  if (!user) return null;

  const saveTheme = async (theme: ThemePref) => {
    setPreference(theme);
    try {
      const r = await authApi.updatePreferences({ theme });
      setUser(r.user);
    } catch {
      /* the local preference still applies */
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Appearance, notifications and security for your account." />
      <Card>
        <CardHeader title={<span className="flex items-center gap-2"><Palette className="size-4 text-primary" /> Appearance</span>} description="Saved to your account and used on every device you sign in on." />
        <div className="p-5">
          <Segmented
            label="Theme"
            value={preference}
            onChange={saveTheme}
            options={[
              { value: 'light', label: 'Light', icon: <Sun className="size-4" /> },
              { value: 'dark', label: 'Dark', icon: <Moon className="size-4" /> },
              { value: 'system', label: 'System', icon: <Monitor className="size-4" /> },
            ]}
          />
        </div>
      </Card>
      <Card>
        <CardHeader title={<span className="flex items-center gap-2"><Bell className="size-4 text-primary" /> Notifications</span>} />
        <div className="p-5">
          <Switch
            checked={user.preferences?.emailNotifications ?? true}
            label="Email me about important updates"
            description="Interview invitations and application decisions. In-app notifications are always on."
            onChange={async (v) => {
              try {
                const r = await authApi.updatePreferences({ emailNotifications: v });
                setUser(r.user);
                toast.success('Notification preference saved');
              } catch (err) {
                toast.error('Could not save', toApiError(err).message);
              }
            }}
          />
        </div>
      </Card>
      <Card>
        <CardHeader title={<span className="flex items-center gap-2"><KeyRound className="size-4 text-primary" /> Password</span>} description={user.authProvider !== 'local' ? `You sign in with ${user.authProvider}, so there is no password to change.` : 'Changing your password signs you out on other devices.'} />
        {user.authProvider === 'local' && (
          <form
            className="grid gap-4 p-5 sm:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              setPwError(null);
              if (pw.next !== pw.confirm) return setPwError('The new passwords do not match');
              if (pw.next.length < 8 || !/[a-z]/.test(pw.next) || !/[A-Z]/.test(pw.next) || !/\d/.test(pw.next)) return setPwError('Use 8+ characters with upper and lower case letters and a number');
              setConfirmOpen(true);
            }}
          >
            <Input label="Current password" type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required />
            <Input label="New password" type="password" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required />
            <Input label="Confirm new password" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
            {pwError && (
              <p role="alert" className="text-sm font-medium text-danger sm:col-span-3">
                {pwError}
              </p>
            )}
            <div className="sm:col-span-3">
              <Button type="submit" loading={busy}>
                Change password
              </Button>
            </div>
          </form>
        )}
      </Card>
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Change your password?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await authApi.changePassword(pw.current, pw.next);
                  toast.success('Password changed', 'Other devices have been signed out.');
                  setPw({ current: '', next: '', confirm: '' });
                  setConfirmOpen(false);
                } catch (err) {
                  setPwError(toApiError(err).message);
                  setConfirmOpen(false);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Change password
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">You will stay signed in here. Sessions on other devices will end.</p>
      </Modal>
    </div>
  );
}
