import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, Bookmark, TrendingUp, ArrowRight, Sparkles, Award, Upload } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { applicationService } from '@/services/applicationService';
import { opportunityService } from '@/services/opportunityService';
import { aiService } from '@/services/aiService';
import { notificationService } from '@/services/notificationService';
import type { Opportunity, Notification } from '@/lib/types';

const quickActions = [
  { label: 'Browse Opportunities', icon: Briefcase, to: '/student/opportunities', tone: 'bg-brand-50 text-brand-600' },
  { label: 'Resume Builder', icon: Upload, to: '/student/resume', tone: 'bg-accent-50 text-accent-600' },
  { label: 'Edit Profile', icon: TrendingUp, to: '/student/profile', tone: 'bg-success-50 text-success-600' },
  { label: 'View Applications', icon: FileText, to: '/student/applied', tone: 'bg-warning-50 text-warning-600' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<{ id: string; status: string; stage: string; date: string }[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recommendations, setRecommendations] = useState<{ opportunityId: string; matchScore: number; reason: string }[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      applicationService.getApplications(),
      opportunityService.getAll(),
      aiService.getRecommendations(),
      user ? notificationService.getAll(user.role) : Promise.resolve([]),
    ]).then(([apps, opps, recs, notifs]) => {
      setApplications(apps);
      setOpportunities(opps);
      setRecommendations(recs);
      setNotifications(notifs);
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <PageContainer>
        <div className="mb-6"><SkeletonCard /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-800">Welcome back, {user?.name.split(' ')[0]}</h2>
          <p className="mt-1 text-sm text-ink-500">Here's what's happening with your applications today.</p>
        </div>
        <Link to="/student/opportunities"><Button>Browse Opportunities <ArrowRight className="h-4 w-4" /></Button></Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={applications.length} icon={<FileText className="h-5 w-5" />} tone="brand" />
        <StatCard label="Saved Jobs" value={0} icon={<Bookmark className="h-5 w-5" />} tone="accent" />
        <StatCard label="Recommendations" value={recommendations.length} icon={<Award className="h-5 w-5" />} tone="success" />
        <StatCard label="Notifications" value={notifications.filter((n) => !n.read).length} icon={<TrendingUp className="h-5 w-5" />} tone="warning" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((a) => (
          <Link key={a.label} to={a.to}>
            <div className="card group flex items-center gap-3 p-4 transition hover:shadow-card hover:-translate-y-0.5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.tone}`}><a.icon className="h-5 w-5" /></div>
              <span className="text-sm font-medium text-ink-700">{a.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="AI Recommended Opportunities" subtitle="Matched to your skills and profile" action={<Badge tone="brand"><Sparkles className="h-3 w-3" />AI</Badge>} />
            {recommendations.length === 0 ? (
              <EmptyState icon={<Sparkles className="h-7 w-7" />} title="No recommendations yet" description="Upload your CV and add skills to unlock AI recommendations." action={<Link to="/student/resume"><Button size="sm"><Upload className="h-3.5 w-3.5" />Upload Resume</Button></Link>} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {recommendations.slice(0, 4).map((r) => {
                  const opp = opportunities.find((o) => o.id === r.opportunityId);
                  if (!opp) return null;
                  return (
                    <Link key={r.opportunityId} to={`/student/opportunities/${opp.id}`} className="rounded-xl border border-ink-100 p-4 transition hover:border-brand-200 hover:bg-brand-50/30">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-ink-800">{opp.title}</p>
                        <Badge tone="success">{r.matchScore}% match</Badge>
                      </div>
                      <p className="mt-1 text-xs text-ink-500">{opp.company} · {opp.location}</p>
                      <p className="mt-2 line-clamp-2 text-xs text-ink-400">{r.reason}</p>
                    </Link>
                  );
                })}
              </div>
            )}
            <Link to="/student/recommendations" className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-brand-50 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-100">
              View all recommendations <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>

          <Card>
            <CardHeader title="Recently Posted" action={<Link to="/student/opportunities"><Button variant="ghost" size="sm">View all</Button></Link>} />
            {opportunities.length === 0 ? (
              <EmptyState icon={<Briefcase className="h-7 w-7" />} title="No opportunities available" description="New opportunities will appear here once companies post them." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {opportunities.slice(0, 4).map((o) => (
                  <Link key={o.id} to={`/student/opportunities/${o.id}`} className="rounded-xl border border-ink-100 p-4 transition hover:border-brand-200">
                    <p className="text-sm font-semibold text-ink-800">{o.title}</p>
                    <p className="text-xs text-ink-500">{o.company} · {o.location}</p>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Application Status" action={<Link to="/student/applied"><Button variant="ghost" size="sm">All</Button></Link>} />
            {applications.length === 0 ? (
              <EmptyState icon={<FileText className="h-6 w-6" />} title="No applications" description="Your application history will appear here." />
            ) : (
              <div className="space-y-3">
                {applications.map((a) => (
                  <div key={a.id} className="rounded-xl border border-ink-100 p-3.5">
                    <p className="text-sm font-semibold text-ink-800">Application #{a.id}</p>
                    <p className="text-xs text-ink-400">{a.stage}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Profile Strength" subtitle="Complete your profile to boost visibility" />
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#16a34a" strokeWidth="6" strokeDasharray={`${0.4 * 176} 176`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink-800">40%</span>
              </div>
              <div className="space-y-1.5 text-xs text-ink-500">
                <p>Complete your profile to improve visibility</p>
                <Link to="/student/profile" className="font-medium text-brand-600 hover:text-brand-700">Complete profile</Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
