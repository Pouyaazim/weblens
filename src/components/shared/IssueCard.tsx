import { useState } from 'react';
import type { CheckResult } from '@/types/analysis';
import { StatusBadge, SeverityBadge } from './Badges';
import { Button } from '../ui/Button';

/** کارت نمایش یک بررسی با شواهد و پیشنهاد اصلاح. */
export function IssueCard({ check, onExplain }: { check: CheckResult; onExplain?: (check: CheckResult) => void }) {
  const [open, setOpen] = useState(check.status === 'fail');
  return (
    <div className="rounded-2xl border border-line/80 bg-white/90 dark:border-slate-700/80 dark:bg-slate-900/70">
      <button
        className="flex w-full items-center justify-between gap-2 p-3.5 text-right"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          <StatusBadge status={check.status} />
          <span className="truncate font-bold">{check.title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <SeverityBadge severity={check.severity} />
          <span className="text-muted">{open ? '▴' : '▾'}</span>
        </span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-line/70 p-3.5 dark:border-slate-700/70">
          <p className="text-sm leading-7 text-ink-soft dark:text-slate-300">{check.description}</p>
          {check.evidence.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-extrabold text-muted">شواهد</h4>
              <ul className="space-y-1 rounded-xl bg-paper/80 p-2.5 dark:bg-slate-800/50">
                {check.evidence.map((e, i) => (
                  <li key={i} className="mono ltr break-all text-left text-xs leading-5 text-ink-soft dark:text-slate-300">{e}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-xl border border-teal/20 bg-teal/5 p-3 dark:bg-teal/10">
            <h4 className="mb-1 text-xs font-extrabold text-teal-deep dark:text-sea">پیشنهاد اصلاح</h4>
            <p className="text-sm leading-7">{check.recommendation}</p>
          </div>
          {onExplain && check.status !== 'pass' && (
            <Button variant="ghost" className="text-xs" onClick={() => onExplain(check)}>توضیح با هوش مصنوعی</Button>
          )}
        </div>
      )}
    </div>
  );
}
