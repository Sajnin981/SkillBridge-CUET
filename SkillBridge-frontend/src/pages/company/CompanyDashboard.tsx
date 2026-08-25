import { Link } from 'react-router-dom';
import { Briefcase, Users, Eye, Plus, CheckCircle2, Star } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { companyService } from '@/services/companyService';
import { applicationService } from '@/services/applicationService';
import { useEffect, useState } from 'react';
import type { Opportunity, Applicant } from '@/lib/types';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([companyService.listMyOpportunities(), applicationService.getApplicants()]).then(([o, a]) => {
      setOpportunities(o); setApplicants(a); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <PageContainer><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div></PageContainer>;
  }

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-800">Company Dashboard</h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
            <CheckCircle2 className="h-4 w-4 text-brand-500" />{user?.name ?? 'Company'} · Verified
          </p>
        </div>
        <Link to="/company/opportunities/new"><Button><Plus className="h-4 w-4" />Post Opportunity</Button></Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Opportunities" value={opportunities.length} icon={<Briefcase className="h-5 w-5" />} tone="brand" />
        <StatCard label="Total Applicants" value={applicants.length} icon={<Users className="h-5 w-5" />} tone="accent" />
        <StatCard label="Profile Views" value={0} icon={<Eye className="h-5 w-5" />} tone="success" />
        <StatCard label="Shortlisted" value={applicants.filter((a) => a.shortlisted).length} icon={<Star className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Active Opportunities" subtitle="Your posted roles and their applicant counts" action={<Link to="/company/opportunities"><Button variant="ghost" size="sm">Manage all</Button></Link>} />
            {opportunities.length === 0 ? (
              <EmptyState icon={<Briefcase className="h-7 w-7" />} title="No opportunities posted yet" description="Post your first opportunity to start receiving applications." action={<Link to="/company/opportunities/new"><Button size="sm"><Plus className="h-3.5 w-3.5" />Post Opportunity</Button></Link>} />
            ) : (
              <div className="space-y-3">
                {opportunities.map((o) => (
                  <Link key={o.id} to="/company/opportunities" className="block rounded-xl border border-ink-100 p-4 transition hover:border-brand-200 hover:bg-brand-50/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink-800">{o.title}</p>
                        <p className="text-xs text-ink-400">{o.type} · {o.location}</p>
                      </div>
                      <Badge tone="neutral"><Users className="h-3 w-3" />{o.applicants}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader title="Recent Candidates" action={<Link to="/company/applicants"><Button variant="ghost" size="sm">All</Button></Link>} />
            {applicants.length === 0 ? (
              <EmptyState icon={<Users className="h-6 w-6" />} title="No applicants yet" description="Applicants will appear here once you post opportunities." />
            ) : (
              <div className="space-y-3">
                {applicants.slice(0, 4).map((a) => (
                  <div key={a.id} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{a.avatar}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-800">{a.name}</p>
                      <p className="text-xs text-ink-400">{a.department} · {a.matchScore}% match</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
