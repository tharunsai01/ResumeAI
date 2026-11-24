# Design system

Source: `frontend/src/index.css` (tokens), `frontend/src/config/motion.ts` (motion), `frontend/src/components/ui/` (components).

## Principles

- **One bold moment.** The landing hero's match composition (a resume is scanned, skills are matched, a ring builds from four weighted arcs) is the signature element. Everything around it stays quiet.
- **Structure carries meaning.** Numbers mark real sequences only (How it works, processing stages). Colour marks score bands and statuses, always paired with text or an icon.
- **Show the real thing.** Hero and auth visuals use product UI with sample data labelled as such. Statistics are true product facts (4 components, 6 stages, 120+ skills, 50% skills weight), never invented customer numbers.

## Colour tokens

Components use semantic names. The theme switch swaps the variables.

| Token | Dark | Light | Use |
|---|---|---|---|
| `canvas` | `#080B16` | `#F6F7FB` | Page background |
| `surface` | `#111629` | `#FFFFFF` | Cards, inputs |
| `elevated` | `#171D33` | `#F0F2F8` | Tracks, hovers, nested areas |
| `ink` | `#F8FAFC` | `#0F172A` | Primary text |
| `ink-muted` | `#94A3B8` | `#475569` | Secondary text (about 7:1 on surface) |
| `ink-faint` | `#6B7A91` | `#7B879B` | Metadata only |
| `primary` | `#6366F1` | `#4F46E5` | Actions, active states, focus rings |
| `violet` | `#8B5CF6` | `#7C3AED` | Secondary accent, gradient partner |
| `cyan` | `#06B6D4` | `#0891B2` | AI activity: scanning line, orbit, data highlights |
| `success` / `warning` / `danger` | `#10B981` / `#F59E0B` / `#F43F5E` | `#059669` / `#B45309` / `#E11D48` | Strong / potential / low match, and status |

Light-mode primary and accents are a step darker so text keeps contrast on white.

## Typography

One family, **Manrope Variable**, self-hosted through `@fontsource-variable/manrope` (no third-party font requests). Personality comes from weight and size: 800 for display and page titles, 700 for card titles, 500 to 600 for UI, tabular numerals (`.tabular`) for every score and count.

| Token | Size | Line height | Tracking |
|---|---|---|---|
| `text-display` | clamp(2.5rem, 5.2vw + 0.6rem, 4.25rem) | 1.02 | -0.035em |
| `text-h1` | clamp(2rem, 2.4vw + 1.1rem, 2.75rem) | 1.08 | -0.03em |
| `text-h2` | clamp(1.5rem, 1vw + 1.1rem, 1.875rem) | 1.15 | -0.02em |
| `text-h3` | 1.25rem | 1.3 | -0.01em |
| body | 0.875 to 1.0625rem | 1.5 to 1.65 | normal |
| `text-caption` | 0.8125rem | 1.4 | normal |

Custom sizes are registered with `tailwind-merge` (in `utils/format.ts`) so `cn()` never mistakes `text-caption` for a colour.

## Surfaces and depth

- Radius: `--radius-card` 1.125rem, `--radius-control` 0.75rem; feature cards and the hero use larger radii for hierarchy.
- Shadows: `shadow-soft` at rest, `shadow-lifted` for raised and floating elements. Both use a tinted shadow colour per theme.
- Glass (`.glass`) only on the header, hero floating cards, toasts and the auth brand card.
- Backgrounds: the landing hero layers drifting blurred orbs, a radially masked grid, SVG noise, a canvas constellation and a cursor glow. Dashboards use corner light and a faint grid that fades out.

## Motion

All timings come from `config/motion.ts`.

| Token | Value |
|---|---|
| Durations | instant 0.12s, fast 0.18s, base 0.28s, slow 0.42s, deliberate 0.7s |
| Easing | out `[0.22, 1, 0.36, 1]`, inOut `[0.65, 0, 0.35, 1]` |
| Springs | snappy (420/32), gentle (220/26), layout (500/40) |
| Stagger | tight 0.04s, base 0.07s, loose 0.12s |
| Distances | entrance 14px, hover lift -3px, press scale 0.97 |

Reusable variants: `pageTransition`, `fadeUp`, `fadeIn`, `staggerChildren`, `popIn`, `drawerFromRight`, `backdrop`, and `revealOnce` for scroll reveals that play once.

Performance and accessibility:

- `MotionConfig reducedMotion="user"`, plus a CSS rule that neutralises animations under `prefers-reduced-motion`.
- Transform and opacity only. The cursor glow updates `transform` in `requestAnimationFrame`.
- Decorative CSS animation pauses when the tab is hidden (`html[data-hidden]`); the particle canvas stops its loop.
- Particles are lazy-loaded and skipped on low-power devices (4 or fewer cores, or data saver) and with reduced motion. Cursor effects are skipped on touch devices.

## Components

`Button` (primary, secondary, outline, ghost, danger; loading, success and disabled states), `ButtonLink`, `Input` (with password reveal), `Textarea`, `Select`, `Switch`, `TagInput`, `Field`, `Card` (optional spotlight border that follows the pointer), `CardHeader`, `Badge`, `Avatar`, `ProgressBar`, `ScoreRing`, `AnimatedNumber`, `StatCard`, `PageHeader`, `Tooltip`, `Tabs` (sliding indicator, arrow-key navigation), `Segmented`, `Dropdown` (arrow keys, Escape), `Pagination`, `DataTable` (table on desktop, stacked cards on phones), `Modal`, `Drawer`, `ConfirmDialog` (optional required reason), `Skeleton`, `SkeletonCard`, `SkeletonTable`, `DashboardSkeleton`, `EmptyState`, `ErrorState`, toasts via `useToast()`.

AI-specific: `AIProcessing` (document scan, orbit and real stage list with live region), `AIWorking`, `MatchBreakdown`, `ComponentBars`, `SkillChip`.

Dialogs and drawers trap focus, close on Escape, lock page scroll and return focus to the trigger.

## Accessibility checklist

- Skip link on every layout; landmarks for header, navigation and main.
- Visible focus outline on everything (`:focus-visible`).
- Labels for every form control; errors linked with `aria-describedby` and announced with `role="alert"`.
- Progress bars and score rings expose values (`role="progressbar"`, `aria-label`).
- Status and processing changes announced through `aria-live` regions.
- Score colours always come with a number and a text category.
- The Kanban board works with the keyboard (dnd-kit keyboard sensor) and through each card's "Move to" menu.
