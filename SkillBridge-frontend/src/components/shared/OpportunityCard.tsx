import { Link } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Users, Bookmark, CheckCircle2 } from 'lucide-react';
import type { Opportunity } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { daysLeft, timeAgo } from '@/lib/utils';
import { useState } from 'react';

const typeTones: Record<string, 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple'> = {
  Internship: 'brand',
  Job: 'success',
  Freelancing: 'accent',
  Research: 'purple',
  Competition: 'warning',
  Scholarship: 'danger',
  'Part-time': 'neutral',
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  view?: 'grid' | 'list';
  onSave?: (id: string) => void;
  showApply?: boolean;
}

export function OpportunityCard({ opportunity, view = 'grid', onSave, showApply = true }: OpportunityCardProps) {
  const [saved, setSaved] = useState(opportunity.saved);
  const tone = typeTones[opportunity.type] ?? 'neutral';

  const toggleSave = () => {
    setSaved(!saved);
    onSave?.(opportunity.id);
  };

  if (view === 'list') {
    return (
      <Link to={`/student/opportunities/${opportunity.id}`} className="card group block p-4 transition hover:shadow-card sm:p-5">
        <div className="flex items-start gap-4">
          <Avatar name={opportunity.company} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="truncate text-base font-semibold text-ink-800 group-hover:text-brand-700">{opportunity.title}</h3>
                <p className="mt-0.5 text-sm text-ink-500">{opportunity.company}</p>
              </div>
              <Badge tone={tone}>{opportunity.type}</Badge>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{opportunity.location}</span>
              <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{opportunity.experience}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{daysLeft(opportunity.deadline)}d left</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{opportunity.applicants} applied</span>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); toggleSave(); }}>
              <Bookmark className={`h-4 w-4 ${saved ? 'fill-brand-600 text-brand-600' : ''}`} />
            </Button>
            {showApply && <Button size="sm">{opportunity.applied ? 'Applied' : 'Apply'}</Button>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="card group flex flex-col p-5 transition hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/student/opportunities/${opportunity.id}`} className="flex items-center gap-3">
          <Avatar name={opportunity.company} size="md" />
          <div>
            <h3 className="text-base font-semibold text-ink-800 group-hover:text-brand-700">{opportunity.title}</h3>
            <p className="text-sm text-ink-500">{opportunity.company}</p>
          </div>
        </Link>
        <button onClick={toggleSave} className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-brand-600">
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-brand-600 text-brand-600' : ''}`} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone={tone}>{opportunity.type}</Badge>
        {opportunity.remote && <Badge tone="neutral">Remote</Badge>}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{opportunity.location}</span>
        <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{opportunity.experience}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {opportunity.skills.slice(0, 3).map((s) => (
          <span key={s} className="chip bg-ink-100 text-ink-600">{s}</span>
        ))}
        {opportunity.skills.length > 3 && <span className="chip bg-ink-100 text-ink-400">+{opportunity.skills.length - 3}</span>}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
        <div>
          <p className="text-sm font-semibold text-ink-700">{opportunity.stipend || opportunity.salary}</p>
          <p className="text-xs text-ink-400">{timeAgo(opportunity.postedAt)} · {daysLeft(opportunity.deadline)}d left</p>
        </div>
        <Link to={`/student/opportunities/${opportunity.id}`}>
          {opportunity.applied ? (
            <Button variant="secondary" size="sm"><CheckCircle2 className="h-3.5 w-3.5" />Applied</Button>
          ) : (
            <Button size="sm">View & Apply</Button>
          )}
        </Link>
      </div>
    </div>
  );
}
