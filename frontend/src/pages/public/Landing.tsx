import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { AmbientBackground } from '@/components/effects/Backgrounds';
import { HeroVisual } from '@/components/landing/HeroVisual';
import { About, FactsStrip, Features, FinalCta, HowItWorks, Pipeline, Roles } from '@/components/landing/Sections';
import { ButtonLink } from '@/components/ui';
import { ease } from '@/config/motion';

const HEADLINE = ['Smarter', 'hiring', 'starts', 'with', 'better', 'matching.'];

function Hero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden pt-28 pb-24 sm:pt-36 lg:pt-40 lg:pb-32">
      <AmbientBackground />
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="max-w-[38rem]">
          <h1 className="text-display font-extrabold text-ink" aria-label={HEADLINE.join(' ')}>
            {HEADLINE.map((w, i) => (
              <motion.span
                key={w}
                aria-hidden
                className="mr-[0.22em] inline-block"
                initial={reduce ? false : { opacity: 0, y: '0.4em', filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, ease: ease.out, delay: 0.08 + i * 0.07 }}
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: ease.out, delay: 0.55 }} className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-muted text-pretty">
            Transform recruitment with intelligent resume analysis, explainable AI matching, and human-centered hiring workflows.
          </motion.p>
          <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: ease.out, delay: 0.7 }} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/register" size="lg">
              Get started free
            </ButtonLink>
            <ButtonLink to="/#product" size="lg" variant="secondary">
              Explore the platform
            </ButtonLink>
          </motion.div>
          <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95, duration: 0.6 }} className="mt-8 flex items-start gap-2.5 text-sm text-ink-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
            Every score shows its four parts. Recruiters make every hiring decision.
          </motion.p>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      <Hero />
      <FactsStrip />
      <Features />
      <HowItWorks />
      <Pipeline />
      <Roles />
      <About />
      <FinalCta />
    </>
  );
}
