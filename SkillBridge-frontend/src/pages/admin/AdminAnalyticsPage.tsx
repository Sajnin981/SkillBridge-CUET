import { PageContainer } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { Users, Building2, Briefcase, TrendingUp } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Platform Analytics</h2>
        <p className="mt-1 text-sm text-ink-500">Growth metrics and usage trends.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={0} icon={<Users className="h-5 w-5" />} tone="brand" />
        <StatCard label="Active Companies" value={0} icon={<Building2 className="h-5 w-5" />} tone="accent" />
        <StatCard label="Opportunities" value={0} icon={<Briefcase className="h-5 w-5" />} tone="success" />
        <StatCard label="Hire Rate" value="—" icon={<TrendingUp className="h-5 w-5" />} tone="warning" />
      </div>

      <Card className="mt-6">
        <CardHeader title="User Growth" subtitle="Monthly registrations" />
        <div className="flex h-64 items-end justify-center gap-2 pt-4">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-2 w-16 rounded-t-lg bg-ink-200" />
            <span className="text-xs text-ink-400">No data yet</span>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
