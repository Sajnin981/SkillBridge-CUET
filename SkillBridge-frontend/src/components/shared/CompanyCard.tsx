import { Link } from 'react-router-dom';
import { MapPin, Briefcase, CheckCircle2, Clock } from 'lucide-react';
import type { Company } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export function CompanyCard({ company }: { company: Company }) {
  return (
    <div className="card group flex flex-col p-5 transition hover:shadow-card">
      <div className="flex items-start gap-3">
        <Avatar name={company.name} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-ink-800 group-hover:text-brand-700">{company.name}</h3>
            {company.status === 'verified' && <CheckCircle2 className="h-4 w-4 text-brand-500" />}
          </div>
          <p className="text-sm text-ink-500">{company.industry}</p>
          <div className="mt-1 flex items-center gap-3 text-xs text-ink-400">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.location}</span>
            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{company.size}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-ink-500">{company.about}</p>
      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-4">
        <div className="flex items-center gap-4 text-xs">
          <div><span className="font-semibold text-ink-700">{company.openRoles}</span> <span className="text-ink-400">open roles</span></div>
          <div><span className="font-semibold text-ink-700">{company.totalHires}</span> <span className="text-ink-400">hires</span></div>
        </div>
        {company.status === 'verified' ? (
          <Link to={`/student/opportunities?company=${company.id}`}><Button size="sm" variant="secondary">View Roles</Button></Link>
        ) : (
          <Badge tone="warning"><Clock className="h-3 w-3" />Pending</Badge>
        )}
      </div>
    </div>
  );
}
