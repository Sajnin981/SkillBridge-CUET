import { Link } from 'react-router-dom';
import { Users, Building2, Briefcase, ShieldCheck, Clock } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { adminService } from '@/services/adminService';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalStudents: 0, totalCompanies: 0, totalOpportunities: 0, pendingVerifications: 0 });
  const [pending, setPending] = useState<{
    companies: { id: string; name: string; industry: string; location: string }[];
    students: { id: string; name: string; department: string; batch: string }[];
  }>({ companies: [], students: [] });
  const [health, setHealth] = useState<{ label: string; value: string; tone: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.getStats(), adminService.getPendingVerifications(), adminService.getSystemHealth()]).then(([s, p, h]) => {
      setStats(s); setPending(p); setHealth(h); setLoading(false);
    });
  }, []);

  if (loading) {
    return <PageContainer><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div></PageContainer>;
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-ink-500">Platform overview and system health.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={stats.totalStudents} icon={<Users className="h-5 w-5" />} tone="brand" />
        <StatCard label="Total Companies" value={stats.totalCompanies} icon={<Building2 className="h-5 w-5" />} tone="accent" />
        <StatCard label="Opportunities" value={stats.totalOpportunities} icon={<Briefcase className="h-5 w-5" />} tone="success" />
        <StatCard label="Pending Verifications" value={stats.pendingVerifications} icon={<ShieldCheck className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 md:grid-cols-2 lg:col-span-2">
          <Card>
            <CardHeader title="Pending Company Verifications" subtitle="Companies awaiting approval" action={<Link to="/admin/verifications?role=company"><Button variant="ghost" size="sm">View all</Button></Link>} />
            {pending.companies.length === 0 ? (
              <EmptyState icon={<ShieldCheck className="h-7 w-7" />} title="No pending companies" description="New company applications will appear here." />
            ) : (
              <div className="space-y-3">
                {pending.companies.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{c.name.slice(0, 2).toUpperCase()}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink-800">{c.name}</p>
                      <p className="text-xs text-ink-400">{c.industry} · {c.location}</p>
                    </div>
                    <Badge tone="warning"><Clock className="h-3 w-3" />Pending</Badge>
                    <Link to="/admin/verifications?role=company"><Button size="sm">Review</Button></Link>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Pending Student Approvals" subtitle="Students awaiting approval" action={<Link to="/admin/verifications?role=student"><Button variant="ghost" size="sm">View all</Button></Link>} />
            {pending.students.length === 0 ? (
              <EmptyState icon={<ShieldCheck className="h-7 w-7" />} title="No pending students" description="New student applications will appear here." />
            ) : (
              <div className="space-y-3">
                {pending.students.map((student) => (
                  <div key={student.id} className="flex items-center gap-3 rounded-xl border border-ink-100 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{student.name.slice(0, 2).toUpperCase()}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink-800">{student.name}</p>
                      <p className="text-xs text-ink-400">{student.department} · Batch {student.batch}</p>
                    </div>
                    <Badge tone="warning"><Clock className="h-3 w-3" />Pending</Badge>
                    <Link to="/admin/verifications?role=student"><Button size="sm">Review</Button></Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="System Health" />
            <div className="space-y-3">
              {health.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-ink-600">{s.label}</span>
                  <Badge tone={s.tone as 'success' | 'warning'}>{s.value}</Badge>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </PageContainer>
  );
}
