import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Logo, SocialIcons, ThemeToggle } from '@/components/layout/Brand';
import { ButtonLink } from '@/components/ui';
import { duration, ease, spring } from '@/config/motion';
import { site } from '@/config/site';
import { homeFor, useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/format';

const LINKS = [
  { id: 'product', label: 'Product' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'about', label: 'About' },
];

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.2, 0.5] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);
  return active;
}

function PublicNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const onLanding = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(onLanding);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const href = (id: string) => (onLanding ? `#${id}` : `/#${id}`);

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300', scrolled || open ? 'glass border-b border-line' : 'border-b border-transparent')}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.id} className="relative">
              <a href={href(l.id)} className={cn('relative block rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors', active === l.id ? 'text-ink' : 'text-ink-muted hover:text-ink')}>
                {l.label}
                {active === l.id && <motion.span layoutId="nav-active" transition={spring.layout} className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[linear-gradient(90deg,var(--primary),var(--cyan))]" />}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <ButtonLink to={homeFor(user.role)} size="sm" className="hidden sm:inline-flex">
              Open dashboard
            </ButtonLink>
          ) : (
            <>
              <Link to="/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink-muted hover:text-ink sm:block">
                Log in
              </Link>
              <ButtonLink to="/register" size="sm" className="hidden sm:inline-flex">
                Get started
              </ButtonLink>
            </>
          )}
          <button onClick={() => setOpen((o) => !o)} className="flex size-10 items-center justify-center rounded-xl text-ink md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: duration.base, ease: ease.out } }}
            exit={{ height: 0, opacity: 0, transition: { duration: duration.fast } }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <motion.ul initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }} className="flex flex-col gap-1 px-5 py-4">
              {LINKS.map((l) => (
                <motion.li key={l.id} variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}>
                  <a href={href(l.id)} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-base font-semibold text-ink hover:bg-elevated">
                    {l.label}
                  </a>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mt-2 grid grid-cols-2 gap-2">
                {user ? (
                  <ButtonLink to={homeFor(user.role)} className="col-span-2">
                    Open dashboard
                  </ButtonLink>
                ) : (
                  <>
                    <ButtonLink to="/login" variant="secondary">
                      Log in
                    </ButtonLink>
                    <ButtonLink to="/register">Get started</ButtonLink>
                  </>
                )}
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  const share = encodeURIComponent(site.url || 'https://hiresmart.ai');
  const groups = [
    { title: 'Product', links: [{ label: 'Features', to: '/#features' }, { label: 'How it works', to: '/#how-it-works' }, { label: 'Matching formula', to: '/#product' }] },
    { title: 'Resources', links: [{ label: 'Documentation', to: '/docs' }, { label: 'Contact', to: '/contact' }] },
    { title: 'Legal', links: [{ label: 'Privacy', to: '/privacy' }, { label: 'Terms', to: '/terms' }] },
  ];
  return (
    <footer className="relative border-t border-line bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">Explainable resume screening and job matching. AI ranks and explains; people decide.</p>
          <div className="mt-5 flex gap-2">
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${share}`} target="_blank" rel="noreferrer noopener" className="flex size-9 items-center justify-center rounded-xl border border-line text-ink-muted hover:text-ink" aria-label="Share HireSmart AI on LinkedIn">
              {SocialIcons.linkedin}
            </a>
            <a href={`https://x.com/intent/post?url=${share}&text=${encodeURIComponent('Explainable AI resume matching')}`} target="_blank" rel="noreferrer noopener" className="flex size-9 items-center justify-center rounded-xl border border-line text-ink-muted hover:text-ink" aria-label="Share HireSmart AI on X">
              {SocialIcons.x}
            </a>
            {site.githubUrl && (
              <a href={site.githubUrl} target="_blank" rel="noreferrer noopener" className="flex size-9 items-center justify-center rounded-xl border border-line text-ink-muted hover:text-ink" aria-label="HireSmart AI on GitHub">
                {SocialIcons.github}
              </a>
            )}
          </div>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="text-sm font-bold text-ink">{g.title}</h2>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-ink-muted transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-7xl px-5 py-6 text-caption text-ink-faint sm:px-8">© {new Date().getFullYear()} HireSmart AI. Match scores assist recruiters and never make hiring decisions on their own.</p>
      </div>
    </footer>
  );
}

export default function PublicLayout() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60);
    else window.scrollTo(0, 0);
  }, [hash, pathname]);
  return (
    <div className="relative flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold">
        Skip to content
      </a>
      <PublicNav />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
