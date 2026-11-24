import { motion } from 'framer-motion';
import { Building2, Search, SlidersHorizontal, Target, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookmarkButton, JobCard, JobMeta } from '@/components/jobs/JobCard';
import { Badge, Button, ButtonLink, Drawer, EmptyState, ErrorState, Input, Modal, PageHeader, Pagination, Segmented, Select, SkeletonCard, Textarea } from '@/components/ui';
import { fadeUp, staggerChildren } from '@/config/motion';
import { useToast } from '@/context/ToastContext';
import { useAsync, useDebounce } from '@/hooks';
import { toApiError } from '@/services/api';
import { applicationsApi, jobsApi } from '@/services/endpoints';
import type { Job } from '@/types';
import { EDUCATION_LABELS, STATUS_LABEL, WORK_MODE_LABEL } from '@/utils/format';

export function ApplyModal({ job, open, onClose, onApplied }: { job: Job; open: boolean; onClose: () => void; onApplied: () => void }) {
  const [letter, setLetter] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setLetter('');
      setError(null);
    }
  }, [open]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Apply to ${job.title}`}
      description={`${job.company}. Your active resume and profile are shared with this recruiter.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            loading={busy}
            loadingText="Sending"
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await applicationsApi.apply(job._id, letter);
                onApplied();
                onClose();
              } catch (err) {
                setError(toApiError(err).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Send application
          </Button>
        </>
      }
    >
      <Textarea label="Cover letter (optional)" placeholder="A few lines on why this role fits you" value={letter} onChange={(e) => setLetter(e.target.value)} maxLength={5000} className="min-h-40" hint={`${letter.length}/5000`} />
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </Modal>
  );
}

function JobDetail({ job, onApply, onMatch }: { job: Job; onApply: () => void; onMatch: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-semibold text-ink">{job.company}</p>
        <JobMeta job={job} className="mt-2" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="cyan">{WORK_MODE_LABEL[job.workMode]}</Badge>
          {job.minExperienceYears > 0 && <Badge>{job.minExperienceYears}+ years</Badge>}
          {job.educationLevel > 0 && <Badge>{EDUCATION_LABELS[job.educationLevel]}{job.educationRequired ? ' required' : ' preferred'}</Badge>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {job.application ? (
          <Badge tone="primary" dot>
            Applied: {STATUS_LABEL[job.application.status]}
          </Badge>
        ) : (
          <Button onClick={onApply}>Apply now</Button>
        )}
        <Button variant="secondary" icon={<Target className="size-4" />} onClick={onMatch}>
          See my match
        </Button>
      </div>
      <section>
        <h3 className="mb-2 text-sm font-bold text-ink">Required skills</h3>
        <div className="flex flex-wrap gap-1.5">{job.requiredSkills.map((s) => <Badge key={s} tone="primary">{s}</Badge>)}</div>
        {job.preferredSkills.length > 0 && (
          <>
            <h3 className="mt-4 mb-2 text-sm font-bold text-ink">Nice to have</h3>
            <div className="flex flex-wrap gap-1.5">{job.preferredSkills.map((s) => <Badge key={s}>{s}</Badge>)}</div>
          </>
        )}
      </section>
      <section>
        <h3 className="mb-2 text-sm font-bold text-ink">About the role</h3>
        <p className="text-sm leading-relaxed whitespace-pre-line text-ink-muted">{job.description}</p>
      </section>
      {job.companyProfile?.about && (
        <section className="rounded-2xl border border-line p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-ink">
            <Building2 className="size-4" /> About {job.company}
          </h3>
          <p className="text-sm leading-relaxed text-ink-muted">{job.companyProfile.about}</p>
        </section>
      )}
    </div>
  );
}

const EMPTY_FILTERS = { workMode: '', employmentType: '', location: '', minSalary: '', maxExperience: '', skills: '' };

export default function JobDiscovery() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const query = useDebounce(q, 350);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState<'newest' | 'salary'>('newest');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);

  useEffect(() => setPage(1), [query, filters, sort]);
  useEffect(() => {
    setParams(query ? { q: query } : {}, { replace: true });
  }, [query, setParams]);

  const { data, loading, error, reload, setData } = useAsync(() => jobsApi.list({ q: query, ...filters, sort, page, limit: 12 }), [query, filters, sort, page]);
  const detail = useAsync(() => (selected ? jobsApi.get(selected._id) : Promise.resolve(null)), [selected?._id]);
  const activeFilters = Object.values(filters).filter(Boolean).length;

  const toggleBookmark = async (job: Job) => {
    const next = !job.bookmarked;
    setData((d) => (d ? { ...d, items: d.items.map((j) => (j._id === job._id ? { ...j, bookmarked: next } : j)) } : d));
    try {
      await jobsApi.bookmark(job._id, next);
      toast.success(next ? 'Saved to your jobs' : 'Removed from saved jobs');
    } catch (err) {
      setData((d) => (d ? { ...d, items: d.items.map((j) => (j._id === job._id ? { ...j, bookmarked: !next } : j)) } : d));
      toast.error('Could not update saved jobs', toApiError(err).message);
    }
  };

  const filterPanel = (
    <div className="space-y-5">
      <Select label="Work mode" value={filters.workMode} onChange={(e) => setFilters((f) => ({ ...f, workMode: e.target.value }))} options={[{ value: '', label: 'Any' }, { value: 'remote', label: 'Remote' }, { value: 'hybrid', label: 'Hybrid' }, { value: 'onsite', label: 'On-site' }]} />
      <Select label="Employment type" value={filters.employmentType} onChange={(e) => setFilters((f) => ({ ...f, employmentType: e.target.value }))} options={[{ value: '', label: 'Any' }, { value: 'full-time', label: 'Full-time' }, { value: 'part-time', label: 'Part-time' }, { value: 'contract', label: 'Contract' }, { value: 'internship', label: 'Internship' }]} />
      <Input label="Location" placeholder="City or country" value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))} />
      <Input label="Skills" placeholder="e.g. React, Python" hint="Comma separated, matches required skills" value={filters.skills} onChange={(e) => setFilters((f) => ({ ...f, skills: e.target.value }))} />
      <Input label="Minimum salary" type="number" min={0} inputMode="numeric" value={filters.minSalary} onChange={(e) => setFilters((f) => ({ ...f, minSalary: e.target.value }))} />
      <Select label="Experience required" value={filters.maxExperience} onChange={(e) => setFilters((f) => ({ ...f, maxExperience: e.target.value }))} options={[{ value: '', label: 'Any' }, { value: '0', label: 'No experience' }, { value: '2', label: 'Up to 2 years' }, { value: '5', label: 'Up to 5 years' }, { value: '10', label: 'Up to 10 years' }]} />
      {activeFilters > 0 && (
        <Button variant="ghost" size="sm" icon={<X className="size-4" />} onClick={() => setFilters(EMPTY_FILTERS)}>
          Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader title="Discover jobs" description="Open roles, with your match score once you have looked at them." />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input aria-label="Search jobs" placeholder="Search by title, company or skill" leading={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} type="search" />
        </div>
        <div className="flex items-center gap-2">
          <Segmented label="Sort jobs" value={sort} onChange={setSort} options={[{ value: 'newest', label: 'Newest' }, { value: 'salary', label: 'Salary' }]} />
          <Button variant="secondary" className="lg:hidden" icon={<SlidersHorizontal className="size-4" />} onClick={() => setFilterOpen(true)}>
            Filters{activeFilters ? ` (${activeFilters})` : ''}
          </Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-soft">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
              <SlidersHorizontal className="size-4" /> Filters
            </h2>
            {filterPanel}
          </div>
        </aside>
        <div>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : error ? (
            <ErrorState message={error.message} onRetry={() => reload()} />
          ) : !data?.items.length ? (
            <EmptyState icon={<Search className="size-5" />} title="No jobs match these filters" description="Try a broader search or clear some filters." action={activeFilters ? <Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</Button> : undefined} />
          ) : (
            <>
              <p className="mb-3 text-caption text-ink-muted" aria-live="polite">
                {data.meta?.total ?? data.items.length} open {data.meta?.total === 1 ? 'role' : 'roles'}
              </p>
              <motion.div key={`${query}-${page}-${sort}`} variants={staggerChildren(0.04)} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {data.items.map((job) => (
                  <motion.div key={job._id} variants={fadeUp}>
                    <JobCard job={job} onOpen={() => setSelected(job)} onBookmark={() => toggleBookmark(job)} />
                  </motion.div>
                ))}
              </motion.div>
              <Pagination page={page} pages={data.meta?.pages ?? 1} total={data.meta?.total} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      <Drawer open={filterOpen} onClose={() => setFilterOpen(false)} title="Filters" width="max-w-sm" footer={<Button onClick={() => setFilterOpen(false)}>Show results</Button>}>
        {filterPanel}
      </Drawer>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ''}
        footer={
          selected && (
            <>
              <BookmarkButton active={!!data?.items.find((j) => j._id === selected._id)?.bookmarked} onToggle={() => toggleBookmark(data!.items.find((j) => j._id === selected._id) ?? selected)} />
              <ButtonLink to={`/candidate/matches/${selected._id}`} variant="secondary">
                Full match report
              </ButtonLink>
            </>
          )
        }
      >
        {detail.loading || !detail.data ? (
          <SkeletonCard lines={8} />
        ) : (
          <JobDetail job={detail.data} onApply={() => setApplyJob(detail.data!)} onMatch={() => navigate(`/candidate/matches/${detail.data!._id}`)} />
        )}
      </Drawer>

      {applyJob && (
        <ApplyModal
          job={applyJob}
          open={!!applyJob}
          onClose={() => setApplyJob(null)}
          onApplied={() => {
            toast.success('Application sent', `${applyJob.company} will be notified.`);
            void detail.reload(true);
          }}
        />
      )}
    </div>
  );
}
