import { useReducedMotion } from 'framer-motion';
import { lazy, Suspense, useEffect, useRef } from 'react';
import { useFinePointer, useLowPower } from '@/hooks';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/format';

const ParticleField = lazy(() => import('./ParticleField'));

/** Soft light that follows the cursor. Transform-only updates; skipped on touch devices. */
function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!fine || reduce) return;
    let frame = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;
    let tx = x;
    let ty = y;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      if (ref.current) ref.current.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, [fine, reduce]);
  if (!fine || reduce) return null;
  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 z-0 size-[600px] rounded-full opacity-[var(--glow-strength)] will-change-transform"
      style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--primary) 30%, transparent) 0%, transparent 60%)' }}
      aria-hidden
    />
  );
}

/** Landing page hero background: orbs, masked grid, noise, particles and cursor light. */
export function AmbientBackground({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const low = useLowPower();
  const { resolved } = useTheme();
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden noise', className)} aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_70%_-10%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_70%)]" />
      <div className="animate-drift absolute -top-40 -left-32 size-[38rem] rounded-full bg-primary opacity-[0.16] blur-[120px] dark:opacity-25" />
      <div className="animate-drift absolute top-20 right-[-12rem] size-[34rem] rounded-full bg-violet opacity-[0.14] blur-[120px] [animation-delay:-8s] dark:opacity-20" />
      <div className="animate-drift absolute top-[28rem] left-1/3 size-[26rem] rounded-full bg-cyan opacity-[0.1] blur-[110px] [animation-delay:-15s] dark:opacity-[0.14]" />
      <div className="bg-grid mask-radial absolute inset-0 opacity-70" />
      {!reduce && !low && (
        <Suspense fallback={null}>
          <ParticleField color={resolved === 'dark' ? '165, 170, 255' : '79, 70, 229'} />
        </Suspense>
      )}
      <CursorGlow />
    </div>
  );
}

/** Quiet background for signed-in pages: corner light and a faint grid that fades out. */
export function DashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-canvas" />
      <div className="absolute -top-48 right-[-10rem] size-[36rem] rounded-full bg-primary opacity-[0.07] blur-[120px] dark:opacity-[0.12]" />
      <div className="animate-drift absolute bottom-[-14rem] left-[-8rem] size-[30rem] rounded-full bg-cyan opacity-[0.05] blur-[120px] dark:opacity-[0.08]" />
      <div className="bg-grid absolute inset-x-0 top-0 h-72 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
    </div>
  );
}
