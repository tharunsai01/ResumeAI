import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { Check, GitBranch, RotateCcw, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ease, spring } from '@/config/motion';
import { cn } from '@/utils/format';

/*
 * Sample data shown in the hero. The numbers follow the real formula:
 * skills 90 (4/4 required, Kubernetes related via Docker) x .5 = 45
 * experience 100 x .2 = 20, education 100 x .1 = 10, role 84 x .2 = 16.8 => 91.8
 */
const EXTRACTED = ['ReactJS', 'TypeScript', 'Node.js', 'MongoDB', 'Docker'];
const REQUIREMENTS: { skill: string; kind: 'alias' | 'exact' | 'related'; via?: string; preferred?: boolean }[] = [
  { skill: 'React', kind: 'alias', via: 'ReactJS' },
  { skill: 'Node.js', kind: 'exact' },
  { skill: 'TypeScript', kind: 'exact' },
  { skill: 'MongoDB', kind: 'exact' },
  { skill: 'Kubernetes', kind: 'related', via: 'Docker', preferred: true },
];
const COMPONENTS = [
  { key: 'Skills', weight: 0.5, score: 90, color: 'var(--primary)' },
  { key: 'Experience', weight: 0.2, score: 100, color: 'var(--violet)' },
  { key: 'Education', weight: 0.1, score: 100, color: 'var(--cyan)' },
  { key: 'Role fit', weight: 0.2, score: 84, color: '#a5b4fc' },
];
const OVERALL = 91.8;

function WeightedRing({ play }: { play: boolean }) {
  const r = 48;
  const C = 2 * Math.PI * r;
  const gap = 3.5;
  let offset = 0;
  return (
    <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
      {COMPONENTS.map((c, i) => {
        const start = offset;
        const len = c.weight * C - gap;
        offset += c.weight * C;
        const fill = (len * c.score) / 100;
        return (
          <g key={c.key}>
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--elevated)" strokeWidth="9" strokeDasharray={`${len} ${C}`} strokeDashoffset={-start} />
            <motion.circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={c.color}
              strokeWidth="9"
              strokeLinecap="butt"
              strokeDashoffset={-start}
              initial={{ strokeDasharray: `0 ${C}` }}
              animate={{ strokeDasharray: play ? `${fill} ${C}` : `0 ${C}` }}
              transition={{ duration: 0.9, ease: ease.out, delay: play ? i * 0.18 : 0 }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function Counter({ to, play }: { to: number; play: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!play) {
      setV(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1300);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, play]);
  return <>{Math.round(v)}</>;
}

export function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    if (reduce) {
      setPhase(4);
      return;
    }
    setPhase(0);
    timers.current = [setTimeout(() => setPhase(1), 350), setTimeout(() => setPhase(2), 1800), setTimeout(() => setPhase(3), 2900), setTimeout(() => setPhase(4), 4100)];
  }, [reduce]);

  useEffect(() => {
    if (inView) play();
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, [inView, play]);

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[36rem] lg:max-w-none">
      <p className="sr-only">Sample match using sample data: a resume is scanned, its skills are compared with a job, and a score of 92 out of 100 is built from skills 90, experience 100, education 100 and role fit 84.</p>
      <div aria-hidden="true">
      <div className="relative grid gap-4 sm:grid-cols-[1fr_1fr] sm:gap-5">
        {/* Resume */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: ease.out }} className="glass relative overflow-hidden rounded-3xl border border-line-strong p-5 shadow-lifted">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-muted">Resume</span>
            <span className="rounded-full border border-line px-2 py-0.5 text-[0.6875rem] font-semibold text-ink-faint">Sample data</span>
          </div>
          <p className="mt-3 text-[0.9375rem] font-bold text-ink">Alex M.</p>
          <p className="text-xs text-ink-muted">Full-stack engineer, 6 years</p>
          <div className="mt-4 space-y-1.5">
            {[92, 76, 84, 58, 70].map((w, i) => (
              <div key={i} className={cn('h-1.5 rounded-full transition-colors duration-700', phase >= 2 ? 'bg-primary/35' : 'bg-elevated')} style={{ width: `${w}%`, transitionDelay: `${i * 80}ms` }} />
            ))}
          </div>
          <div className="mt-4 flex min-h-[3.75rem] flex-wrap content-start gap-1.5">
            <AnimatePresence>
              {phase >= 2 &&
                EXTRACTED.map((s, i) => (
                  <motion.span key={s} initial={{ opacity: 0, scale: 0.8, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0, transition: { ...spring.snappy, delay: i * 0.12 } }} className="rounded-lg bg-primary-soft px-2 py-1 text-[0.75rem] font-semibold text-primary">
                    {s}
                  </motion.span>
                ))}
            </AnimatePresence>
          </div>
          {phase === 1 && (
            <motion.div initial={{ top: '-15%' }} animate={{ top: '100%' }} transition={{ duration: 1.4, ease: ease.inOut }} className="pointer-events-none absolute inset-x-0 h-14 bg-gradient-to-b from-transparent via-cyan/20 to-transparent">
              <div className="absolute inset-x-0 top-1/2 h-px bg-cyan shadow-[0_0_14px_var(--cyan)]" />
            </motion.div>
          )}
        </motion.div>

        {/* Job requirements */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: ease.out, delay: 0.12 }} className="glass rounded-3xl border border-line-strong p-5 shadow-lifted sm:mt-10">
          <span className="text-xs font-semibold text-ink-muted">Job</span>
          <p className="mt-3 text-[0.9375rem] font-bold text-ink">Senior Full-Stack Engineer</p>
          <p className="text-xs text-ink-muted">5+ years, bachelor's preferred</p>
          <ul className="mt-4 space-y-1.5">
            {REQUIREMENTS.map((r, i) => {
              const shown = phase >= 3;
              return (
                <li key={r.skill} className="flex items-center justify-between gap-2 text-[0.8125rem]">
                  <span className={cn('font-semibold', r.preferred ? 'text-ink-muted' : 'text-ink')}>
                    {r.skill}
                    {r.preferred && <span className="ml-1 font-medium text-ink-faint">preferred</span>}
                  </span>
                  <AnimatePresence>
                    {shown && (
                      <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.16, duration: 0.3 } }} className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[0.6875rem] font-bold', r.kind === 'related' ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success')}>
                        {r.kind === 'related' ? <GitBranch className="size-3" /> : <Check className="size-3" />}
                        {r.kind === 'alias' ? `alias of ${r.via}` : r.kind === 'related' ? `via ${r.via}` : 'exact'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>

      {/* Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: ease.out, delay: 0.24 }} className="glass relative z-10 mt-4 grid max-w-md grid-cols-[7.5rem_1fr] items-center gap-5 rounded-3xl border border-line-strong p-5 shadow-lifted sm:mt-5 sm:ml-10">
        <div className="relative size-[7.5rem]">
          <WeightedRing play={phase >= 4} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="tabular text-[2rem] leading-none font-extrabold text-ink">
              <Counter to={OVERALL} play={phase >= 4} />
            </span>
            <span className="mt-1 text-[0.6875rem] font-semibold text-ink-faint">of 100</span>
          </div>
        </div>
        <div>
          <p className={cn('text-sm font-bold transition-colors duration-500', phase >= 4 ? 'text-success' : 'text-ink-faint')}>{phase >= 4 ? 'Strong match' : 'Scoring...'}</p>
          <ul className="mt-2 space-y-1">
            {COMPONENTS.map((c) => (
              <li key={c.key} className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-ink-muted">
                  <span className="size-2 rounded-full" style={{ background: c.color }} />
                  {c.key} <span className="text-ink-faint">{c.weight * 100}%</span>
                </span>
                <span className="tabular font-bold text-ink">{phase >= 4 ? c.score : '–'}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Floating notes */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={phase >= 1 ? { opacity: 1, scale: 1 } : {}} transition={spring.gentle} className="glass absolute -top-5 right-2 hidden items-center gap-2 rounded-2xl border border-line-strong px-3 py-2 text-xs font-semibold text-ink shadow-lifted sm:flex lg:-right-4">
        <ShieldCheck className="size-4 text-success" aria-hidden /> Hidden-text check: clean
      </motion.div>
      </div>
      <button onClick={play} className="absolute right-0 -bottom-10 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-ink-faint transition-colors hover:text-ink" aria-label="Replay the sample match animation">
        <RotateCcw className="size-3.5" /> Replay
      </button>
    </div>
  );
}
