import { motion } from 'framer-motion';
import { Bookmark, Briefcase, Clock, MapPin, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge, Card, ScoreRing } from '@/components/ui';
import type { Job } from '@/types';
import { cn, formatSalary, timeAgo, WORK_MODE_LABEL } from '@/utils/format';

export function JobMeta({ job, className }: { job: Job; className?: string }) {
  const salary = formatSalary(job.salary);
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5 text-caption text-ink-muted', className)}>
      {job.location && (
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5" aria-hidden />
          {job.location}
        </span>
      )}
      <span className="flex items-center gap-1.5 capitalize">
        <Briefcase className="size-3.5" aria-hidden />
        {job.employmentType.replace('-', ' ')}
      </span>
      {salary && (
        <span className="flex items-center gap-1.5">
          <Wallet className="size-3.5" aria-hidden />
          {salary}
        </span>
      )}
      {job.publishedAt && (
        <span className="flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden />
          {timeAgo(job.publishedAt)}
        </span>
      )}
    </div>
  );
}

export function BookmarkButton({ active, onToggle, busy }: { active: boolean; onToggle: () => void; busy?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={busy}
      aria-pressed={active}
      aria-label={active ? 'Remove from saved jobs' : 'Save job'}
      className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors', active ? 'border-primary/40 bg-primary-soft text-primary' : 'border-line text-ink-faint hover:text-ink')}
    >
      <motion.span key={String(active)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}>
        <Bookmark className={cn('size-4', active && 'fill-current')} />
      </motion.span>
    </motion.button>
  );
}

export function JobCard({ job, onOpen, onBookmark, footer, score }: { job: Job; onOpen?: () => void; onBookmark?: () => void; footer?: ReactNode; score?: number | null }) {
  const s = score ?? job.match?.score ?? null;
  return (
    <Card spotlight interactive className="flex h-full flex-col p-5">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <button onClick={onOpen} className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            <h3 className="line-clamp-2 text-[0.9375rem] leading-snug font-bold text-ink">{job.title}</h3>
          </button>
          <p className="mt-0.5 text-sm text-ink-muted">{job.company}</p>
        </div>
        <div className="relative z-10 flex items-start gap-2">
          {s !== null ? <ScoreRing score={s} size={46} stroke={4.5} /> : null}
          {onBookmark && <BookmarkButton active={!!job.bookmarked} onToggle={onBookmark} />}
        </div>
      </div>
      <JobMeta job={job} className="mt-3" />
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge tone={job.workMode === 'remote' ? 'cyan' : job.workMode === 'hybrid' ? 'violet' : 'neutral'}>{WORK_MODE_LABEL[job.workMode]}</Badge>
        {job.requiredSkills.slice(0, 4).map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
        {job.requiredSkills.length > 4 && <Badge>+{job.requiredSkills.length - 4}</Badge>}
      </div>
      {footer && <div className="relative z-10 mt-auto pt-5">{footer}</div>}
    </Card>
  );
}
