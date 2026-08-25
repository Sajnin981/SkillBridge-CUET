import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Briefcase, Users, Eye, TrendingUp } from 'lucide-react';
import { companyService } from '@/services/companyService';

const monthlyData = [
  { month: 'Jan', views: 120, applications: 15 },
  { month: 'Feb', views: 180, applications: 22 },
  { month: 'Mar', views: 240, applications: 31 },
  { month: 'Apr', views: 200, applications: 28 },
  { month: 'May', views: 310, applications: 42 },
  { month: 'Jun', views: 280, applications: 38 },
  { month: 'Jul', views: 380, applications: 51 },
];

export default function CompanyAnalyticsPage() {
  const [stats, setStats] = useState<{ totalOpportunities: number; totalApplications: number; shortlisted: number; hired: number; views: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyService.getAnalytics().then((s) => {
      setStats(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const maxViews = Math.max(...monthlyData.map((d) => d.views));

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
        <CardHeader title="Profile Views & Applications" subtitle="Monthly trends over the past 7 months" />
        <div className="flex h-64 items-end justify-between gap-2 pt-4">
          {monthlyData.map((d) => (
            <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-col gap-1">
                <div className="group relative w-full rounded-t-lg bg-brand-500 transition hover:bg-brand-600" style={{ height: `${(d.views / maxViews) * 180}px` }}>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-ink-800 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">{d.views} views</span>
                </div>
                <div className="w-full rounded-t bg-accent-400" style={{ height: `${(d.applications / maxViews) * 180}px` }} />
              </div>
              <span className="text-xs text-ink-400">{d.month}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-ink-500">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-brand-500" />Profile Views</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-accent-400" />Applications</span>
        </div>
      </Card>
    </PageContainer>
  );
}
