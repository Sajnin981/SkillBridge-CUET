import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple';

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 ring-brand-200/60',
  accent: 'bg-accent-50 text-accent-700 ring-accent-200/60',
  success: 'bg-success-50 text-success-700 ring-success-200/60',
  warning: 'bg-warning-50 text-warning-700 ring-warning-200/60',
  danger: 'bg-danger-50 text-danger-700 ring-danger-200/60',
  neutral: 'bg-ink-100 text-ink-600 ring-ink-200/60',
  purple: 'bg-violet-50 text-violet-700 ring-violet-200/60',
};

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={cn('chip ring-1', tones[tone], className)}>{children}</span>;
}
