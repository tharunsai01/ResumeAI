import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Briefcase, CalendarClock, CheckCircle2, FileText, Lightbulb, ListChecks, Search, Sparkles, Star, Target, Upload, Video } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AIWorking } from '@/components/ai/AIProcessing';
import { MatchBreakdown } from '@/components/ai/MatchBreakdown';
import { BarsChart, DonutChart, TimelineChart } from '@/components/charts/Charts';
import { JobCard, JobMeta } from '@/components/jobs/JobCard';
import { Badge, Button, ButtonLink, Card, CardHeader, ConfirmDialog, DashboardSkeleton, EmptyState, ErrorState, PageHeader, ProgressBar, ScoreRing, SkeletonCard, StatCard } from '@/components/ui';
import { fadeUp, staggerChildren } from '@/config/motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks';
import { toApiError } from '@/services/api';
import { applicationsApi, candidateApi, interviewsApi, jobsApi, matchingApi } from '@/services/endpoints';
import type { Application, ApplicationStatus, Interview } from '@/types';
import { categoryTone, cn, formatDate, formatDateTime, STATUS_LABEL, timeAgo } from '@/utils/format';
import { ApplyModal } from './Jobs';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

// --- Dashboard ------------------------------------------------------------------------------
export function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => candidateApi.dashboard(), []);
  const recs = useAsync(() => matchingApi.recommendations(4), []);

  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <ErrorState message={error?.message ?? 'Could not load your dashboard'} onRetry={() => reload()} />;
  const { stats, profile } = data;
  const statusData = (['applied', 'screened', 'shortlisted', 'interview', 'hired', 'rejected'] as ApplicationStatus[])
    .map((s) => ({ name: STATUS_LABEL[s], value: data.byStatus[s] ?? 0, tone: (s === 'hired' ? 'success' : s === 'rejected' ? 'faint' : s === 'interview' ? 'violet' : s === 'shortlisted' ? 'cyan' : 'primary') as 'primary' }))
    .filter((d) => d.value > 0);

  return (
    <motion.div variants={staggerChildren(0.06)} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <PageHeader
          title={`${greeting()}, ${user?.name.split(' ')[0]}`}
          description={stats.totalApplications ? `You have ${stats.activeApplications} active ${stats.activeApplications === 1 ? 'application' : 'applications'}.` : 'Start by uploading your resume so we can match you with open roles.'}
          actions={
            <>
              <ButtonLink to="/candidate/resumes" variant="secondary" icon={<Upload className="size-4" />}>
                Upload resume
              </ButtonLink>
              <ButtonLink to="/candidate/jobs" icon={<Search className="size-4" />}>
                Discover jobs
              </ButtonLink>
            </>
          }
        />
      </motion.div>

      {profile.completeness < 100 && (
        <motion.div variants={fadeUp}>
          <Card className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
            <ScoreRing score={profile.completeness} size={72} stroke={7} label={`Profile ${profile.completeness}% complete`} />
            <div className="flex-1">
              <h2 className="font-bold text-ink">Your profile is {profile.completeness}% complete</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {!profile.hasActiveResume ? 'Upload a resume first: it fills in most of your profile for you to review.' : 'Add the missing sections so matching has more to work with.'}
              </p>
            </div>
            <ButtonLink to={profile.hasActiveResume ? '/candidate/profile' : '/candidate/resumes'} variant="secondary">
              {profile.hasActiveResume ? 'Complete profile' : 'Upload resume'}
            </ButtonLink>
          </Card>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total applications" value={stats.totalApplications} icon={<Briefcase className="size-4" />} />
        <StatCard label="Active applications" value={stats.activeApplications} icon={<ListChecks className="size-4" />} tone="cyan" />
        <StatCard label="Interviews" value={stats.interviews} icon={<CalendarClock className="size-4" />} tone="violet" />
        <StatCard label="Shortlisted" value={stats.shortlisted} icon={<Star className="size-4" />} tone="success" hint={stats.averageMatch != null ? `Average match ${stats.averageMatch}` : undefined} />
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Recommended for you" description="Open roles ranked by your match score" action={<ButtonLink to="/candidate/jobs" variant="ghost" size="sm">See all jobs</ButtonLink>} />
          <div className="p-5">
            {recs.loading ? (
              <div className="grid gap-3 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}</div>
            ) : recs.error ? (
              <ErrorState message={recs.error.message} onRetry={() => recs.reload()} />
            ) : !recs.data?.length ? (
              <EmptyState icon={<Sparkles className="size-5" />} title="No recommendations yet" description="Upload a resume or add skills to your profile and we'll rank open jobs for you." action={<ButtonLink to="/candidate/resumes" size="sm">Upload resume</ButtonLink>} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {recs.data.map(({ job, match }) => (
                  <JobCard key={job._id} job={job} score={match.score} onOpen={() => navigate(`/candidate/matches/${job._id}`)} />
                ))}
              </div>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title="Applications by status" />
          <div className="p-5">
            {statusData.length ? (
              <>
                <DonutChart data={statusData} centerLabel="applications" />
                <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {statusData.map((d) => (
                    <li key={d.name} className="flex justify-between rounded-lg bg-elevated/60 px-3 py-1.5">
                      <span className="text-ink-muted">{d.name}</span>
                      <span className="tabular font-bold text-ink">{d.value}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <EmptyState icon={<Briefcase className="size-5" />} title="No applications yet" description="Applications you send will be tracked here." />
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Application activity" description="Applications sent in the last 30 days" />
          <div className="p-5 pt-3">
            <TimelineChart data={data.timeline} series={[{ key: 'count', name: 'Applications' }]} height={220} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Upcoming interviews" />
          <div className="p-5">
            {data.upcomingInterviews.length ? (
              <ul className="space-y-3">
                {data.upcomingInterviews.map((i: Interview) => (
                  <li key={i._id} className="rounded-xl border border-line p-3">
                    <p className="text-sm font-semibold text-ink">{i.job?.title}</p>
                    <p className="text-caption text-ink-muted">{i.job?.company}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-caption font-semibold text-primary">
                      <CalendarClock className="size-3.5" /> {formatDateTime(i.scheduledAt)}, {i.type}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">No interviews scheduled. Invitations will show up here and in your notifications.</p>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader title="Recent activity" action={<ButtonLink to="/notifications" variant="ghost" size="sm">All notifications</ButtonLink>} />
          <ul className="divide-y divide-line px-5 pb-2">
            {data.recentActivity.length === 0 && <li className="py-4 text-sm text-ink-muted">Nothing yet. Your uploads, applications and status updates will appear here.</li>}
            {data.recentActivity.map((n: any) => (
              <li key={n._id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  {n.message && <p className="text-sm text-ink-muted">{n.message}</p>}
                </div>
                <span className="shrink-0 text-caption text-ink-faint">{timeAgo(n.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// --- Match detail -------------------------------------------------------------------------------
export function MatchPage() {
  const { jobId = '' } = useParams();
  const toast = useToast();
  const [narrative, setNarrative] = useState(false);
  const job = useAsync(() => jobsApi.get(jobId), [jobId]);
  const match = useAsync(() => matchingApi.forJob(jobId, narrative), [jobId, narrative]);
  const [applyOpen, setApplyOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Link to="/candidate/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Back to jobs
      </Link>
      {job.loading ? (
        <SkeletonCard lines={2} />
      ) : job.error || !job.data ? (
        <ErrorState message={job.error?.message ?? 'Job not found'} />
      ) : (
        <PageHeader
          title={job.data.title}
          description={
            <span className="flex flex-col gap-2">
              <span className="font-semibold text-ink">{job.data.company}</span>
              <JobMeta job={job.data} />
            </span>
          }
          actions={
            job.data.application ? (
              <Badge tone="primary" dot>
                Applied {timeAgo(job.data.application.createdAt)}: {STATUS_LABEL[job.data.application.status]}
              </Badge>
            ) : (
              <Button onClick={() => setApplyOpen(true)}>Apply now</Button>
            )
          }
        />
      )}
      {match.loading ? (
        <AIWorking label="Scoring your profile against this job" />
      ) : match.error ? (
        <ErrorState message={match.error.status === 404 ? 'Add skills to your profile or upload a resume to get a match score.' : match.error.message} onRetry={() => match.reload()} />
      ) : match.data ? (
        <>
          <MatchBreakdown match={match.data} />
          {!match.data.narrative && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" icon={<Sparkles className="size-4" />} onClick={() => setNarrative(true)}>
                Ask the AI for a written summary
              </Button>
            </div>
          )}
          {narrative && !match.data.narrative && !match.data.llmUsed && <p className="text-right text-caption text-ink-faint">A written summary needs the language model, which is not configured on this server.</p>}
        </>
      ) : null}
      {job.data && (
        <ApplyModal
          job={job.data}
          open={applyOpen}
          onClose={() => setApplyOpen(false)}
          onApplied={() => {
            toast.success('Application sent', `${job.data!.company} will be notified.`);
            void job.reload(true);
          }}
        />
      )}
    </div>
  );
}

// --- My matches ---------------------------------------------------------------------------------
export function MyMatches() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync(() => matchingApi.mine(), []);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();
  const refresh = async () => {
    setRefreshing(true);
    try {
      await matchingApi.recommendations(12);
      await reload(true);
      toast.success('Matches updated');
    } catch (err) {
      toast.error('Could not update matches', toApiError(err).message);
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <div>
      <PageHeader title="My matches" description="Every job you have been scored against, best fit first." actions={<Button icon={<Sparkles className="size-4" />} loading={refreshing} loadingText="Scoring open jobs" onClick={refresh}>Score open jobs</Button>} />
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => reload()} />
      ) : !data?.length ? (
        <EmptyState icon={<Target className="size-5" />} title="No matches yet" description="Score open jobs to see where you fit best." action={<Button onClick={refresh} loading={refreshing}>Score open jobs</Button>} />
      ) : (
        <motion.ul variants={staggerChildren(0.04)} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((m) => (
            <motion.li key={m._id} variants={fadeUp}>
              <Card spotlight interactive className="flex h-full flex-col p-5">
                <div className="flex items-start gap-4">
                  <ScoreRing score={m.overallScore} size={60} stroke={6} />
                  <div className="min-w-0 flex-1">
                    <button onClick={() => navigate(`/candidate/matches/${m.job._id}`)} className="text-left after:absolute after:inset-0">
                      <h3 className="line-clamp-2 font-bold text-ink">{m.job.title}</h3>
                    </button>
                    <p className="text-sm text-ink-muted">{m.job.company}</p>
                    <Badge tone={categoryTone(m.category)} className="mt-2">
                      {m.category}
                    </Badge>
                  </div>
                </div>
                <p className="mt-4 text-caption text-ink-muted">
                  {m.matchedSkills.length} matched, {m.missingSkills.length} missing skills. Updated {timeAgo(m.computedAt)}.
                </p>
                {m.job.status !== 'published' && <Badge className="mt-3 self-start">This job is no longer open</Badge>}
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

// --- Skill analysis ----------------------------------------------------------------------------------
export function SkillAnalysis() {
  const { data, loading, error, reload } = useAsync(() => matchingApi.skillGap(), []);
  const profile = useAsync(() => candidateApi.me(), []);
  const recs = useAsync(() => matchingApi.recommendations(3), []);
  const categories = useMemo(() => Object.entries((data?.candidate_categories ?? {}) as Record<string, number>).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count), [data]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error.message} onRetry={() => reload()} />;
  return (
    <div className="space-y-6">
      <PageHeader title="Skill analysis" description={`Based on ${data?.jobs_analysed ?? 0} jobs you applied to, saved, or that are open now.`} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Your skills by category" description={`${profile.data?.skills.length ?? 0} skills on your profile`} />
          <div className="p-5">{categories.length ? <BarsChart data={categories} xKey="category" yKey="count" name="Skills" horizontal height={Math.max(180, categories.length * 38)} /> : <EmptyState title="No skills yet" description="Add skills on your profile or upload a resume." />}</div>
        </Card>
        <Card>
          <CardHeader title="Skill gaps" description="Skills these jobs ask for that your profile does not show" />
          <ul className="divide-y divide-line px-5 pb-3">
            {(data?.gaps ?? []).slice(0, 10).map((g: any) => (
              <li key={g.skill} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{g.skill}</p>
                  <p className="text-caption text-ink-muted">
                    {g.category}
                    {g.bridges.length > 0 && <span className="text-success">. You know {g.bridges.join(', ')}</span>}
                  </p>
                </div>
                <div className="text-right text-caption">
                  {g.required_in > 0 && <Badge tone="danger">Required in {g.required_in}</Badge>}
                  {g.preferred_in > 0 && <Badge tone="warning" className="ml-1">Preferred in {g.preferred_in}</Badge>}
                </div>
              </li>
            ))}
            {!data?.gaps?.length && <li className="py-6 text-sm text-ink-muted">No gaps found against the analysed jobs.</li>}
          </ul>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Recommended learning" />
          <ul className="space-y-3 p-5">
            {(data?.learning_recommendations ?? []).map((r: any) => (
              <li key={r.skill} className="flex gap-3 rounded-xl border border-line p-3.5">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
                <div>
                  <p className="text-sm font-bold text-ink">{r.skill}</p>
                  <p className="text-caption text-ink-muted">{r.reason}. {r.path}.</p>
                </div>
              </li>
            ))}
            {!data?.learning_recommendations?.length && <li className="text-sm text-ink-muted">Nothing to recommend right now.</li>}
          </ul>
        </Card>
        <Card>
          <CardHeader title="Career progression" description="Roles you are closest to today, and what would move the score" />
          <ul className="space-y-3 p-5">
            {recs.loading && <SkeletonCard lines={2} />}
            {(recs.data ?? []).map(({ job, match }) => (
              <li key={job._id} className="rounded-xl border border-line p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <Link to={`/candidate/matches/${job._id}`} className="font-bold text-ink hover:text-primary">
                    {job.title}
                  </Link>
                  <span className="tabular font-bold text-ink">{match.score.toFixed(0)}</span>
                </div>
                <ProgressBar value={match.score} tone={match.score >= 80 ? 'success' : match.score >= 60 ? 'warning' : 'danger'} className="mt-2" />
                {match.missingSkills.length > 0 && <p className="mt-2 text-caption text-ink-muted">Add {match.missingSkills.slice(0, 3).map((m) => m.skill).join(', ')} to close the gap.</p>}
              </li>
            ))}
            {!recs.loading && !recs.data?.length && <li className="text-sm text-ink-muted">Complete your profile to see suggested next roles.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}

// --- Applications -----------------------------------------------------------------------------------
const TRACK: ApplicationStatus[] = ['applied', 'screened', 'shortlisted', 'interview', 'hired'];

function StatusTracker({ status }: { status: ApplicationStatus }) {
  const ended = status === 'rejected' || status === 'withdrawn';
  const idx = TRACK.indexOf(status);
  return (
    <ol className="flex items-center" aria-label={`Application status: ${STATUS_LABEL[status]}`}>
      {TRACK.map((s, i) => {
        const done = !ended && i <= idx;
        return (
          <li key={s} className="flex flex-1 items-center last:flex-none">
            <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold transition-colors', done ? 'bg-primary text-white' : 'border border-line-strong text-ink-faint')} title={STATUS_LABEL[s]}>
              {done ? <CheckCircle2 className="size-3.5" /> : i + 1}
            </span>
            {i < TRACK.length - 1 && <span className={cn('mx-1 h-0.5 flex-1 rounded-full', !ended && i < idx ? 'bg-primary' : 'bg-line')} />}
          </li>
        );
      })}
    </ol>
  );
}

export function MyApplications() {
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(() => applicationsApi.mine(), []);
  const interviews = useAsync(() => interviewsApi.list({ status: 'scheduled' }), []);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<Application | null>(null);

  return (
    <div>
      <PageHeader title="Applications" description="Track each application from submission to decision." />
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}</div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => reload()} />
      ) : !data?.length ? (
        <EmptyState icon={<Briefcase className="size-5" />} title="No applications yet" description="When you apply to a job, its progress shows up here." action={<ButtonLink to="/candidate/jobs">Discover jobs</ButtonLink>} />
      ) : (
        <motion.ul variants={staggerChildren(0.05)} initial="hidden" animate="show" className="space-y-3">
          {data.map((a) => {
            const interview = interviews.data?.find((i) => i.application === a._id);
            const open = expanded === a._id;
            return (
              <motion.li key={a._id} variants={fadeUp}>
                <Card className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-ink">{a.job?.title ?? 'Job removed'}</h3>
                        <Badge tone={a.status === 'hired' ? 'success' : a.status === 'rejected' ? 'danger' : a.status === 'withdrawn' ? 'neutral' : 'primary'}>{STATUS_LABEL[a.status]}</Badge>
                      </div>
                      <p className="text-sm text-ink-muted">
                        {a.job?.company}. Applied {formatDate(a.createdAt)}
                      </p>
                    </div>
                    <div className="w-full lg:w-72">
                      <StatusTracker status={a.status} />
                    </div>
                    <div className="flex items-center gap-3">
                      {a.matchScore != null && <ScoreRing score={a.matchScore} size={44} stroke={4} />}
                      <Button variant="ghost" size="sm" onClick={() => setExpanded(open ? null : a._id)} aria-expanded={open}>
                        {open ? 'Hide history' : 'History'}
                      </Button>
                    </div>
                  </div>
                  {interview && (
                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-primary-soft px-4 py-3 text-sm">
                      <CalendarClock className="size-4 text-primary" aria-hidden />
                      <span className="font-semibold text-ink">
                        {interview.type} interview, {formatDateTime(interview.scheduledAt)} ({interview.durationMinutes} min)
                      </span>
                      {interview.meetingUrl && (
                        <a href={interview.meetingUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                          <Video className="size-4" /> Join meeting
                        </a>
                      )}
                    </div>
                  )}
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <ol className="mt-5 space-y-3 border-l-2 border-line pl-5">
                          {[...a.statusHistory].reverse().map((h, i) => (
                            <li key={i} className="relative text-sm">
                              <span className="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full border-2 border-surface bg-primary" />
                              <p className="font-semibold text-ink">
                                {STATUS_LABEL[h.to]}
                                {h.actor === 'system' && <span className="font-normal text-ink-faint"> (automatic screening)</span>}
                              </p>
                              <p className="text-caption text-ink-faint">{formatDateTime(h.at)}</p>
                            </li>
                          ))}
                        </ol>
                        {!['hired', 'rejected', 'withdrawn'].includes(a.status) && (
                          <Button variant="ghost" size="sm" className="mt-4 text-danger" onClick={() => setWithdrawing(a)}>
                            Withdraw application
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
      <ConfirmDialog
        open={!!withdrawing}
        onClose={() => setWithdrawing(null)}
        title="Withdraw this application?"
        description={`The recruiter for ${withdrawing?.job?.title ?? 'this job'} will be told you withdrew. You cannot re-apply to the same job.`}
        confirmLabel="Withdraw"
        tone="danger"
        onConfirm={async () => {
          try {
            const updated = await applicationsApi.withdraw(withdrawing!._id);
            setData((d) => d?.map((x) => (x._id === updated._id ? { ...x, status: updated.status, statusHistory: updated.statusHistory } : x)));
            toast.success('Application withdrawn');
          } catch (err) {
            toast.error('Could not withdraw', toApiError(err).message);
          }
        }}
      />
    </div>
  );
}

// --- Saved jobs -----------------------------------------------------------------------------------------
export function SavedJobs() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload, setData } = useAsync(() => jobsApi.bookmarks(), []);
  return (
    <div>
      <PageHeader title="Saved jobs" description="Jobs you bookmarked to come back to." />
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => reload()} />
      ) : !data?.length ? (
        <EmptyState icon={<FileText className="size-5" />} title="No saved jobs" description="Use the bookmark on any job to save it here." action={<ButtonLink to="/candidate/jobs">Discover jobs</ButtonLink>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onOpen={() => navigate(`/candidate/matches/${job._id}`)}
              onBookmark={async () => {
                setData((d) => d?.filter((j) => j._id !== job._id));
                try {
                  await jobsApi.bookmark(job._id, false);
                } catch (err) {
                  toast.error('Could not update saved jobs', toApiError(err).message);
                  void reload(true);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

