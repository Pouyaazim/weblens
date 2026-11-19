import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line/80 bg-white/90 p-4 dark:border-slate-700/80 dark:bg-slate-900/70 ${className}`}>
      {children}
    </div>
  );
}
