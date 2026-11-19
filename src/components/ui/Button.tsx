import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: ReactNode;
}

const VARIANTS = {
  primary: 'bg-ink text-white hover:bg-teal-deep disabled:opacity-45',
  secondary: 'bg-white text-ink-soft border border-line hover:border-teal hover:text-teal-deep dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 disabled:opacity-45',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-45',
  ghost: 'text-ink-soft hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-45',
};

export function Button({ variant = 'primary', children, className = '', ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
