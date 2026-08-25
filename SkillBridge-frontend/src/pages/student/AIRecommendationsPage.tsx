import { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Target, AlertCircle, Award } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Link } from 'react-router-dom';
import { aiService } from '@/services/aiService';
import { opportunityService } from '@/services/opportunityService';
import type { Opportunity } from '@/lib/types';

interface Recommendation {
  opportunityId: string;
  title?: string;
  company?: string;
  matchScore: number;
  reason: string;
  missingSkills: string[];
}

export default function AIRecommendationsPage() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([aiService.getRecommendations(), opportunityService.getAll()]).then(([r, o]) => {
      setRecs(r);
      setOpportunities(o);
      setLoading(false);
    });
  }, []);

  const enriched = recs.map((r) => {
    const opp = opportunities.find((o) => o.id === r.opportunityId);
    return {
      ...r,
      title: opp?.title || r.title || 'Recommended Opportunity',
      company: opp?.company || r.company || 'SkillBridge Partner',
      location: opp?.location || 'Remote',
      type: opp?.type || 'Internship',
      oppId: opp?.id || r.opportunityId,
    };
  });

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-800">AI Recommendations <Badge tone="brand"><Sparkles className="h-3 w-3" />AI</Badge></h2>
        <p className="mt-1 text-sm text-ink-500">Opportunities matched to your skills and profile — ranked by match score.</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl bg-brand-50 p-4">
        <Target className="h-5 w-5 text-brand-600" />
        <p className="text-sm text-brand-700"><span className="font-semibold">How it works:</span> Our AI analyzes your profile and matches it against opportunities using skills, experience, and preferences.</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : enriched.length === 0 ? (
        <div className="card"><EmptyState icon={<Award className="h-7 w-7" />} title="No recommendations yet" description="Upload your CV and add skills to your profile to unlock AI-powered opportunity recommendations." action={<Link to="/student/resume"><Button>Upload Resume</Button></Link>} /></div>
      ) : (
        <div className="space-y-4">
          {enriched.map((r) => (
            <Card key={r.opportunityId}>
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="flex items-center justify-center lg:w-32">
                  <div className="relative h-24 w-24">
                    <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle cx="48" cy="48" r="42" fill="none" stroke={r.matchScore >= 90 ? '#16a34a' : r.matchScore >= 80 ? '#166534' : '#d97706'} strokeWidth="8" strokeDasharray={`${(r.matchScore / 100) * 264} 264`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-2xl font-bold text-ink-800">{r.matchScore}%</span>
                      <span className="text-[10px] text-ink-400">match</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/student/opportunities/${r.oppId}`} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{r.company.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <p className="text-base font-semibold text-ink-800 hover:text-brand-700">{r.title}</p>
                        <p className="text-sm text-ink-500">{r.company} · {r.location}</p>
                      </div>
                    </Link>
                    <Badge tone="brand">{r.type}</Badge>
                  </div>
                  <div className="mt-3 rounded-xl bg-brand-50/50 p-3">
                    <p className="flex items-start gap-2 text-sm text-ink-600"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />{r.reason}</p>
                  </div>
                  {r.missingSkills.length > 0 && (
                    <div className="mt-3">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-warning-600"><AlertCircle className="h-3.5 w-3.5" />Missing skills</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {r.missingSkills.map((s) => <span key={s} className="chip bg-warning-50 text-warning-700 ring-1 ring-warning-200/60">{s}</span>)}
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-end">
                    <Link to={`/student/opportunities/${r.oppId}`}><Button size="sm" variant="outline">View & Apply <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
