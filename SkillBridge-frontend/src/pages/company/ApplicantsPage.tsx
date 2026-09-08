import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Users, Eye, CheckCircle2, XCircle, Sparkles, FileText, MessageSquare } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/shared/SearchBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { applicationService } from '@/services/applicationService';
import { aiService } from '@/services/aiService';
import { messageService } from '@/services/messageService';
import { api, normalizeError } from '@/api/axios';
import type { Applicant } from '@/lib/types';

const filters = ['All', 'New', 'Shortlisted', 'Rejected'];

async function openResumeFile(resumeUrl: string) {
  const [, folder, filename] = resumeUrl.split('/').filter(Boolean);
  const response = await api.get(`/files/${folder}/${filename}`, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function ApplicantsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Applicant | null>(null);
  const [list, setList] = useState<Applicant[]>([]);
  const [matches, setMatches] = useState<{ applicantId: string; matchScore: number; reason: string; skillsMatched: string[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    applicationService.getApplicants()
      .then((items) => {
        setList(items);
        const targetId = searchParams.get('applicationId');
        if (targetId) {
          const target = items.find((a) => a.id === targetId);
          if (target) setSelected(target);
        }
      })
      .catch((err) => setError(normalizeError(err).message))
      .finally(() => setLoading(false));
    aiService.getCandidateMatches().then(setMatches).catch(() => setMatches([]));
  }, [searchParams]);

  const filtered = list.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filter === 'Shortlisted' && !a.shortlisted) return false;
    if (filter === 'Rejected' && !a.rejected) return false;
    if (filter === 'New' && a.status !== 'submitted') return false;
    return true;
  });

  const shortlist = async (id: string) => {
    try {
      await applicationService.shortlist(id);
      setList((prev) => prev.map((a) => a.id === id ? { ...a, shortlisted: true, rejected: false, status: 'shortlisted' } : a));
      if (selected && selected.id === id) {
        setSelected({ ...selected, shortlisted: true, rejected: false, status: 'shortlisted' });
      }
      toast({ title: 'Candidate shortlisted', variant: 'success' });
    } catch (err) {
      const apiErr = normalizeError(err);
      toast({ title: 'Action failed', description: apiErr.message, variant: 'error' });
    }
  };

  const reject = async (id: string) => {
    try {
      await applicationService.reject(id);
      setList((prev) => prev.map((a) => a.id === id ? { ...a, rejected: true, shortlisted: false, status: 'rejected' } : a));
      if (selected && selected.id === id) {
        setSelected({ ...selected, rejected: true, shortlisted: false, status: 'rejected' });
      }
      toast({ title: 'Candidate marked as rejected', variant: 'info' });
    } catch (err) {
      const apiErr = normalizeError(err);
      toast({ title: 'Action failed', description: apiErr.message, variant: 'error' });
    }
  };

  const messageApplicant = async (applicant: Applicant) => {
    if (!applicant.studentId) {
      toast({ title: 'Could not start conversation', description: 'Missing student reference.', variant: 'error' });
      return;
    }
    setMessaging(true);
    try {
      const conversation = await messageService.startConversation({ studentId: applicant.studentId, opportunityId: applicant.opportunityId || undefined });
      navigate(`/company/messages?conversationId=${conversation._id}`);
    } catch (err) {
      toast({ title: 'Could not start conversation', description: normalizeError(err).message, variant: 'error' });
    } finally {
      setMessaging(false);
    }
  };

  const viewResume = async (applicant: Applicant) => {
    if (!applicant.resumeUrl) {
      toast({ title: 'No resume attached to this application', variant: 'info' });
      return;
    }
    try {
      await openResumeFile(applicant.resumeUrl);
    } catch {
      toast({ title: 'Could not open resume', variant: 'error' });
    }
  };

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-800">Applicants</h2>
          <p className="mt-1 text-sm text-ink-500">{loading ? 'Loading…' : `${filtered.length} candidates`}</p>
        </div>
        <Badge tone="brand"><Sparkles className="h-3 w-3" />AI Ranked</Badge>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} className="flex-1" />
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`chip text-xs font-medium transition ${filter === f ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <div className="card p-6 text-center text-sm text-danger-600">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<Users className="h-7 w-7" />} title="No applicants yet" description="When students apply to your opportunities, their profiles will appear here with AI match scores." /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => {
            const match = matches.find((m) => m.applicantId === a.studentId);
            return (
              <Card key={a.id}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{a.avatar}</div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-ink-800">{a.name}</p>
                    <p className="text-sm text-ink-500">{a.department} · Batch {a.batch}</p>
                  </div>
                  {match && <Badge tone="success">{match.matchScore}%</Badge>}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {a.skills.slice(0, 3).map((s) => <span key={s} className="chip bg-ink-100 text-ink-600 text-[11px]">{s}</span>)}
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-ink-100 pt-4">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/company/students/${a.studentId}`)}><Eye className="h-3.5 w-3.5" />View</Button>
                  <Button size="sm" variant={a.shortlisted ? 'success' : 'outline'} onClick={() => shortlist(a.id)}><CheckCircle2 className="h-3.5 w-3.5" />{a.shortlisted ? 'Shortlisted' : 'Shortlist'}</Button>
                  <Button size="sm" variant="ghost" onClick={() => reject(a.id)}><XCircle className="h-3.5 w-3.5" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Applicant Details" size="lg"
        footer={selected && (<><Button variant="outline" onClick={() => reject(selected.id)}><XCircle className="h-4 w-4" />Reject</Button><Button onClick={() => shortlist(selected.id)}><CheckCircle2 className="h-4 w-4" />Shortlist</Button></>)}>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700">{selected.avatar}</div>
              <div>
                <h3 className="text-xl font-bold text-ink-800">{selected.name}</h3>
                <p className="text-sm text-ink-500">{selected.department} · Batch {selected.batch}</p>
                <p className="text-xs text-ink-400">{selected.email}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink-700">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.skills.map((s) => <span key={s} className="chip bg-ink-100 text-ink-600">{s}</span>)}
              </div>
            </div>
            {matches.find((m) => m.applicantId === selected.studentId) && (
              <div className="rounded-xl bg-brand-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-brand-700"><Sparkles className="h-4 w-4" />AI Matching Explanation</p>
                <p className="mt-2 text-sm text-brand-600">{matches.find((m) => m.applicantId === selected.studentId)!.reason}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => viewResume(selected)}><FileText className="h-4 w-4" />View Resume</Button>
              <Button className="flex-1" onClick={() => messageApplicant(selected)} disabled={messaging}><MessageSquare className="h-4 w-4" />{messaging ? 'Opening…' : 'Message'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}

