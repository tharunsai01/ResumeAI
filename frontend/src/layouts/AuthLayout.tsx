import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { Logo, ThemeToggle } from '@/components/layout/Brand';
import { ease } from '@/config/motion';

function BrandPanel() {
  const parts = [
    ['Skills', 90, 'var(--primary)'],
    ['Experience', 100, 'var(--violet)'],
    ['Education', 100, 'var(--cyan)'],
    ['Role fit', 84, '#a5b4fc'],
  ] as const;
  return (
    <div className="noise relative hidden overflow-hidden bg-[#0a0e1f] lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="animate-drift absolute -top-32 -left-24 size-[34rem] rounded-full bg-[#6366F1] opacity-35 blur-[120px]" aria-hidden />
      <div className="animate-drift absolute right-[-10rem] bottom-[-8rem] size-[30rem] rounded-full bg-[#06B6D4] opacity-20 blur-[120px] [animation-delay:-11s]" aria-hidden />
      <div className="bg-grid absolute inset-0 opacity-40 [--line:rgba(148,163,184,0.1)] [mask-image:radial-gradient(ellipse_at_40%_40%,black,transparent_75%)]" aria-hidden />

      <div className="relative">
        <p className="max-w-md text-[2rem] leading-tight font-extrabold tracking-tight text-white">A match score you can read, not just a number.</p>
        <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-slate-300">Every result splits into four weighted parts with the reasons behind them, for candidates and recruiters alike.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: ease.out, delay: 0.2 }} className="relative max-w-sm rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Senior Full-Stack Engineer</p>
            <p className="text-xs text-slate-400">Sample data</p>
          </div>
          <span className="tabular text-3xl font-extrabold text-white">92</span>
        </div>
        <ul className="mt-5 space-y-3">
          {parts.map(([k, v, c], i) => (
            <li key={k} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3 text-xs">
              <span className="font-semibold text-slate-300">{k}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.span className="block h-full rounded-full" style={{ background: c }} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 1, ease: ease.out, delay: 0.5 + i * 0.12 }} />
              </span>
              <span className="tabular text-right font-bold text-white">{v}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      <ul className="relative space-y-2.5 text-sm text-slate-300">
        <li className="flex items-center gap-2.5">
          <Check className="size-4 text-[#10B981]" aria-hidden /> New accounts start empty: nothing is filled in for you
        </li>
        <li className="flex items-center gap-2.5">
          <ShieldCheck className="size-4 text-[#10B981]" aria-hidden /> Passwords are hashed; sessions rotate automatically
        </li>
      </ul>
    </div>
  );
}

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <main id="main" className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[26rem]">
            <Outlet />
          </div>
        </main>
      </div>
      <BrandPanel />
    </div>
  );
}
