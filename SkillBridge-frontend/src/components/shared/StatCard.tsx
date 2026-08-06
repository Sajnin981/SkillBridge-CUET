import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; up: boolean };
  tone?: 'brand' | 'accent' | 'success' | 'warning' | 'danger';
}

const tones = {
  brand: 'bg-brand-50 text-brand-600',
  accent: 'bg-accent-50 text-accent-600',
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  danger: 'bg-danger-50 text-danger-600',
};

export function StatCard({ label, value, icon, trend, tone = 'brand' }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', tones[tone])}>{icon}</div>
        {trend && (
          <span className={cn('chip text-xs font-semibold', trend.up ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600')}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-ink-800">{value}</p>
      <p className="text-sm text-ink-500">{label}</p>
    </div>
  );
}
