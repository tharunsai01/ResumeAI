import { useEffect, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '@/context/ThemeContext';

/** SVG attributes cannot read CSS variables reliably, so resolve them per theme. */
export function useChartColors() {
  const { resolved } = useTheme();
  const read = () => {
    const s = getComputedStyle(document.documentElement);
    const v = (n: string) => s.getPropertyValue(n).trim();
    return {
      primary: v('--primary'),
      violet: v('--violet'),
      cyan: v('--cyan'),
      success: v('--success'),
      warning: v('--warning'),
      danger: v('--danger'),
      ink: v('--ink'),
      muted: v('--ink-muted'),
      faint: v('--ink-faint'),
      line: v('--line'),
      surface: v('--surface'),
    };
  };
  const [colors, setColors] = useState(read);
  useEffect(() => {
    const t = requestAnimationFrame(() => setColors(read()));
    return () => cancelAnimationFrame(t);
  }, [resolved]);
  return colors;
}

function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { name?: string; value?: number; color?: string }[]; label?: string; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line-strong bg-surface px-3 py-2 text-xs shadow-lifted">
      {label && <p className="mb-1 font-semibold text-ink">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-ink-muted">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="tabular font-semibold text-ink">{p.value}{unit}</span>
        </p>
      ))}
    </div>
  );
}

const shortDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' });

export function TimelineChart({ data, series, height = 240, xFormat = shortDate }: { data: Record<string, number | string>[]; series: { key: string; name: string; color?: 'primary' | 'cyan' | 'violet' }[]; height?: number; xFormat?: (v: string) => string }) {
  const c = useChartColors();
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c[s.color ?? 'primary']} stopOpacity={0.35} />
                <stop offset="100%" stopColor={c[s.color ?? 'primary']} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={c.line} vertical={false} />
          <XAxis dataKey="date" tickFormatter={xFormat} tick={{ fill: c.faint, fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis allowDecimals={false} tick={{ fill: c.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} labelFormatter={(l) => xFormat(String(l))} cursor={{ stroke: c.line }} />
          {series.map((s) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={c[s.color ?? 'primary']} strokeWidth={2} fill={`url(#grad-${s.key})`} animationDuration={900} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarsChart({ data, xKey, yKey, name, height = 220, horizontal, tone = 'primary' }: { data: Record<string, number | string>[]; xKey: string; yKey: string; name: string; height?: number; horizontal?: boolean; tone?: 'primary' | 'cyan' | 'violet' }) {
  const c = useChartColors();
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 12, left: horizontal ? 8 : -18, bottom: 0 }}>
          <CartesianGrid stroke={c.line} horizontal={!horizontal} vertical={!!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" allowDecimals={false} tick={{ fill: c.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey={xKey} width={130} tick={{ fill: c.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} tick={{ fill: c.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: c.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
            </>
          )}
          <Tooltip content={<ChartTooltip />} cursor={{ fill: c.line }} />
          <Bar dataKey={yKey} name={name} fill={c[tone]} radius={horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]} maxBarSize={36} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data, height = 200, centerLabel }: { data: { name: string; value: number; tone?: 'primary' | 'cyan' | 'violet' | 'success' | 'warning' | 'danger' | 'faint' }[]; height?: number; centerLabel?: string }) {
  const c = useChartColors();
  const total = data.reduce((a, d) => a + d.value, 0);
  const palette = ['primary', 'cyan', 'violet', 'success', 'warning', 'danger', 'faint'] as const;
  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={total ? data : [{ name: 'None', value: 1 }]} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="92%" paddingAngle={total ? 2 : 0} stroke="none" animationDuration={800}>
            {(total ? data : [{ name: 'None', value: 1 }]).map((d, i) => (
              <Cell key={i} fill={total ? c[(d as { tone?: (typeof palette)[number] }).tone ?? palette[i % palette.length]] : c.line} />
            ))}
          </Pie>
          {total > 0 && <Tooltip content={<ChartTooltip />} />}
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-2xl font-extrabold text-ink">{total}</span>
        {centerLabel && <span className="text-caption text-ink-faint">{centerLabel}</span>}
      </div>
    </div>
  );
}

/** Pipeline funnel as proportional horizontal bars (readable and accessible). */
export function Funnel({ stages }: { stages: { stage: string; count: number }[] }) {
  const max = Math.max(1, ...stages.map((s) => s.count));
  return (
    <ol className="space-y-2.5">
      {stages.map((s, i) => (
        <li key={s.stage} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 text-sm">
          <span className="font-medium text-ink-muted capitalize">{s.stage}</span>
          <span className="h-7 overflow-hidden rounded-lg bg-elevated">
            <span
              className="block h-full rounded-lg bg-[linear-gradient(90deg,var(--primary),var(--violet))] transition-[width] duration-700"
              style={{ width: `${Math.max(s.count ? 6 : 0, (s.count / max) * 100)}%`, opacity: 1 - i * 0.12 }}
            />
          </span>
          <span className="tabular text-right font-bold text-ink">{s.count}</span>
        </li>
      ))}
    </ol>
  );
}
