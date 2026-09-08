import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Briefcase, Users, Star } from 'lucide-react';
import { companyService } from '@/services/companyService';

export default function CompanyAnalyticsPage() {
  const [stats, setStats] = useState<{ totalOpportunities: number; totalApplications: number; newApplicants: number; shortlisted: number; rejected: number } | null>(null);

  useEffect(() => {
    companyService.getAnalytics().then((s) => {
      setStats(s);
    }).catch(() => setStats(null));
  }, []);

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Analytics</h2>
        <p className="mt-1 text-sm text-ink-500">Live opportunity and applicant totals.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Opportunities" value={stats?.totalOpportunities ?? 0} icon={<Briefcase className="h-5 w-5" />} tone="brand" />
        <StatCard label="Total Applicants" value={stats?.totalApplications ?? 0} icon={<Users className="h-5 w-5" />} tone="accent" />
        <StatCard label="New Applicants" value={stats?.newApplicants ?? 0} icon={<Users className="h-5 w-5" />} tone="success" />
        <StatCard label="Shortlisted" value={stats?.shortlisted ?? 0} icon={<Star className="h-5 w-5" />} tone="warning" />
      </div>
    </PageContainer>
  );
}
