import type { ReactNode } from 'react';
import { Button } from './Button';

export function Spinner({ label = 'در حال انجام...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14" role="status" aria-live="polite">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-teal/20 border-t-teal" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="wl-rise flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal/10 text-teal-deep" aria-hidden>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="text-lg font-extrabold tracking-tight">{title}</h3>
      {description && <p className="max-w-sm text-sm leading-7 text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="wl-rise flex flex-col items-center justify-center gap-3 py-14 text-center" role="alert">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 text-red-600" aria-hidden>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5" strokeLinecap="round" />
          <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <h3 className="text-lg font-extrabold text-red-600">تحلیل انجام نشد</h3>
      <p className="max-w-sm text-sm leading-7 text-muted">{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>تلاش دوباره</Button>}
    </div>
  );
}
