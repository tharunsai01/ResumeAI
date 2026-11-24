import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  Bell,
  BookmarkCheck,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronDown,
  FileText,
  FlaskConical,
  GitBranch,
  HeartPulse,
  KanbanSquare,
  LayoutDashboard,
  LifeBuoy,
  ListOrdered,
  LogOut,
  Menu,
  MessageSquare,
  ScrollText,
  Search,
  Settings,
  ShieldAlert,
  Tags,
  Target,
  User,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState, type ComponentType } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DashboardBackground } from '@/components/effects/Backgrounds';
import { Logo, ThemeToggle } from '@/components/layout/Brand';
import { Avatar, Badge, Button, Drawer, Dropdown, EmptyState, Skeleton } from '@/components/ui';
import { spring } from '@/config/motion';
import { useAuth } from '@/context/AuthContext';
import { useAsync, usePolling } from '@/hooks';
import { IS_MOCK } from '@/services/api';
import { notificationsApi } from '@/services/endpoints';
import type { Notification, Role } from '@/types';
import { cn, timeAgo } from '@/utils/format';

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }>; end?: boolean };

export const NAV: Record<Role, { section?: string; items: NavItem[] }[]> = {
  candidate: [
    {
      items: [
        { to: '/candidate', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/candidate/jobs', label: 'Discover jobs', icon: Search },
        { to: '/candidate/matches', label: 'My matches', icon: Target },
        { to: '/candidate/applications', label: 'Applications', icon: Briefcase },
      ],
    },
    {
      section: 'Profile',
      items: [
        { to: '/candidate/resumes', label: 'Resume hub', icon: FileText },
        { to: '/candidate/profile', label: 'Profile', icon: User },
        { to: '/candidate/skills', label: 'Skill analysis', icon: GitBranch },
        { to: '/candidate/saved', label: 'Saved jobs', icon: BookmarkCheck },
      ],
    },
  ],
  recruiter: [
    {
      items: [
        { to: '/recruiter', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/recruiter/jobs', label: 'Jobs', icon: Briefcase },
        { to: '/recruiter/screening', label: 'AI screening', icon: ListOrdered },
        { to: '/recruiter/pipeline', label: 'Pipeline', icon: KanbanSquare },
        { to: '/recruiter/interviews', label: 'Interviews', icon: CalendarClock },
        { to: '/recruiter/talent', label: 'Talent pool', icon: Users },
      ],
    },
    { section: 'Company', items: [{ to: '/recruiter/company', label: 'Company profile', icon: Building2 }] },
  ],
  admin: [
    {
      items: [
        { to: '/admin', label: 'Overview', icon: BarChart3, end: true },
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/complaints', label: 'Support tickets', icon: MessageSquare },
        { to: '/admin/skills', label: 'Skill taxonomy', icon: Tags },
      ],
    },
    {
      section: 'Trust and safety',
      items: [
        { to: '/admin/security', label: 'Security audit', icon: ShieldAlert },
        { to: '/admin/evaluation', label: 'AI evaluation', icon: FlaskConical },
        { to: '/admin/audit', label: 'Audit log', icon: ScrollText },
        { to: '/admin/health', label: 'System health', icon: HeartPulse },
      ],
    },
  ],
};

function SidebarNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  return (
    <nav aria-label="Workspace" className="flex flex-col gap-6">
      {NAV[role].map((group, gi) => (
        <div key={gi}>
          {group.section && <p className="mb-2 px-3 text-caption font-semibold text-ink-faint">{group.section}</p>}
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => cn('group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors', isActive ? 'text-ink' : 'text-ink-muted hover:bg-elevated/70 hover:text-ink')}>
                  {({ isActive }) => (
                    <>
                      {isActive && <motion.span layoutId={`sidebar-active-${onNavigate ? 'm' : 'd'}`} transition={spring.layout} className="absolute inset-0 rounded-xl border border-line bg-surface shadow-soft" />}
                      <item.icon className={cn('relative size-[1.15rem] transition-colors', isActive ? 'text-primary' : 'text-ink-faint group-hover:text-ink-muted')} />
                      <span className="relative">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="border-t border-line pt-4">
        <NavLink to="/support" onClick={onNavigate} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold', isActive ? 'bg-surface text-ink shadow-soft' : 'text-ink-muted hover:bg-elevated/70 hover:text-ink')}>
          <LifeBuoy className="size-[1.15rem] text-ink-faint" /> Help and support
        </NavLink>
        <NavLink to="/settings" onClick={onNavigate} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold', isActive ? 'bg-surface text-ink shadow-soft' : 'text-ink-muted hover:bg-elevated/70 hover:text-ink')}>
          <Settings className="size-[1.15rem] text-ink-faint" /> Settings
        </NavLink>
      </div>
    </nav>
  );
}

function NotificationsDrawer({ open, onClose, onChanged }: { open: boolean; onClose: () => void; onChanged: () => void }) {
  const navigate = useNavigate();
  const { data, loading, setData } = useAsync(() => notificationsApi.list({ limit: 30 }), [open], { enabled: open });
  const items = data?.items ?? [];
  const markAll = async () => {
    await notificationsApi.readAll();
    setData((d) => (d ? { ...d, items: d.items.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) } : d));
    onChanged();
  };
  const openItem = async (n: Notification) => {
    if (!n.readAt) {
      await notificationsApi.read(n._id);
      onChanged();
    }
    onClose();
    if (n.link) navigate(n.link);
  };
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Notifications"
      width="max-w-md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => { onClose(); navigate('/notifications'); }}>
            View all
          </Button>
          <Button variant="secondary" size="sm" onClick={markAll} disabled={!items.some((n) => !n.readAt)}>
            Mark all as read
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={<Bell className="size-5" />} title="You're all caught up" description="New applications, status changes and interview invites will appear here." />
      ) : (
        <ul className="-mx-2 space-y-1">
          {items.map((n, i) => (
            <motion.li key={n._id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03 } }}>
              <button onClick={() => openItem(n)} className="flex w-full gap-3 rounded-xl px-3 py-3 text-left hover:bg-elevated">
                <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.readAt ? 'bg-transparent' : 'bg-primary')} aria-label={n.readAt ? undefined : 'Unread'} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">{n.title}</span>
                  {n.message && <span className="mt-0.5 block text-sm text-ink-muted">{n.message}</span>}
                  <span className="mt-1 block text-caption text-ink-faint">{timeAgo(n.createdAt)}</span>
                </span>
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: unread, reload: reloadUnread } = useAsync(() => notificationsApi.unread(), []);
  usePolling(() => reloadUnread(true), true, 30000);
  useEffect(() => setMobileNav(false), [pathname]);
  useEffect(() => {
    if (!mobileNav) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileNav(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileNav]);
  if (!user) return null;
  const count = unread?.unread ?? 0;
  const roleLabel = { candidate: 'Candidate', recruiter: 'Recruiter', admin: 'Administrator' }[user.role];

  return (
    <div className="relative min-h-screen">
      <DashboardBackground />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold">
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-canvas/70 px-4 py-5 backdrop-blur-xl lg:flex">
        <Logo to="/" className="px-2" />
        <div className="scrollbar-thin mt-8 flex-1 overflow-y-auto pr-1">
          <SidebarNav role={user.role} />
        </div>
      </aside>

      {/* Mobile navigation */}
      <AnimatePresence>
        {mobileNav && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#050711]/55 backdrop-blur-sm" onClick={() => setMobileNav(false)} aria-hidden />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0, transition: { type: 'spring', stiffness: 380, damping: 38 } }} exit={{ x: '-100%', transition: { duration: 0.2 } }} className="absolute inset-y-0 left-0 flex w-[17rem] flex-col border-r border-line bg-canvas px-4 py-5" aria-label="Navigation">
              <div className="flex items-center justify-between px-1">
                <Logo />
                <button onClick={() => setMobileNav(false)} className="rounded-lg p-2 text-ink-muted hover:bg-elevated" aria-label="Close navigation">
                  <X className="size-5" />
                </button>
              </div>
              <div className="scrollbar-thin mt-8 flex-1 overflow-y-auto">
                <SidebarNav role={user.role} onNavigate={() => setMobileNav(false)} />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="glass sticky top-0 z-20 border-b border-line">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setMobileNav(true)} className="rounded-xl p-2 text-ink-muted hover:bg-elevated lg:hidden" aria-label="Open navigation" aria-expanded={mobileNav}>
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              {IS_MOCK && (
                <Badge tone="warning" dot>
                  <span>
                    Demo data<span className="hidden sm:inline">: changes are not saved</span>
                  </span>
                </Badge>
              )}
            </div>
            <ThemeToggle />
            <button onClick={() => setNotifOpen(true)} className="relative flex size-10 items-center justify-center rounded-xl text-ink-muted hover:bg-elevated hover:text-ink" aria-label={`Notifications${count ? `, ${count} unread` : ''}`}>
              <Bell className="size-[1.15rem]" />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="tabular absolute top-1.5 right-1.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[0.625rem] leading-4 font-bold text-white">
                    {count > 9 ? '9+' : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <Dropdown
              label="Account"
              trigger={(props) => (
                <button {...props} aria-label={`Account menu for ${user.name}`} className="flex items-center gap-2.5 rounded-xl py-1 pr-2 pl-1 hover:bg-elevated">
                  <Avatar name={user.name} size="sm" />
                  <span className="hidden text-left sm:block">
                    <span className="block max-w-36 truncate text-sm leading-tight font-semibold text-ink">{user.name}</span>
                    <span className="block text-caption leading-tight text-ink-faint">{roleLabel}</span>
                  </span>
                  <ChevronDown className="hidden size-4 text-ink-faint sm:block" />
                </button>
              )}
              items={[
                { label: 'Settings', icon: <Settings className="size-4" />, onSelect: () => navigate('/settings') },
                { label: 'Help and support', icon: <LifeBuoy className="size-4" />, onSelect: () => navigate('/support') },
                {
                  label: 'Log out',
                  icon: <LogOut className="size-4" />,
                  danger: true,
                  onSelect: async () => {
                    await logout();
                    navigate('/login');
                  },
                },
              ]}
            />
          </div>
        </header>
        <main id="main" className="mx-auto max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)} onChanged={() => reloadUnread(true)} />
    </div>
  );
}
