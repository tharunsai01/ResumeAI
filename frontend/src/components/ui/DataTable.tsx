import type { ReactNode } from 'react';
import { cn } from '@/utils/format';
import { Card } from './Display';

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Hidden in the stacked mobile layout */
  hideOnMobile?: boolean;
  /** Shown as the title line in the mobile card */
  primary?: boolean;
}

/**
 * Table on medium screens and up; on phones each row becomes a stacked card,
 * so nothing requires horizontal scrolling.
 */
export function DataTable<T>({ columns, rows, rowKey, onRowClick, caption, empty }: { columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; onRowClick?: (r: T) => void; caption: string; empty?: ReactNode }) {
  if (!rows.length && empty) return <>{empty}</>;
  return (
    <Card className="overflow-hidden">
      <table className="hidden w-full text-left text-sm md:table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-elevated/60">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn('px-5 py-3 text-caption font-semibold text-ink-muted', c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={rowKey(r)}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              onKeyDown={onRowClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onRowClick(r)) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={cn('border-b border-line last:border-0', onRowClick && 'cursor-pointer transition-colors hover:bg-elevated/70 focus-visible:bg-elevated/70')}
            >
              {columns.map((c) => (
                <td key={c.key} className={cn('px-5 py-3.5 align-middle text-ink', c.className)}>
                  {c.cell(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="divide-y divide-line md:hidden">
        {rows.map((r) => (
          <li key={rowKey(r)}>
            <div
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              className={cn('flex flex-col gap-2 px-4 py-4', onRowClick && 'active:bg-elevated')}
            >
              {columns
                .filter((c) => !c.hideOnMobile)
                .map((c) =>
                  c.primary ? (
                    <div key={c.key}>{c.cell(r)}</div>
                  ) : (
                    <div key={c.key} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-caption text-ink-faint">{c.header}</span>
                      <span className="text-right">{c.cell(r)}</span>
                    </div>
                  ),
                )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
