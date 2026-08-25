import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { Briefcase, Users, Eye, TrendingUp } from 'lucide-react';
import { companyService } from '@/services/companyService';

export default function CompanyAnalyticsPage() {
  const [stats, setStats] = useState<{ totalOpportunities: number; totalApplications: number; shortlisted: number; hired: number; views: number } | null>(null);

  useEffect(() => {
    companyService.getAnalytics().then((s) => {
      setStats(s);
    }).catch(() => setStats(null));
  }, []);

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Analytics</h2>
        <p className="mt-1 text-sm text-ink-500">Track your opportunities' performance and hiring metrics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Opportunities" value={stats?.totalOpportunities ?? 0} icon={<Briefcase className="h-5 w-5" />} tone="brand" />
        <StatCard label="Total Applicants" value={stats?.totalApplications ?? 0} icon={<Users className="h-5 w-5" />} tone="accent" />
        <StatCard label="Shortlisted" value={stats?.shortlisted ?? 0} icon={<Eye className="h-5 w-5" />} tone="success" />
        <StatCard label="Hired" value={stats?.hired ?? 0} icon={<TrendingUp className="h-5 w-5" />} tone="warning" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Historical trends" subtitle="Analytics currently available from the company API" />
        <p className="text-sm text-ink-500">Historical profile-view data is not available from the backend yet. The metrics above reflect your live opportunity and application totals.</p>
      </Card>
    </PageContainer>
  );
}
