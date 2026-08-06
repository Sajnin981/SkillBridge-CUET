import { useEffect, useState } from 'react';
import { Search, Sparkles, CheckCircle2, Brain, Target, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/shared/SearchBar';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { aiService } from '@/services/aiService';
import { timeAgo } from '@/lib/utils';

interface LogEntry {
  id: string; feature: string; user: string; email: string; score: number; duration: string; status: string; time: string;
}

const featureIcons: Record<string, typeof Brain> = { 'Resume Analysis': Brain, 'Candidate Matching': Users, 'Opportunity Recommendation': Target };

export default function AdminAILogsPage() {
  const [search, setSearch] = useState('');
  const [feature, setFeature] = useState('All');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiService.getLogs().then((l) => { setLogs(l); setLoading(false); });
  }, []);

  const filtered = logs.filter((l) => {
    if (search && !l.user.toLowerCase().includes(search.toLowerCase())) return false;
    if (feature !== 'All' && l.feature !== feature) return false;
    return true;
  });

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-800">AI Logs <Badge tone="brand"><Sparkles className="h-3 w-3" />AI</Badge></h2>
        <p className="mt-1 text-sm text-ink-500">Audit trail of all AI feature invocations.</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Brain className="h-5 w-5" /></div><p className="mt-2 text-2xl font-bold text-ink-800">{logs.filter((l) => l.feature === 'Resume Analysis').length}</p><p className="text-xs text-ink-400">Resume Analyses</p></Card>
        <Card className="text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600"><Target className="h-5 w-5" /></div><p className="mt-2 text-2xl font-bold text-ink-800">{logs.filter((l) => l.feature === 'Opportunity Recommendation').length}</p><p className="text-xs text-ink-400">Recommendations</p></Card>
        <Card className="text-center"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600"><Users className="h-5 w-5" /></div><p className="mt-2 text-2xl font-bold text-ink-800">{logs.filter((l) => l.feature === 'Candidate Matching').length}</p><p className="text-xs text-ink-400">Candidate Matches</p></Card>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} className="flex-1" />
        <div className="flex gap-1.5">
          {['All', 'Resume Analysis', 'Candidate Matching', 'Opportunity Recommendation'].map((f) => (
            <button key={f} onClick={() => setFeature(f)} className={`chip text-xs font-medium transition ${feature === f ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>{f === 'All' ? 'All' : f.split(' ')[0]}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<Sparkles className="h-7 w-7" />} title="No AI logs yet" description="AI feature invocations will be logged here once users start using them." /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                <th className="px-4 py-3">Feature</th>
                <th className="px-4 py-3">User</th>
                <th className="hidden px-4 py-3 sm:table-cell">Score</th>
                <th className="hidden px-4 py-3 lg:table-cell">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 sm:table-cell">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map((l) => {
                const Icon = featureIcons[l.feature] ?? Sparkles;
                return (
                  <tr key={l.id} className="transition hover:bg-ink-50">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon className="h-4 w-4" /></div><span className="text-sm font-medium text-ink-700">{l.feature}</span></div></td>
                    <td className="px-4 py-3"><p className="text-sm font-semibold text-ink-800">{l.user}</p><p className="text-xs text-ink-400">{l.email}</p></td>
                    <td className="hidden px-4 py-3 sm:table-cell"><Badge tone="brand">{l.score}%</Badge></td>
                    <td className="hidden px-4 py-3 lg:table-cell"><span className="text-sm text-ink-600">{l.duration}</span></td>
                    <td className="px-4 py-3"><Badge tone="success"><CheckCircle2 className="h-3 w-3" />Success</Badge></td>
                    <td className="hidden px-4 py-3 sm:table-cell"><span className="text-xs text-ink-400">{timeAgo(l.time)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
