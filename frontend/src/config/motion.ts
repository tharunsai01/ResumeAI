/**
 * Motion tokens. Every animation in the app pulls from here so timing and
 * easing stay consistent. Durations are in seconds (Framer Motion units).
 */
import type { Transition, Variants } from 'framer-motion';

export const duration = { instant: 0.12, fast: 0.18, base: 0.28, slow: 0.42, deliberate: 0.7 } as const;
export const ease = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  in: [0.4, 0, 1, 1] as [number, number, number, number],
};
export const spring = {
  snappy: { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 } as Transition,
  gentle: { type: 'spring', stiffness: 220, damping: 26 } as Transition,
  layout: { type: 'spring', stiffness: 500, damping: 40 } as Transition,
};
export const stagger = { tight: 0.04, base: 0.07, loose: 0.12 } as const;
export const distance = { entrance: 14, hoverLift: -3 } as const;
export const scale = { hover: 1.015, press: 0.97 } as const;

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, y: -6, transition: { duration: duration.fast, ease: ease.in } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: distance.entrance },
  show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base, ease: ease.out } },
};

export const staggerChildren = (each: number = stagger.base, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: each, delayChildren: delay } },
});

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 6 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring.snappy },
  exit: { opacity: 0, scale: 0.97, y: 4, transition: { duration: duration.fast, ease: ease.in } },
};

export const drawerFromRight: Variants = {
  hidden: { x: '100%' },
  show: { x: 0, transition: { type: 'spring', stiffness: 380, damping: 38 } },
  exit: { x: '100%', transition: { duration: duration.base, ease: ease.in } },
};

export const backdrop: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.base } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
};

/** Scroll reveals run once, so content doesn't re-animate when scrolling back up. */
export const revealOnce = { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.25 } } as const;
