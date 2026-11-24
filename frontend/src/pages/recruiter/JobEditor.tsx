import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { JobCard } from '@/components/jobs/JobCard';
import { AIWorking } from '@/components/ai/AIProcessing';
import { Button, Card, DashboardSkeleton, ErrorState, Input, PageHeader, Select, Switch, TagInput, Textarea } from '@/components/ui';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks';
import { toApiError } from '@/services/api';
import { jobsApi, recruiterApi, skillsApi } from '@/services/endpoints';
import type { EmploymentType, Job, WorkMode } from '@/types';
import { EDUCATION_LABELS } from '@/utils/format';

const schema = z
  .object({
    title: z.string().trim().min(3, 'Give the job a title of at least 3 characters'),
    description: z.string().trim().min(30, 'Describe the role in at least 30 characters'),
    company: z.string().trim().min(2, 'Enter the company name'),
    requiredSkills: z.array(z.string()).min(1, 'Add at least one required skill'),
    salaryMin: z.number().min(0).optional(),
    salaryMax: z.number().min(0).optional(),
  })
  .refine((v) => v.salaryMin === undefined || v.salaryMax === undefined || v.salaryMax >= v.salaryMin, { path: ['salaryMax'], message: 'Maximum must be at least the minimum' });

type Form = {
  title: string;
  description: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  educationLevel: number;
  educationRequired: boolean;
  employmentType: EmploymentType;
  workMode: WorkMode;
  location: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  period: 'year' | 'month' | 'hour';
  deadline: string;
};

const EMPTY: Form = { title: '', description: '', company: '', requiredSkills: [], preferredSkills: [], minExperienceYears: 0, educationLevel: 0, educationRequired: false, employmentType: 'full-time', workMode: 'onsite', location: '', salaryMin: '', salaryMax: '', currency: 'USD', period: 'year', deadline: '' };

export default function JobEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const editing = !!id;
  const existing = useAsync(() => (id ? jobsApi.get(id) : Promise.resolve(null)), [id]);
  const profile = useAsync(() => recruiterApi.me(), []);
  const taxonomy = useAsync(() => skillsApi.list({ limit: 100 }), []);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [scan, setScan] = useState<{ flagged: boolean; findings: { type: string }[] } | null>(null);

  useEffect(() => {
    const j = existing.data;
    if (j) {
      setForm({
        title: j.title, description: j.description, company: j.company, requiredSkills: j.requiredSkills, preferredSkills: j.preferredSkills,
        minExperienceYears: j.minExperienceYears, educationLevel: j.educationLevel, educationRequired: j.educationRequired, employmentType: j.employmentType,
        workMode: j.workMode, location: j.location, salaryMin: j.salary?.min?.toString() ?? '', salaryMax: j.salary?.max?.toString() ?? '',
        currency: j.salary?.currency ?? 'USD', period: j.salary?.period ?? 'year', deadline: j.deadline ? j.deadline.slice(0, 10) : '',
      });
      if (j.security?.flagged) setScan(j.security);
    } else if (!editing && profile.data?.company) {
      setForm((f) => ({ ...f, company: f.company || profile.data!.company }));
    }
  }, [existing.data, profile.data, editing]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const suggest = async () => {
    if (form.description.trim().length < 20) {
      setErrors((e) => ({ ...e, description: 'Paste the job description first (20+ characters)' }));
      return;
    }
    setExtracting(true);
    try {
      const r = await jobsApi.extract(form.title || 'Untitled role', form.description);
      setForm((f) => ({
        ...f,
        requiredSkills: [...new Set([...f.requiredSkills, ...r.required_skills])],
        preferredSkills: [...new Set([...f.preferredSkills, ...r.preferred_skills])].filter((s) => !r.required_skills.includes(s)),
        minExperienceYears: f.minExperienceYears || r.min_experience_years,
        educationLevel: f.educationLevel || r.education_level,
        workMode: r.work_mode_hint ?? f.workMode,
      }));
      setScan(r.security);
      toast.success('Suggestions added', `${r.required_skills.length} required and ${r.preferred_skills.length} preferred skills found. Review them before publishing.`);
    } catch (err) {
      toast.error('Could not analyse the description', toApiError(err).message);
    } finally {
      setExtracting(false);
    }
  };

  const submit = async (mode: 'draft' | 'publish') => {
    const parsed = schema.safeParse({ ...form, salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined, salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});
    setSaving(mode);
    const body: Partial<Job> & { publish?: boolean } = {
      title: form.title, description: form.description, company: form.company, requiredSkills: form.requiredSkills, preferredSkills: form.preferredSkills,
      minExperienceYears: Number(form.minExperienceYears) || 0, educationLevel: Number(form.educationLevel), educationRequired: form.educationRequired,
      employmentType: form.employmentType, workMode: form.workMode, location: form.location,
      salary: form.salaryMin || form.salaryMax ? { min: form.salaryMin ? Number(form.salaryMin) : undefined, max: form.salaryMax ? Number(form.salaryMax) : undefined, currency: form.currency, period: form.period } : undefined,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
    };
    try {
      if (editing) {
        await jobsApi.update(id!, body);
        if (mode === 'publish' && existing.data?.status !== 'published') await jobsApi.publish(id!);
      } else {
        await jobsApi.create({ ...body, publish: mode === 'publish' });
      }
      toast.success(mode === 'publish' ? 'Job published' : 'Draft saved');
      navigate('/recruiter/jobs');
    } catch (err) {
      const e = toApiError(err);
      toast.error('Could not save the job', e.details?.[0] ? `${e.details[0].path}: ${e.details[0].message}` : e.message);
    } finally {
      setSaving(null);
    }
  };

  if (editing && existing.loading) return <DashboardSkeleton />;
  if (editing && existing.error) return <ErrorState message={existing.error.message} />;

  const preview: Job = {
    _id: 'preview', recruiter: '', company: form.company || 'Your company', title: form.title || 'Job title', description: form.description, requiredSkills: form.requiredSkills,
    preferredSkills: form.preferredSkills, minExperienceYears: form.minExperienceYears, educationLevel: form.educationLevel, educationRequired: form.educationRequired,
    employmentType: form.employmentType, workMode: form.workMode, location: form.location, status: 'draft', views: 0, applicationsCount: 0, createdAt: '', updatedAt: '',
    salary: form.salaryMin || form.salaryMax ? { min: Number(form.salaryMin) || undefined, max: Number(form.salaryMax) || undefined, currency: form.currency, period: form.period } : undefined,
  };
  const skillNames = (taxonomy.data?.items ?? []).map((s) => s.name);

  return (
    <div>
      <Link to="/recruiter/jobs" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All jobs
      </Link>
      <PageHeader
        title={editing ? 'Edit job' : 'Post a job'}
        description="Requirements you set here drive the match score for every applicant."
        actions={
          <>
            <Button variant="secondary" loading={saving === 'draft'} disabled={!!saving} onClick={() => submit('draft')}>
              {editing ? 'Save changes' : 'Save draft'}
            </Button>
            {existing.data?.status !== 'published' && (
              <Button loading={saving === 'publish'} disabled={!!saving} onClick={() => submit('publish')}>
                Publish
              </Button>
            )}
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <h2 className="font-bold text-ink">The role</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Job title" value={form.title} onChange={(e) => set('title', e.target.value)} error={errors.title} required />
              <Input label="Company" value={form.company} onChange={(e) => set('company', e.target.value)} error={errors.company} required />
            </div>
            <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} error={errors.description} className="min-h-56" maxLength={20000} required hint="Paste the full description. Sections like Requirements and Nice to have help the AI sort skills." />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" icon={<Sparkles className="size-4" />} onClick={suggest} loading={extracting} loadingText="Reading description">
                Suggest skills from description
              </Button>
              <span className="text-caption text-ink-faint">Suggestions are added to the lists below for you to review.</span>
            </div>
            <AnimatePresence>
              {extracting && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <AIWorking label="Extracting skills, experience and education requirements" />
                </motion.div>
              )}
            </AnimatePresence>
            {scan?.flagged && (
              <div role="alert" className="flex gap-3 rounded-xl border border-warning/40 bg-warning-soft p-3.5 text-sm">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                <p className="text-ink-muted">
                  <span className="font-semibold text-ink">This description contains text that looks like instructions to an AI.</span> It will not change how candidates are scored, but please remove it.
                </p>
              </div>
            )}
          </Card>

          <Card className="space-y-5 p-6">
            <h2 className="font-bold text-ink">Requirements</h2>
            <TagInput label="Required skills" value={form.requiredSkills} onChange={(v) => set('requiredSkills', v)} suggestions={skillNames} placeholder="Type a skill and press Enter" hint="80% of the skills score comes from these." />
            {errors.requiredSkills && <p className="-mt-3 text-caption font-medium text-danger">{errors.requiredSkills}</p>}
            <TagInput label="Preferred skills" value={form.preferredSkills} onChange={(v) => set('preferredSkills', v)} suggestions={skillNames} placeholder="Nice-to-have skills" hint="20% of the skills score." />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Minimum experience (years)" type="number" min={0} max={40} value={form.minExperienceYears} onChange={(e) => set('minExperienceYears', Number(e.target.value))} />
              <Select label="Education" value={form.educationLevel} onChange={(e) => set('educationLevel', Number(e.target.value))} options={EDUCATION_LABELS.map((l, i) => ({ value: i, label: i ? l : 'No requirement' }))} />
              <div className="flex items-end pb-1">
                <Switch checked={form.educationRequired} onChange={(v) => set('educationRequired', v)} label="Strictly required" disabled={!form.educationLevel} />
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-bold text-ink">Logistics</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Select label="Work mode" value={form.workMode} onChange={(e) => set('workMode', e.target.value as WorkMode)} options={[{ value: 'onsite', label: 'On-site' }, { value: 'hybrid', label: 'Hybrid' }, { value: 'remote', label: 'Remote' }]} />
              <Select label="Employment type" value={form.employmentType} onChange={(e) => set('employmentType', e.target.value as EmploymentType)} options={[{ value: 'full-time', label: 'Full-time' }, { value: 'part-time', label: 'Part-time' }, { value: 'contract', label: 'Contract' }, { value: 'internship', label: 'Internship' }]} />
              <Input label="Location" value={form.location} onChange={(e) => set('location', e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <Input label="Salary from" type="number" min={0} value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} />
              <Input label="Salary to" type="number" min={0} value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} error={errors.salaryMax} />
              <Select label="Currency" value={form.currency} onChange={(e) => set('currency', e.target.value)} options={['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'SGD'].map((c) => ({ value: c, label: c }))} />
              <Select label="Per" value={form.period} onChange={(e) => set('period', e.target.value as Form['period'])} options={[{ value: 'year', label: 'Year' }, { value: 'month', label: 'Month' }, { value: 'hour', label: 'Hour' }]} />
            </div>
            <Input label="Application deadline" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} wrapperClassName="sm:w-60" />
          </Card>
        </div>
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <p className="mb-2 text-caption font-semibold text-ink-muted">Preview as candidates see it</p>
          <JobCard job={preview} />
          <Card className="mt-4 p-4 text-sm text-ink-muted">
            Scores use fixed weights: skills 50%, experience 20%, education 10%, role fit 20%. They are the same for every job so rankings stay comparable.
          </Card>
        </aside>
      </div>
    </div>
  );
}
