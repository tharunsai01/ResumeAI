import { AnimatePresence, motion } from 'framer-motion';
import { Award, Briefcase, FolderGit2, GraduationCap, Link2, Pencil, Plus, Sparkles, Trash2, User } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Badge, Button, Card, DashboardSkeleton, ErrorState, Input, PageHeader, ScoreRing, Select, Switch, TagInput, Textarea } from '@/components/ui';
import { duration, ease } from '@/config/motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAsync } from '@/hooks';
import { toApiError } from '@/services/api';
import { candidateApi, skillsApi } from '@/services/endpoints';
import type { CandidateProfile, Education, Experience } from '@/types';
import { EDUCATION_LABELS, formatDate } from '@/utils/format';

type SectionKey = 'personal' | 'skills' | 'experience' | 'education' | 'projects' | 'certifications' | 'links';

function Section({ icon, title, description, editing, onEdit, onCancel, onSave, saving, view, form }: { icon: ReactNode; title: string; description?: string; editing: boolean; onEdit: () => void; onCancel: () => void; onSave: () => void; saving: boolean; view: ReactNode; form: ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">{icon}</span>
          <div>
            <h2 className="font-bold text-ink">{title}</h2>
            {description && <p className="text-caption text-ink-muted">{description}</p>}
          </div>
        </div>
        {!editing && (
          <Button variant="ghost" size="sm" icon={<Pencil className="size-3.5" />} onClick={onEdit} aria-label={`Edit ${title}`}>
            Edit
          </Button>
        )}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={editing ? 'form' : 'view'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } }} exit={{ opacity: 0, transition: { duration: duration.fast } }}>
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSave();
              }}
            >
              {form}
              <div className="mt-5 flex justify-end gap-2">
                <Button variant="ghost" onClick={onCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving} loadingText="Saving">
                  Save changes
                </Button>
              </div>
            </form>
          ) : (
            view
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}

const toDateInput = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 7) : '');

export default function CandidateProfilePage() {
  const toast = useToast();
  const { user, setUser } = useAuth();
  const { data, loading, error, reload, setData } = useAsync(() => candidateApi.me(), []);
  const taxonomy = useAsync(() => skillsApi.list({ limit: 100 }), []);
  const [editing, setEditing] = useState<SectionKey | null>(null);
  const [draft, setDraft] = useState<CandidateProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && !editing) setDraft(structuredClone(data));
  }, [data, editing]);

  if (loading) return <DashboardSkeleton />;
  if (error || !data || !draft) return <ErrorState message={error?.message ?? 'Could not load your profile'} onRetry={() => reload()} />;

  const set = <K extends keyof CandidateProfile>(k: K, v: CandidateProfile[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const save = async (fields: Partial<CandidateProfile> & { name?: string }) => {
    setSaving(true);
    try {
      const updated = await candidateApi.update(fields);
      setData(updated);
      if (fields.name && user) setUser({ ...user, name: fields.name });
      setEditing(null);
      toast.success('Profile saved');
    } catch (err) {
      const e = toApiError(err);
      toast.error('Could not save', e.details?.[0] ? `${e.details[0].path}: ${e.details[0].message}` : e.message);
    } finally {
      setSaving(false);
    }
  };

  const common = (key: SectionKey) => ({
    editing: editing === key,
    onEdit: () => {
      setDraft(structuredClone(data));
      setEditing(key);
    },
    onCancel: () => setEditing(null),
    saving,
  });

  const updateExp = (i: number, patch: Partial<Experience>) => set('experience', draft.experience.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const updateEdu = (i: number, patch: Partial<Education>) => set('education', draft.education.map((e, j) => (j === i ? { ...e, ...patch } : e)));

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="What recruiters see when you apply, and what matching uses alongside your resume." />
      <Card className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <ScoreRing score={data.completeness} size={84} stroke={8} label={`Profile ${data.completeness}% complete`} />
        <div className="flex-1">
          <h2 className="text-h3 font-bold text-ink">{data.name}</h2>
          <p className="text-sm text-ink-muted">{data.headline || 'Add a headline so recruiters know what you do'}</p>
          <p className="mt-1 text-caption text-ink-faint">{data.email}</p>
        </div>
        <div className="sm:w-80">
          <Switch
            checked={data.openToRecruiters}
            label="Visible in the talent pool"
            description="Recruiters can find your profile even if you have not applied to their jobs."
            onChange={async (v) => {
              setData({ ...data, openToRecruiters: v });
              try {
                await candidateApi.update({ openToRecruiters: v });
                toast.success(v ? 'You are visible to recruiters' : 'You are hidden from the talent pool');
              } catch (err) {
                setData({ ...data, openToRecruiters: !v });
                toast.error('Could not update visibility', toApiError(err).message);
              }
            }}
          />
        </div>
      </Card>

      <Section
        {...common('personal')}
        icon={<User className="size-4" />}
        title="Personal details and summary"
        onSave={() => save({ name: draft.name, headline: draft.headline, location: draft.location, phone: draft.phone, summary: draft.summary, totalExperienceYears: Number(draft.totalExperienceYears) || 0 })}
        view={
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            {[
              ['Headline', data.headline],
              ['Location', data.location],
              ['Phone', data.phone],
              ['Total experience', data.totalExperienceYears ? `${data.totalExperienceYears} years` : ''],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-caption font-semibold text-ink-faint">{k}</dt>
                <dd className="mt-0.5 font-medium text-ink">{v || <span className="text-ink-faint">Not added</span>}</dd>
              </div>
            ))}
            <div className="sm:col-span-2">
              <dt className="text-caption font-semibold text-ink-faint">Professional summary</dt>
              <dd className="mt-0.5 leading-relaxed text-ink-muted">{data.summary || <span className="text-ink-faint">Not added</span>}</dd>
            </div>
          </dl>
        }
        form={
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" value={draft.name} onChange={(e) => set('name', e.target.value)} required />
            <Input label="Headline" placeholder="e.g. Backend engineer, Python and Go" value={draft.headline} onChange={(e) => set('headline', e.target.value)} maxLength={150} />
            <Input label="Location" value={draft.location} onChange={(e) => set('location', e.target.value)} />
            <Input label="Phone" type="tel" value={draft.phone} onChange={(e) => set('phone', e.target.value)} />
            <Input label="Total years of experience" type="number" min={0} max={60} step={0.5} value={draft.totalExperienceYears} onChange={(e) => set('totalExperienceYears', Number(e.target.value))} hint="Leave 0 to calculate from your roles" />
            <Textarea wrapperClassName="sm:col-span-2" label="Professional summary" value={draft.summary} onChange={(e) => set('summary', e.target.value)} maxLength={3000} hint="Shown to recruiters. Not used in match scoring." />
          </div>
        }
      />

      <Section
        {...common('skills')}
        icon={<Sparkles className="size-4" />}
        title="Skills"
        description="Skills carry 50% of every match score"
        onSave={() => save({ skills: draft.skills })}
        view={data.skills.length ? <div className="flex flex-wrap gap-1.5">{data.skills.map((s) => <Badge key={s.name} tone="primary">{s.name}</Badge>)}</div> : <p className="text-sm text-ink-faint">No skills added yet.</p>}
        form={
          <TagInput
            label="Your skills"
            placeholder="Type a skill and press Enter"
            hint="Use the names you would use on a resume. Aliases such as ReactJS are recognised."
            value={draft.skills.map((s) => s.name)}
            suggestions={(taxonomy.data?.items ?? []).map((s) => s.name)}
            max={100}
            onChange={(names) => set('skills', names.map((n) => draft.skills.find((s) => s.name === n) ?? { name: n, level: 'intermediate' }))}
          />
        }
      />

      <Section
        {...common('experience')}
        icon={<Briefcase className="size-4" />}
        title="Experience"
        onSave={() => save({ experience: draft.experience.map((e) => ({ ...e, endDate: e.current ? null : e.endDate || null })) })}
        view={
          data.experience.length ? (
            <ol className="space-y-4">
              {data.experience.map((e) => (
                <li key={e._id ?? e.title} className="border-l-2 border-primary/40 pl-4">
                  <p className="font-bold text-ink">{e.title}</p>
                  <p className="text-sm text-ink-muted">{e.company}</p>
                  <p className="text-caption text-ink-faint">
                    {formatDate(e.startDate, { month: 'short', year: 'numeric' })} to {e.current ? 'present' : formatDate(e.endDate, { month: 'short', year: 'numeric' })}
                  </p>
                  {e.description && <p className="mt-1 text-sm leading-relaxed text-ink-muted">{e.description}</p>}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-ink-faint">No roles added yet.</p>
          )
        }
        form={
          <div className="space-y-4">
            {draft.experience.map((e, i) => (
              <div key={i} className="rounded-2xl border border-line p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Job title" value={e.title} onChange={(ev) => updateExp(i, { title: ev.target.value })} required />
                  <Input label="Company" value={e.company} onChange={(ev) => updateExp(i, { company: ev.target.value })} />
                  <Input label="Start" type="month" value={toDateInput(e.startDate)} onChange={(ev) => updateExp(i, { startDate: ev.target.value ? `${ev.target.value}-01` : undefined })} />
                  <Input label="End" type="month" value={toDateInput(e.endDate)} disabled={e.current} onChange={(ev) => updateExp(i, { endDate: ev.target.value ? `${ev.target.value}-01` : null })} />
                  <label className="flex items-center gap-2 text-sm font-medium text-ink sm:col-span-2">
                    <input type="checkbox" checked={e.current} onChange={(ev) => updateExp(i, { current: ev.target.checked })} className="size-4 accent-[var(--primary)]" /> I currently work here
                  </label>
                  <Textarea wrapperClassName="sm:col-span-2" label="What you did" value={e.description} onChange={(ev) => updateExp(i, { description: ev.target.value })} maxLength={2000} className="min-h-20" />
                </div>
                <Button variant="ghost" size="sm" className="mt-2 text-danger" icon={<Trash2 className="size-3.5" />} onClick={() => set('experience', draft.experience.filter((_, j) => j !== i))}>
                  Remove role
                </Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => set('experience', [...draft.experience, { title: '', company: '', current: false, description: '' }])}>
              Add role
            </Button>
          </div>
        }
      />

      <Section
        {...common('education')}
        icon={<GraduationCap className="size-4" />}
        title="Education"
        onSave={() => save({ education: draft.education })}
        view={
          data.education.length ? (
            <ul className="space-y-3">
              {data.education.map((e) => (
                <li key={e._id ?? e.degree}>
                  <p className="font-bold text-ink">{e.degree || EDUCATION_LABELS[e.level]}</p>
                  <p className="text-sm text-ink-muted">{[e.institution, e.field, e.endYear].filter(Boolean).join(', ')}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-faint">No education added. Missing optional education is never penalised.</p>
          )
        }
        form={
          <div className="space-y-4">
            {draft.education.map((e, i) => (
              <div key={i} className="grid gap-3 rounded-2xl border border-line p-4 sm:grid-cols-2">
                <Select label="Level" value={e.level} onChange={(ev) => updateEdu(i, { level: Number(ev.target.value) })} options={EDUCATION_LABELS.map((l, v) => ({ value: v, label: l }))} />
                <Input label="Degree" value={e.degree} onChange={(ev) => updateEdu(i, { degree: ev.target.value })} />
                <Input label="Field of study" value={e.field} onChange={(ev) => updateEdu(i, { field: ev.target.value })} />
                <Input label="Institution" value={e.institution} onChange={(ev) => updateEdu(i, { institution: ev.target.value })} />
                <Input label="Graduation year" type="number" min={1950} max={2100} value={e.endYear ?? ''} onChange={(ev) => updateEdu(i, { endYear: ev.target.value ? Number(ev.target.value) : undefined })} />
                <div className="flex items-end">
                  <Button variant="ghost" size="sm" className="text-danger" icon={<Trash2 className="size-3.5" />} onClick={() => set('education', draft.education.filter((_, j) => j !== i))}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => set('education', [...draft.education, { institution: '', degree: '', field: '', level: 3 }])}>
              Add education
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Section
          {...common('projects')}
          icon={<FolderGit2 className="size-4" />}
          title="Projects"
          onSave={() => save({ projects: draft.projects.filter((p) => p.name.trim()) })}
          view={
            data.projects.length ? (
              <ul className="space-y-3">
                {data.projects.map((p) => (
                  <li key={p._id ?? p.name}>
                    <p className="font-bold text-ink">{p.url ? <a className="hover:text-primary" href={p.url} target="_blank" rel="noreferrer noopener">{p.name}</a> : p.name}</p>
                    {p.description && <p className="text-sm text-ink-muted">{p.description}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-faint">No projects added.</p>
            )
          }
          form={
            <div className="space-y-3">
              {draft.projects.map((p, i) => (
                <div key={i} className="space-y-3 rounded-2xl border border-line p-4">
                  <Input label="Name" value={p.name} onChange={(e) => set('projects', draft.projects.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <Input label="Link" type="url" placeholder="https://" value={p.url} onChange={(e) => set('projects', draft.projects.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
                  <Textarea label="Description" value={p.description} className="min-h-16" onChange={(e) => set('projects', draft.projects.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
                  <Button variant="ghost" size="sm" className="text-danger" onClick={() => set('projects', draft.projects.filter((_, j) => j !== i))}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => set('projects', [...draft.projects, { name: '', description: '', url: '', technologies: [] }])}>
                Add project
              </Button>
            </div>
          }
        />
        <Section
          {...common('certifications')}
          icon={<Award className="size-4" />}
          title="Certifications"
          onSave={() => save({ certifications: draft.certifications.filter((c) => c.name.trim()) })}
          view={
            data.certifications.length ? (
              <ul className="space-y-2">
                {data.certifications.map((c) => (
                  <li key={c._id ?? c.name} className="text-sm">
                    <span className="font-bold text-ink">{c.name}</span>
                    <span className="text-ink-muted">{[c.issuer, c.year].filter(Boolean).length ? `, ${[c.issuer, c.year].filter(Boolean).join(', ')}` : ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-faint">No certifications added.</p>
            )
          }
          form={
            <div className="space-y-3">
              {draft.certifications.map((c, i) => (
                <div key={i} className="grid gap-3 rounded-2xl border border-line p-4 sm:grid-cols-[1fr_1fr_6rem]">
                  <Input label="Name" value={c.name} onChange={(e) => set('certifications', draft.certifications.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <Input label="Issuer" value={c.issuer} onChange={(e) => set('certifications', draft.certifications.map((x, j) => (j === i ? { ...x, issuer: e.target.value } : x)))} />
                  <Input label="Year" type="number" value={c.year ?? ''} onChange={(e) => set('certifications', draft.certifications.map((x, j) => (j === i ? { ...x, year: e.target.value ? Number(e.target.value) : undefined } : x)))} />
                  <Button variant="ghost" size="sm" className="text-danger sm:col-span-3 sm:justify-self-start" onClick={() => set('certifications', draft.certifications.filter((_, j) => j !== i))}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={() => set('certifications', [...draft.certifications, { name: '', issuer: '' }])}>
                Add certification
              </Button>
            </div>
          }
        />
      </div>

      <Section
        {...common('links')}
        icon={<Link2 className="size-4" />}
        title="Links"
        onSave={() => save({ socialLinks: draft.socialLinks })}
        view={
          <ul className="flex flex-wrap gap-4 text-sm">
            {(['linkedin', 'github', 'portfolio'] as const).map((k) => (
              <li key={k}>
                <span className="text-caption font-semibold text-ink-faint capitalize">{k}: </span>
                {data.socialLinks[k] ? (
                  <a href={data.socialLinks[k]} target="_blank" rel="noreferrer noopener" className="font-medium text-primary hover:underline">
                    {data.socialLinks[k].replace(/^https?:\/\//, '')}
                  </a>
                ) : (
                  <span className="text-ink-faint">Not added</span>
                )}
              </li>
            ))}
          </ul>
        }
        form={
          <div className="grid gap-3 sm:grid-cols-3">
            {(['linkedin', 'github', 'portfolio'] as const).map((k) => (
              <Input key={k} label={k === 'linkedin' ? 'LinkedIn' : k === 'github' ? 'GitHub' : 'Portfolio'} type="url" placeholder="https://" value={draft.socialLinks[k]} onChange={(e) => set('socialLinks', { ...draft.socialLinks, [k]: e.target.value })} />
            ))}
          </div>
        }
      />
    </div>
  );
}
