import { Mail, CheckCircle2, XCircle, Eye } from 'lucide-react';
import type { Applicant } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const statusTone: Record<string, 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'purple'> = {
  submitted: 'neutral',
  shortlisted: 'accent',
  rejected: 'danger',
};

interface ApplicantCardProps {
  applicant: Applicant;
  onView?: (id: string) => void;
  onShortlist?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
}

export function ApplicantCard({ applicant, onView, onShortlist, onReject, showActions = true }: ApplicantCardProps) {
  return (
    <div className="card p-5 transition hover:shadow-card">
      <div className="flex items-start gap-3">
        <Avatar name={applicant.name} size="md" />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-ink-800">{applicant.name}</h3>
            <Badge tone={statusTone[applicant.status]}>{applicant.status}</Badge>
          </div>
          <p className="text-sm text-ink-500">{applicant.department} · Batch {applicant.batch}</p>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-ink-400">
            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{applicant.email}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-ink-50 p-3 text-center">
        <div>
          <p className="text-lg font-bold text-ink-800">{applicant.department || 'N/A'}</p>
          <p className="text-[11px] text-ink-400">Department</p>
        </div>
        <div>
          <p className="text-lg font-bold text-brand-600">{applicant.matchScore}%</p>
          <p className="text-[11px] text-ink-400">Match</p>
        </div>
        <div>
          <p className="text-lg font-bold text-accent-600">{new Date(applicant.appliedAt).toLocaleDateString()}</p>
          <p className="text-[11px] text-ink-400">Applied</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {applicant.skills.slice(0, 4).map((s) => (
          <span key={s} className="chip bg-ink-100 text-ink-600">{s}</span>
        ))}
      </div>

      {showActions && (
        <div className="mt-4 flex items-center gap-2 border-t border-ink-100 pt-4">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onView?.(applicant.id)}>
            <Eye className="h-3.5 w-3.5" />View
          </Button>
          <Button size="sm" variant={applicant.shortlisted ? 'success' : 'outline'} className={cn(applicant.shortlisted && 'flex-1')} onClick={() => onShortlist?.(applicant.id)}>
            <CheckCircle2 className="h-3.5 w-3.5" />{applicant.shortlisted ? 'Shortlisted' : 'Shortlist'}
          </Button>
          <Button size="sm" variant={applicant.rejected ? 'danger' : 'ghost'} onClick={() => onReject?.(applicant.id)}>
            <XCircle className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
