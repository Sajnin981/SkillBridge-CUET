import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Clock, Pencil, Eye, Trash2, Briefcase } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { opportunityService } from '@/services/opportunityService';
import type { Opportunity } from '@/lib/types';
import { daysLeft } from '@/lib/utils';

export default function ManageOpportunitiesPage() {
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    opportunityService.getAll().then((o) => { setOpportunities(o); setLoading(false); });
  }, []);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-800">Manage Opportunities</h2>
          <p className="mt-1 text-sm text-ink-500">{loading ? 'Loading…' : `${opportunities.length} opportunities posted`}</p>
        </div>
        <Link to="/company/opportunities/new"><Button><Plus className="h-4 w-4" />Post New</Button></Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : opportunities.length === 0 ? (
        <div className="card"><EmptyState icon={<Briefcase className="h-7 w-7" />} title="No opportunities posted yet" description="Post your first opportunity to start receiving applications from verified CUET students." action={<Link to="/company/opportunities/new"><Button><Plus className="h-4 w-4" />Post Opportunity</Button></Link>} /></div>
      ) : (
        <div className="space-y-3">
          {opportunities.map((o) => (
            <Card key={o.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{o.companyLogo}</div>
                  <div>
                    <p className="text-base font-semibold text-ink-800">{o.title}</p>
                    <p className="text-sm text-ink-500">{o.type} · {o.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden text-right sm:block">
                    <p className="flex items-center gap-1 text-sm font-medium text-ink-700"><Users className="h-3.5 w-3.5" />{o.applicants}</p>
                    <p className="text-xs text-ink-400">applicants</p>
                  </div>
                  <Badge tone={daysLeft(o.deadline) > 7 ? 'success' : 'warning'}><Clock className="h-3 w-3" />{daysLeft(o.deadline)}d left</Badge>
                  <div className="flex gap-1">
                    <Link to="/company/applicants"><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></Link>
                    <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteOpen(o.id)}><Trash2 className="h-4 w-4 text-danger-500" /></Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!deleteOpen} onClose={() => setDeleteOpen(null)} title="Delete opportunity?" size="sm"
        footer={<><Button variant="outline" onClick={() => setDeleteOpen(null)}>Cancel</Button><Button variant="danger" onClick={() => { setDeleteOpen(null); toast({ title: 'Opportunity deleted', variant: 'success' }); }}>Delete</Button></>}>
        <p className="text-sm text-ink-600">Are you sure you want to delete this opportunity? This action cannot be undone and all applicant data will be removed.</p>
      </Modal>
    </PageContainer>
  );
}
