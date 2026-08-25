import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Eye, Clock, FileText, ShieldCheck } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { companyService } from '@/services/companyService';
import type { Company } from '@/lib/types';

export default function AdminVerificationsPage() {
  const { toast } = useToast();
  const [list, setList] = useState<Company[]>([]);
  const [selected, setSelected] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyService.getPending().then((c) => { setList(c); setLoading(false); });
  }, []);

  const pending = list.filter((c) => c.status === 'pending');

  const approve = (id: string) => {
    companyService.approve(id);
    setList((prev) => prev.map((c) => c.id === id ? { ...c, status: 'verified' } : c));
    setSelected(null);
    toast({ title: 'Company verified', description: 'They can now post opportunities.', variant: 'success' });
  };
  const reject = (id: string) => {
    companyService.reject(id);
    setList((prev) => prev.map((c) => c.id === id ? { ...c, status: 'rejected' } : c));
    setSelected(null);
    toast({ title: 'Company rejected', variant: 'info' });
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Company Verifications</h2>
        <p className="mt-1 text-sm text-ink-500">Review and approve pending company applications.</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="text-center"><p className="text-2xl font-bold text-warning-600">{pending.length}</p><p className="text-xs text-ink-400">Pending</p></Card>
        <Card className="text-center"><p className="text-2xl font-bold text-success-600">{list.filter((c) => c.status === 'verified').length}</p><p className="text-xs text-ink-400">Verified</p></Card>
        <Card className="text-center"><p className="text-2xl font-bold text-danger-600">{list.filter((c) => c.status === 'rejected').length}</p><p className="text-xs text-ink-400">Rejected</p></Card>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : pending.length === 0 ? (
        <div className="card"><EmptyState icon={<ShieldCheck className="h-7 w-7" />} title="No pending verifications" description="All companies have been reviewed. New applications will appear here." /></div>
      ) : (
        <div className="space-y-3">
          {pending.map((c) => (
            <Card key={c.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{c.logo}</div>
                  <div>
                    <p className="text-base font-semibold text-ink-800">{c.name}</p>
                    <p className="text-sm text-ink-500">{c.industry} · {c.location}</p>
                  </div>
                </div>
                <Badge tone="warning"><Clock className="h-3 w-3" />Pending</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelected(c)}><Eye className="h-3.5 w-3.5" />Review</Button>
                  <Button variant="success" size="sm" onClick={() => approve(c.id)}><CheckCircle2 className="h-3.5 w-3.5" />Approve</Button>
                  <Button variant="danger" size="sm" onClick={() => reject(c.id)}><XCircle className="h-3.5 w-3.5" />Reject</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Review Company" size="lg"
        footer={selected && (<><Button variant="danger" onClick={() => reject(selected.id)}><XCircle className="h-4 w-4" />Reject</Button><Button variant="success" onClick={() => approve(selected.id)}><CheckCircle2 className="h-4 w-4" />Approve Company</Button></>)}>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-bold text-brand-700">{selected.logo}</div>
              <div><h3 className="text-xl font-bold text-ink-800">{selected.name}</h3><p className="text-sm text-ink-500">{selected.industry} · {selected.location}</p></div>
            </div>
            <div className="rounded-xl border border-ink-100 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-700"><FileText className="h-4 w-4" />Submitted Documents</p>
              <div className="space-y-2">
                {['Trade License', 'Certificate of Incorporation', 'Company Profile'].map((d) => (
                  <div key={d} className="flex items-center gap-2 rounded-lg bg-ink-50 p-2.5"><FileText className="h-4 w-4 text-brand-500" /><span className="flex-1 text-sm text-ink-600">{d}.pdf</span><Button variant="ghost" size="sm">View</Button></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
