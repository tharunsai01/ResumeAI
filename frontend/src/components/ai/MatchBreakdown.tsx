import { motion } from 'framer-motion';
import { CheckCircle2, CircleDashed, GitBranch, Lightbulb, ShieldCheck, TrendingUp, XCircle } from 'lucide-react';
import { duration, ease } from '@/config/motion';
import type { MatchResult, SkillRow } from '@/types';
import { categoryTone, cn, formatDateTime } from '@/utils/format';
import { Badge, Card, ScoreRing, Tooltip } from '../ui';

export const WEIGHTS = { skills: 0.5, experience: 0.2, education: 0.1, role: 0.2 } as const;
const LABELS = { skills: 'Skills', experience: 'Experience', education: 'Education', role: 'Role fit' } as const;
const HELP = {
  skills: 'Required skills count 80%, preferred 20%. Exact and alias matches earn full credit, related skills half.',
  experience: 'Total years against the minimum, with extra weight on roles similar to this one.',
  education: 'Compared with the stated requirement. Missing optional education is not penalised.',
  role: 'Semantic similarity between your titles and skills and this role (MiniLM embeddings).',
};

export function ComponentBars({ components, compact }: { components: MatchResult['components']; compact?: boolean }) {
  return (
    <div className={cn('space-y-4', compact && 'space-y-3')}>
      {(Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).map((k, i) => {
        const value = components[k] ?? 0;
        const contribution = value * WEIGHTS[k];
        return (
          <div key={k}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <Tooltip content={HELP[k]}>
                <span tabIndex={0} className="cursor-help font-semibold text-ink underline decoration-line-strong decoration-dotted underline-offset-4">
                  {LABELS[k]}
                  <span className="ml-1.5 font-medium text-ink-faint">{WEIGHTS[k] * 100}%</span>
                </span>
              </Tooltip>
              <span className="tabular text-ink-muted">
                <span className="font-bold text-ink">{value.toFixed(0)}</span>
                {!compact && <span className="text-caption"> (adds {contribution.toFixed(1)})</span>}
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-elevated" role="progressbar" aria-label={`${LABELS[k]} score`} aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--primary),var(--cyan))]"
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: duration.deliberate, ease: ease.out, delay: i * 0.08 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const CHIP = {
  exact: { cls: 'bg-success-soft text-success', icon: CheckCircle2, label: 'Exact match' },
  alias: { cls: 'bg-success-soft text-success', icon: CheckCircle2, label: 'Matched by alias' },
  related: { cls: 'bg-warning-soft text-warning', icon: GitBranch, label: 'Related skill' },
  missing: { cls: 'bg-danger-soft text-danger', icon: XCircle, label: 'Missing' },
};

export function SkillChip({ row }: { row: SkillRow }) {
  const c = CHIP[row.match_type];
  const Icon = c.icon;
  const via = row.match_type === 'alias' || row.match_type === 'related' ? ` (you listed ${row.candidate_skill})` : '';
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[0.8125rem] font-semibold', c.cls)} title={`${c.label}${via}`}>
      <Icon className="size-3.5" aria-hidden />
      {row.skill}
      {row.match_type === 'related' && <span className="font-medium opacity-80">via {row.candidate_skill}</span>}
      {!row.required && <span className="font-medium opacity-70">(preferred)</span>}
      <span className="sr-only">: {c.label}{via}</span>
    </span>
  );
}

export function MatchBreakdown({ match, audience = 'candidate' }: { match: MatchResult; audience?: 'candidate' | 'recruiter' }) {
  const you = audience === 'candidate';
  return (
    <div className="space-y-5">
      <Card className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
        <div className="flex flex-col items-center gap-3 md:pr-6">
          <ScoreRing score={match.overallScore} size={148} stroke={11} />
          <Badge tone={categoryTone(match.category)} dot>
            {match.category}
          </Badge>
        </div>
        <div>
          <ComponentBars components={match.components} />
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-ink-faint">
            {match.validated && (
              <span className="inline-flex items-center gap-1.5 font-semibold text-success">
                <ShieldCheck className="size-4" aria-hidden /> Checked against the official 50/20/10/20 formula
              </span>
            )}
            <span>Model {match.modelVersion}</span>
            <span>Semantic engine: {match.embeddingBackend === 'tfidf-fallback' ? 'TF-IDF fallback' : match.embeddingBackend}</span>
            <span>Updated {formatDateTime(match.computedAt)}</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-[0.9375rem] font-bold text-ink">
            <CheckCircle2 className="size-4 text-success" aria-hidden /> Matched skills
            <span className="tabular text-ink-faint">{match.matchedSkills.length}</span>
          </h3>
          {match.matchedSkills.length ? (
            <div className="flex flex-wrap gap-2">{match.matchedSkills.map((r) => <SkillChip key={r.skill} row={r} />)}</div>
          ) : (
            <p className="text-sm text-ink-muted">No direct skill matches yet.</p>
          )}
          {match.relatedSkills.length > 0 && (
            <>
              <h4 className="mt-5 mb-2 text-sm font-bold text-ink">Related, partial credit</h4>
              <div className="flex flex-wrap gap-2">{match.relatedSkills.map((r) => <SkillChip key={r.skill} row={r} />)}</div>
            </>
          )}
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-[0.9375rem] font-bold text-ink">
            <CircleDashed className="size-4 text-danger" aria-hidden /> Missing skills
            <span className="tabular text-ink-faint">{match.missingSkills.length}</span>
          </h3>
          {match.missingSkills.length ? (
            <div className="flex flex-wrap gap-2">{match.missingSkills.map((r) => <SkillChip key={r.skill} row={r} />)}</div>
          ) : (
            <p className="text-sm text-ink-muted">{you ? 'You cover every skill this job lists.' : 'The candidate covers every listed skill.'}</p>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 text-[0.9375rem] font-bold text-ink">
            <TrendingUp className="size-4 text-primary" aria-hidden /> Strengths
          </h3>
          <ul className="space-y-2 text-sm text-ink-muted">
            {match.strengths.length ? match.strengths.map((s) => <li key={s} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-success" />{s}</li>) : <li>No standout strengths for this role yet.</li>}
          </ul>
          <h3 className="mt-5 mb-3 text-[0.9375rem] font-bold text-ink">Potential gaps</h3>
          <ul className="space-y-2 text-sm text-ink-muted">
            {match.gaps.length ? match.gaps.map((s) => <li key={s} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-warning" />{s}</li>) : <li>No notable gaps.</li>}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 text-[0.9375rem] font-bold text-ink">How this score was built</h3>
          <p className="text-sm leading-relaxed text-ink-muted">{match.explanation}</p>
          {match.narrative && (
            <p className="mt-3 rounded-xl border border-line bg-elevated/60 p-3 text-sm leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink">AI summary: </span>
              {match.narrative}
            </p>
          )}
          {match.recommendations.length > 0 && (
            <>
              <h3 className="mt-5 mb-3 flex items-center gap-2 text-[0.9375rem] font-bold text-ink">
                <Lightbulb className="size-4 text-warning" aria-hidden /> {you ? 'What would raise this score' : 'Development areas'}
              </h3>
              <ul className="space-y-2 text-sm text-ink-muted">
                {match.recommendations.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-5 text-caption text-ink-faint">AI scores support people's decisions. A recruiter reviews every application; no one is hired or rejected automatically.</p>
        </Card>
      </div>
    </div>
  );
}
