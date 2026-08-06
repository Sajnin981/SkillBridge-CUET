import type { Skill } from '@/lib/types';
import { cn } from '@/lib/utils';

const levelTone = {
  Beginner: 'bg-ink-100 text-ink-600',
  Intermediate: 'bg-brand-50 text-brand-700',
  Advanced: 'bg-success-50 text-success-700',
};

export function SkillTags({ skills, size = 'md' }: { skills: (string | Skill)[]; size?: 'sm' | 'md' }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((s) => {
        const name = typeof s === 'string' ? s : s.name;
        const level = typeof s === 'string' ? undefined : s.level;
        return (
          <span key={name} className={cn('chip ring-1 ring-ink-200/60', level ? levelTone[level] : 'bg-ink-100 text-ink-600', size === 'sm' && 'text-[11px] px-2 py-0.5')}>
            {name}{level && <span className="opacity-60">·{level}</span>}
          </span>
        );
      })}
    </div>
  );
}
