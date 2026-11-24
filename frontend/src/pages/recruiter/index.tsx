import { motion } from 'framer-motion';
import { BarChart3, Briefcase, CalendarClock, Eye, FileCheck2, ListOrdered, MoreHorizontal, Pencil, Plus, Search, Send, Star, Trash2, UserCheck, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarsChart, Funnel, TimelineChart } from '@/components/charts/Charts';
import { Avatar, Badge, Button, ButtonLink, Card, CardHeader, ConfirmDialog, DashboardSkeleton, DataTable, Drawer, Dropdown, EmptyState, ErrorState, Input, PageHeader, Pagination, ScoreRing, Select, SkeletonCard, SkeletonTable, StatCard, Tabs, Textarea } from '@/components/ui';
import { fadeUp, staggerChildren } from '@/config/motion';
import { useToast } from '@/context/ToastContext';
import { useAsync, useDebounce } from '@/hooks';
import { toApiError } from '@/services/api';
import { candidateApi, jobsApi, recruiterApi, resumeApi } from '@/services/endpoints';
import type { Job, RecruiterProfile } from '@/types';
import { EDUCATION_LABELS, formatDateTime, STATUS_LABEL, timeAgo } from '@/utils/format';

// --- Dashboard ---------------------------------------------------------------------------------
export function RecruiterDashboard() {
  const { data, loading, error, reload } = useAsync(() => recruiterApi.dashboard(), []);
  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <ErrorState message={error?.message ?? 'Could not load the dashboard'} onRetry={() => reload()} />;
  const s = data.stats;
  return (
    <motion.div variants={staggerChildren(0.06)} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Hiring overview"
          description={s.totalJobs ? `${s.activeJobs} open ${s.activeJobs === 1 ? 'job' : 'jobs'} and ${s.applications} applications so far.` : 'Post your first job to start receiving and screening applications.'}
          actions={
            <>
              <ButtonLink to="/recruiter/screening" variant="secondary" icon={<ListOrdered className="size-4" />}>
                Screen applicants
              </ButtonLink>
              <ButtonLink to="/recruiter/jobs/new" icon={<Plus className="size-4" />}>
                Post a job
              </ButtonLink>
            </>
          }
        />
      </motion.div>
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Active jobs" value={s.activeJobs} icon={<Briefcase className="size-4" />} hint={`${s.totalJobs} in total`} />
        <StatCard label="Candidates" value={s.totalCandidates} icon={<Users className="size-4" />} tone="cyan" />
        <StatCard label="Applications" value={s.applications} icon={<FileCheck2 className="size-4" />} tone="violet" />
        <StatCard label="AI-screened" value={s.aiScreened} icon={<ListOrdered className="size-4" />} hint={s.applications ? `${Math.round((s.aiScreened / s.applications) * 100)}% of applications` : undefined} />
        <StatCard label="Shortlisted" value={s.shortlisted} icon={<Star className="size-4" />} tone="success" />
        <StatCard label="In interviews" value={s.interviews} icon={<CalendarClock className="size-4" />} tone="warning" />
      </motion.div>
      <motion.div variants={fadeUp} className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader title="Applications received" description="Last 30 days" />
          <div className="p-5 pt-3">
            <TimelineChart data={data.timeline} series={[{ key: 'count', name: 'Applications', color: 'primary' }]} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Hiring funnel" description="Where applicants are right now" />
          <div className="p-5">
            <Funnel stages={data.funnel} />
          </div>
        </Card>
      </motion.div>
      <motion.div variants={fadeUp} className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Applications per job" />
          <div className="p-5">{data.perJob.length ? <BarsChart data={data.perJob} xKey="title" yKey="applications" name="Applications" horizontal height={Math.max(160, data.perJob.length * 42)} /> : <EmptyState title="No applications yet" />}</div>
        </Card>
        <Card>
          <CardHeader title="Match score distribution" description="Across all scored applicants" />
          <div className="p-5">
            <BarsChart data={data.scoreDistribution} xKey="range" yKey="count" name="Applicants" tone="cyan" />
          </div>
        </Card>
      </motion.div>
      <motion.div variants={fadeUp} className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Upcoming interviews" action={<ButtonLink to="/recruiter/interviews" variant="ghost" size="sm">Calendar</ButtonLink>} />
          <ul className="divide-y divide-line px-5 pb-2">
            {data.upcomingInterviews.length === 0 && <li className="py-4 text-sm text-ink-muted">No interviews scheduled.</li>}
            {data.upcomingInterviews.map((i: any) => (
              <li key={i._id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={i.candidate?.name ?? '?'} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-ink">{i.candidate?.name}</p>
                    <p className="text-caption text-ink-muted">{i.job?.title}</p>
                  </div>
                </div>
                <span className="text-caption font-semibold text-primary">{formatDateTime(i.scheduledAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Latest applications" action={<ButtonLink to="/recruiter/pipeline" variant="ghost" size="sm">Pipeline</ButtonLink>} />
          <ul className="divide-y divide-line px-5 pb-2">
            {data.recentApplications.length === 0 && <li className="py-4 text-sm text-ink-muted">No applications yet.</li>}
            {data.recentApplications.map((a: any) => (
              <li key={a._id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={a.candidate?.name ?? '?'} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{a.candidate?.name}</p>
                    <p className="truncate text-caption text-ink-muted">
                      {a.job?.title}, {timeAgo(a.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{STATUS_LABEL[a.status as keyof typeof STATUS_LABEL]}</Badge>
                  {a.matchScore != null && <ScoreRing score={a.matchScore} size={36} stroke={3.5} />}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// --- Jobs list ------------------------------------------------------------------------------------
function JobAnalyticsDrawer({ job, onClose }: { job: Job | null; onClose: () => void }) {
  const { data, loading } = useAsync(() => (job ? jobsApi.analytics(job._id) : Promise.resolve(null)), [job?._id]);
  return (
    <Drawer open={!!job} onClose={onClose} title={job ? `Analytics: ${job.title}` : ''}>
      {loading || !data ? (
        <SkeletonCard lines={6} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              ['Views', data.views],
              ['Applications', data.applications],
              ['Avg. match', data.averageScore ?? '–'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-line p-3">
                <p className="text-caption text-ink-faint">{k}</p>
                <p className="tabular mt-1 text-xl font-extrabold text-ink">{v}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-bold text-ink">Applications over time</h3>
            {data.timeline.length ? <BarsChart data={data.timeline} xKey="date" yKey="count" name="Applications" height={180} /> : <p className="text-sm text-ink-muted">No applications yet.</p>}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-bold text-ink">Match scores</h3>
            <BarsChart data={data.scoreDistribution} xKey="range" yKey="count" name="Applicants" tone="cyan" height={180} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-bold text-ink">By status</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.byStatus as Record<string, number>).map(([k, v]) => (
                <Badge key={k}>
                  {STATUS_LABEL[k as keyof typeof STATUS_LABEL] ?? k}: {v}
                </Badge>
              ))}
              {!Object.keys(data.byStatus).length && <p className="text-sm text-ink-muted">No applications yet.</p>}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

export function RecruiterJobs() {
  const toast = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'all' | 'published' | 'draft' | 'closed'>('all');
  const [q, setQ] = useState('');
  const query = useDebounce(q);
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useAsync(() => jobsApi.mine({ status: status === 'all' ? undefined : status, q: query, page, limit: 20 }), [status, query, page]);
  const [analytics, setAnalytics] = useState<Job | null>(null);
  const [confirm, setConfirm] = useState<{ job: Job; action: 'close' | 'delete' } | null>(null);
  useEffect(() => setPage(1), [status, query]);

  const act = async (job: Job, action: 'publish' | 'close' | 'delete') => {
    try {
      if (action === 'publish') await jobsApi.publish(job._id);
      if (action === 'close') await jobsApi.close(job._id);
      if (action === 'delete') await jobsApi.remove(job._id);
      toast.success(action === 'publish' ? 'Job published' : action === 'close' ? 'Job closed' : 'Draft deleted');
      void reload(true);
    } catch (err) {
      toast.error('Action failed', toApiError(err).message);
    }
  };

  return (
    <div>
      <PageHeader title="Jobs" description="Create, publish and track your job posts." actions={<ButtonLink to="/recruiter/jobs/new" icon={<Plus className="size-4" />}>New job</ButtonLink>} />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <Tabs label="Job status" value={status} onChange={setStatus} tabs={[{ value: 'all', label: 'All' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Drafts' }, { value: 'closed', label: 'Closed' }]} className="border-0" />
        <div className="lg:w-72">
          <Input aria-label="Search jobs" placeholder="Search titles" leading={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {loading ? (
        <SkeletonTable />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => reload()} />
      ) : (
        <>
          <DataTable
            caption="Your jobs"
            rows={data?.items ?? []}
            rowKey={(j) => j._id}
            empty={<EmptyState icon={<Briefcase className="size-5" />} title={status === 'all' && !query ? 'No jobs yet' : 'No jobs match'} description="Post a job to start receiving applications." action={<ButtonLink to="/recruiter/jobs/new">Post a job</ButtonLink>} />}
            columns={[
              {
                key: 'title',
                header: 'Job',
                primary: true,
                cell: (j) => (
                  <div className="min-w-0">
                    <Link to={`/recruiter/jobs/${j._id}/edit`} className="font-bold text-ink hover:text-primary">
                      {j.title}
                    </Link>
                    <p className="text-caption text-ink-muted">
                      {j.location || 'No location'}, {j.workMode}
                      {j.security?.flagged && <span className="ml-2 font-semibold text-warning">Flagged text</span>}
                    </p>
                  </div>
                ),
              },
              { key: 'status', header: 'Status', cell: (j) => <Badge tone={j.status === 'published' ? 'success' : j.status === 'draft' ? 'neutral' : 'danger'} dot>{j.status === 'published' ? 'Published' : j.status === 'draft' ? 'Draft' : 'Closed'}</Badge> },
              { key: 'apps', header: 'Applications', className: 'tabular', cell: (j) => <span className="font-semibold">{j.applicationsCount}</span> },
              { key: 'views', header: 'Views', className: 'tabular', hideOnMobile: true, cell: (j) => j.views },
              { key: 'updated', header: 'Updated', hideOnMobile: true, cell: (j) => <span className="text-ink-muted">{timeAgo(j.updatedAt)}</span> },
              {
                key: 'actions',
                header: <span className="sr-only">Actions</span>,
                className: 'text-right',
                cell: (j) => (
                  <Dropdown
                    label={`Actions for ${j.title}`}
                    trigger={(props) => (
                      <button {...props} onClick={(e) => { e.stopPropagation(); props.onClick(); }} className="rounded-lg p-2 text-ink-faint hover:bg-elevated hover:text-ink" aria-label={`Actions for ${j.title}`}>
                        <MoreHorizontal className="size-4" />
                      </button>
                    )}
                    items={[
                      { label: 'Edit', icon: <Pencil className="size-4" />, onSelect: () => navigate(`/recruiter/jobs/${j._id}/edit`), disabled: j.status === 'closed' },
                      { label: 'Screen applicants', icon: <ListOrdered className="size-4" />, onSelect: () => navigate(`/recruiter/screening?job=${j._id}`), disabled: !j.applicationsCount },
                      { label: 'Analytics', icon: <BarChart3 className="size-4" />, onSelect: () => setAnalytics(j) },
                      ...(j.status !== 'published' ? [{ label: j.status === 'closed' ? 'Reopen' : 'Publish', icon: <Send className="size-4" />, onSelect: () => act(j, 'publish') }] : []),
                      ...(j.status === 'published' ? [{ label: 'Close job', icon: <XCircle className="size-4" />, onSelect: () => setConfirm({ job: j, action: 'close' }) }] : []),
                      ...(j.status === 'draft' && !j.applicationsCount ? [{ label: 'Delete draft', icon: <Trash2 className="size-4" />, danger: true, onSelect: () => setConfirm({ job: j, action: 'delete' }) }] : []),
                    ]}
                  />
                ),
              },
            ]}
          />
          <Pagination page={page} pages={data?.meta?.pages ?? 1} total={data?.meta?.total} onChange={setPage} />
        </>
      )}
      <JobAnalyticsDrawer job={analytics} onClose={() => setAnalytics(null)} />
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.action === 'close' ? 'Close this job?' : 'Delete this draft?'}
        description={confirm?.action === 'close' ? 'Candidates will no longer see it or be able to apply. Existing applications stay in your pipeline.' : 'The draft will be removed permanently.'}
        confirmLabel={confirm?.action === 'close' ? 'Close job' : 'Delete draft'}
        tone="danger"
        onConfirm={() => act(confirm!.job, confirm!.action)}
      />
    </div>
  );
}

// --- Talent pool ----------------------------------------------------------------------------------
function CandidateDrawer({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const toast = useToast();
  const { data, loading, error } = useAsync(() => (userId ? candidateApi.get(userId) : Promise.resolve(null)), [userId]);
  return (
    <Drawer open={!!userId} onClose={onClose} title={data?.user?.name ?? 'Candidate'}>
      {loading ? (
        <SkeletonCard lines={8} />
      ) : error ? (
        <ErrorState message={error.message} />
      ) : data ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={data.user.name} size="lg" />
            <div>
              <p className="font-bold text-ink">{data.headline || 'No headline'}</p>
              <p className="text-sm text-ink-muted">{data.location}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-line p-3">
              <p className="text-caption text-ink-faint">Experience</p>
              <p className="font-bold text-ink">{data.totalExperienceYears} years</p>
            </div>
            <div className="rounded-xl border border-line p-3">
              <p className="text-caption text-ink-faint">Education</p>
              <p className="font-bold text-ink">{EDUCATION_LABELS[data.highestEducationLevel]}</p>
            </div>
          </div>
          {data.summary && <p className="text-sm leading-relaxed text-ink-muted">{data.summary}</p>}
          <div>
            <h3 className="mb-2 text-sm font-bold text-ink">Skills</h3>
            <div className="flex flex-wrap gap-1.5">{data.skills.map((s) => <Badge key={s.name} tone="primary">{s.name}</Badge>)}</div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-bold text-ink">Experience</h3>
            <ul className="space-y-2">
              {data.experience.map((e) => (
                <li key={e._id ?? e.title} className="text-sm">
                  <span className="font-semibold text-ink">{e.title}</span> <span className="text-ink-muted">{e.company}</span>
                </li>
              ))}
            </ul>
          </div>
          {data.activeResume && (
            <Button
              variant="secondary"
              icon={<Eye className="size-4" />}
              onClick={() => resumeApi.download(data.activeResume!._id, data.activeResume!.originalName).catch((e) => toast.error('Resume not available', toApiError(e).status === 403 ? 'You can download a resume once the candidate applies to one of your jobs.' : toApiError(e).message))}
            >
              Download resume
            </Button>
          )}
        </div>
      ) : null}
    </Drawer>
  );
}

export function TalentPool() {
  const [q, setQ] = useState('');
  const [skills, setSkills] = useState('');
  const [minYears, setMinYears] = useState('');
  const [education, setEducation] = useState('');
  const [page, setPage] = useState(1);
  const dq = useDebounce(q);
  const ds = useDebounce(skills);
  const { data, loading, error, reload } = useAsync(() => recruiterApi.talent({ q: dq, skills: ds, minYears, education, page, limit: 12 }), [dq, ds, minYears, education, page]);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => setPage(1), [dq, ds, minYears, education]);

  return (
    <div>
      <PageHeader title="Talent pool" description="Candidates who applied to your jobs, plus those who chose to be visible to recruiters." />
      <Card className="mb-6 grid gap-4 p-5 md:grid-cols-4">
        <Input label="Search" placeholder="Name or headline" leading={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} />
        <Input label="Skills" placeholder="React, Python" value={skills} onChange={(e) => setSkills(e.target.value)} />
        <Select label="Minimum experience" value={minYears} onChange={(e) => setMinYears(e.target.value)} options={[{ value: '', label: 'Any' }, ...[1, 2, 3, 5, 8, 10].map((y) => ({ value: y, label: `${y}+ years` }))]} />
        <Select label="Education" value={education} onChange={(e) => setEducation(e.target.value)} options={[{ value: '', label: 'Any' }, ...EDUCATION_LABELS.slice(1).map((l, i) => ({ value: i + 1, label: `${l} or higher` }))]} />
      </Card>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => reload()} />
      ) : !data?.items.length ? (
        <EmptyState icon={<Users className="size-5" />} title="No candidates found" description="Try fewer filters. Candidates appear here once they apply or opt in." />
      ) : (
        <>
          <motion.div variants={staggerChildren(0.04)} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((p: any) => (
              <motion.div key={p._id} variants={fadeUp}>
                <Card spotlight interactive className="flex h-full flex-col p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={p.user?.name ?? '?'} />
                    <div className="min-w-0 flex-1">
                      <button onClick={() => setOpen(p.user._id)} className="text-left after:absolute after:inset-0">
                        <h3 className="truncate font-bold text-ink">{p.user?.name}</h3>
                      </button>
                      <p className="line-clamp-2 text-sm text-ink-muted">{p.headline || 'No headline yet'}</p>
                    </div>
                    {p.matchScore != null && <ScoreRing score={p.matchScore} size={42} stroke={4} />}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.appliedToYou && <Badge tone="success">Applied to you</Badge>}
                    <Badge>{p.totalExperienceYears} yrs</Badge>
                    {p.highestEducationLevel > 0 && <Badge>{EDUCATION_LABELS[p.highestEducationLevel]}</Badge>}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.skills.slice(0, 5).map((s: any) => (
                      <Badge key={s.name} tone="primary">
                        {s.name}
                      </Badge>
                    ))}
                    {p.skills.length > 5 && <Badge>+{p.skills.length - 5}</Badge>}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <Pagination page={page} pages={data.meta?.pages ?? 1} total={data.meta?.total} onChange={setPage} />
        </>
      )}
      <CandidateDrawer userId={open} onClose={() => setOpen(null)} />
    </div>
  );
}

// --- Company profile ---------------------------------------------------------------------------------
export function CompanyProfile() {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(() => recruiterApi.me(), []);
  const [form, setForm] = useState<Partial<RecruiterProfile>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);
  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <ErrorState message={error?.message ?? 'Could not load profile'} onRetry={() => reload()} />;
  const f = (k: keyof RecruiterProfile) => ({ value: (form[k] as string) ?? '', onChange: (e: { target: { value: string } }) => setForm((x) => ({ ...x, [k]: e.target.value })) });
  return (
    <div className="max-w-3xl">
      <PageHeader title="Company profile" description="Shown to candidates on each of your job posts." />
      <Card className="p-6">
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              const { name, company, title, companyWebsite, companySize, industry, location, about } = form;
              setData(await recruiterApi.update({ name, company, title, companyWebsite, companySize, industry, location, about }));
              toast.success('Company profile saved');
            } catch (err) {
              toast.error('Could not save', toApiError(err).message);
            } finally {
              setSaving(false);
            }
          }}
        >
          <Input label="Your name" {...f('name')} required />
          <Input label="Your title" placeholder="e.g. Talent Partner" {...f('title')} />
          <Input label="Company" {...f('company')} required />
          <Input label="Website" type="url" placeholder="https://" {...f('companyWebsite')} />
          <Select label="Company size" {...f('companySize')} options={['', '1-10', '11-50', '51-200', '201-1000', '1000+'].map((v) => ({ value: v, label: v ? `${v} employees` : 'Not set' }))} />
          <Input label="Industry" {...f('industry')} />
          <Input label="Location" {...f('location')} wrapperClassName="sm:col-span-2" />
          <Textarea label="About the company" {...f('about')} maxLength={2000} wrapperClassName="sm:col-span-2" />
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" loading={saving} loadingText="Saving" icon={<UserCheck className="size-4" />}>
              Save profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
