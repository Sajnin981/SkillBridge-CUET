import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Link } from 'react-router-dom';
import { applicationService } from '@/services/applicationService';

const stages = ['submitted', 'shortlisted', 'rejected'];
const statusTone: Record<string, 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'purple'> = {
  submitted: 'neutral', shortlisted: 'accent', rejected: 'danger',
};

export default function AppliedOpportunitiesPage() {
  const [applications, setApplications] = useState<{ id: string; status: string; stage: string; opportunityTitle: string; companyName: string; date: string; opportunityId: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationService.getApplications().then((a) => { setApplications(a); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">My Applications</h2>
        <p className="mt-1 text-sm text-ink-500">Track the status of all your applications in one place.</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {stages.map((s) => {
          const count = applications.filter((a) => a.status === s).length;
          return (
            <div key={s} className="card p-3 text-center">
              <p className="text-xl font-bold text-ink-800">{count}</p>
              <p className="text-xs capitalize text-ink-400">{s}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : applications.length === 0 ? (
        <div className="card"><EmptyState icon={<FileText className="h-7 w-7" />} title="No applications submitted" description="Start applying to opportunities to track their progress here." action={<Link to="/student/opportunities"><Button>Browse Opportunities</Button></Link>} /></div>
      ) : (
        <div className="space-y-3">
          {applications.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link to={`/student/opportunities/${a.opportunityId}`} className="flex-1">
                  <p className="text-base font-semibold text-ink-800 hover:text-brand-700">{a.opportunityTitle || a.stage || `Application #${a.id}`}</p>
                  <p className="text-sm text-ink-500">{a.companyName || 'SkillBridge Partner'}</p>
                </Link>
                <Badge tone={statusTone[a.status] ?? 'neutral'}>{a.status}</Badge>
                <Link to={`/student/opportunities/${a.opportunityId}`}><Button variant="outline" size="sm">View</Button></Link>
              </div>
              <div className="mt-4">
                <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                  <div className={`h-full rounded-full ${a.status === 'rejected' ? 'bg-danger-500' : a.status === 'shortlisted' ? 'bg-success-500' : 'bg-brand-600'}`} style={{ width: `${(stages.indexOf(a.status) / (stages.length - 1)) * 100}%` }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
