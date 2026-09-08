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
import { adminService } from '@/services/adminService';
import { api, normalizeError } from '@/api/axios';
import type { BackendCompany, BackendStudent } from '@/api/types';

type VerificationRole = 'student' | 'company';

interface VerificationItem {
  id: string;
  name: string;
  email: string;
  subtitle: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: { label: string; path: string }[];
}

function toVerificationItem(item: BackendStudent | BackendCompany, role: VerificationRole): VerificationItem {
  if (role === 'student') {
    const student = item as BackendStudent;
    return { id: student._id, name: student.fullName, email: student.email, subtitle: `${student.department} · Batch ${student.batch}`, status: student.status, documents: [{ label: 'Student ID Card', path: student.idCardUrl }, ...(student.resumeUrl ? [{ label: 'Resume', path: student.resumeUrl }] : [])] };
  }
  const company = item as BackendCompany;
  return { id: company._id, name: company.companyName, email: company.email, subtitle: `${company.industry} · ${company.address}`, status: company.status, documents: [{ label: 'Trade License', path: company.tradeLicenseUrl }, ...(company.logoUrl ? [{ label: 'Company Logo', path: company.logoUrl }] : [])] };
}

async function openDocument(filePath: string) {
  const [, folder, filename] = filePath.split('/').filter(Boolean);
  const response = await api.get(`/files/${folder}/${filename}`, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function AdminVerificationsPage() {
  const { toast } = useToast();
  const [role, setRole] = useState<VerificationRole>('company');
  const [list, setList] = useState<VerificationItem[]>([]);
  const [selected, setSelected] = useState<VerificationItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminService.listUsers(role, { status: undefined, limit: 100 }).then((response) => {
      setList(response.items.map((item) => toVerificationItem(item as BackendStudent | BackendCompany, role)));
    }).catch((err) => {
      const apiErr = normalizeError(err);
      toast({ title: 'Could not load verifications', description: apiErr.message, variant: 'error' });
    }).finally(() => setLoading(false));
  }, [role, toast]);

  const pending = list.filter((item) => item.status === 'pending');

  const approve = async (id: string) => {
    try {
      await adminService.approveVerification(role, id);
      setList((prev) => prev.map((item) => item.id === id ? { ...item, status: 'approved' } : item));
      setSelected(null);
      toast({ title: `${role === 'student' ? 'Student' : 'Company'} approved`, description: role === 'student' ? 'They can now use approved student features.' : 'They can now post opportunities.', variant: 'success' });
    } catch (err) {
      const apiErr = normalizeError(err);
      toast({ title: 'Approval failed', description: apiErr.message, variant: 'error' });
    }
  };
  const reject = async (id: string) => {
    try {
      await adminService.rejectVerification(role, id);
      setList((prev) => prev.map((item) => item.id === id ? { ...item, status: 'rejected' } : item));
      setSelected(null);
      toast({ title: `${role === 'student' ? 'Student' : 'Company'} rejected`, variant: 'info' });
    } catch (err) {
      const apiErr = normalizeError(err);
      toast({ title: 'Rejection failed', description: apiErr.message, variant: 'error' });
    }
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Account Verifications</h2>
        <p className="mt-1 text-sm text-ink-500">Review and approve pending student and company applications.</p>
      </div>

      <div className="mb-6 flex gap-2 rounded-xl bg-ink-100 p-1 sm:w-fit">
        {(['company', 'student'] as const).map((itemRole) => (
          <button key={itemRole} type="button" onClick={() => setRole(itemRole)} className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${role === itemRole ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500'}`}>
            {itemRole} verifications
          </button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="text-center"><p className="text-2xl font-bold text-warning-600">{pending.length}</p><p className="text-xs text-ink-400">Pending</p></Card>
        <Card className="text-center"><p className="text-2xl font-bold text-success-600">{list.filter((item) => item.status === 'approved').length}</p><p className="text-xs text-ink-400">Approved</p></Card>
        <Card className="text-center"><p className="text-2xl font-bold text-danger-600">{list.filter((c) => c.status === 'rejected').length}</p><p className="text-xs text-ink-400">Rejected</p></Card>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : pending.length === 0 ? (
        <div className="card"><EmptyState icon={<ShieldCheck className="h-7 w-7" />} title="No pending verifications" description={`All ${role} applications have been reviewed. New applications will appear here.`} /></div>
      ) : (
        <div className="space-y-3">
          {pending.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{item.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <p className="text-base font-semibold text-ink-800">{item.name}</p>
                    <p className="text-sm text-ink-500">{item.subtitle}</p>
                    <p className="text-xs text-ink-400">{item.email}</p>
                  </div>
                </div>
                <Badge tone="warning"><Clock className="h-3 w-3" />Pending</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelected(item)}><Eye className="h-3.5 w-3.5" />Review</Button>
                  <Button variant="success" size="sm" onClick={() => approve(item.id)}><CheckCircle2 className="h-3.5 w-3.5" />Approve</Button>
                  <Button variant="danger" size="sm" onClick={() => reject(item.id)}><XCircle className="h-3.5 w-3.5" />Reject</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Review ${role}`} size="lg"
        footer={selected && (<><Button variant="danger" onClick={() => reject(selected.id)}><XCircle className="h-4 w-4" />Reject</Button><Button variant="success" onClick={() => approve(selected.id)}><CheckCircle2 className="h-4 w-4" />Approve {role}</Button></>)}>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-100 text-2xl font-bold text-brand-700">{selected.name.slice(0, 2).toUpperCase()}</div>
              <div><h3 className="text-xl font-bold text-ink-800">{selected.name}</h3><p className="text-sm text-ink-500">{selected.subtitle}</p><p className="text-sm text-ink-400">{selected.email}</p></div>
            </div>
            <div className="rounded-xl border border-ink-100 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-700"><FileText className="h-4 w-4" />Submitted Documents</p>
              <div className="space-y-2">
                {selected.documents.map((document) => <div key={document.path} className="flex items-center gap-2 rounded-lg bg-ink-50 p-2.5"><FileText className="h-4 w-4 text-brand-500" /><span className="flex-1 text-sm text-ink-600">{document.label}</span><button className="text-sm font-medium text-brand-600 hover:text-brand-700" onClick={() => openDocument(document.path).catch((err) => toast({ title: 'Could not open document', description: normalizeError(err).message, variant: 'error' }))}>View</button></div>)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
