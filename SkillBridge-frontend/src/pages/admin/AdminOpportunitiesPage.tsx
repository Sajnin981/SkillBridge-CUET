import { useEffect, useState } from 'react';
import { Search, Briefcase, Trash2, Flag } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/shared/SearchBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { opportunityService } from '@/services/opportunityService';
import type { Opportunity } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

export default function AdminOpportunitiesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    opportunityService.getAll().then((o) => { setOpportunities(o); setLoading(false); });
  }, []);

  const filtered = opportunities.filter((o) => !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Manage Opportunities</h2>
        <p className="mt-1 text-sm text-ink-500">{loading ? 'Loading…' : `${filtered.length} opportunities on the platform`}</p>
      </div>

      <div className="mb-5"><SearchBar value={search} onChange={setSearch} className="max-w-md" /></div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<Briefcase className="h-7 w-7" />} title="No opportunities found" description="Opportunities will appear here once companies post them." /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                <th className="px-4 py-3">Opportunity</th>
                <th className="hidden px-4 py-3 sm:table-cell">Company</th>
                <th className="hidden px-4 py-3 sm:table-cell">Type</th>
                <th className="hidden px-4 py-3 lg:table-cell">Posted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map((o) => (
                <tr key={o.id} className="transition hover:bg-ink-50">
                  <td className="px-4 py-3"><p className="text-sm font-semibold text-ink-800">{o.title}</p><p className="text-xs text-ink-400 sm:hidden">{o.company}</p></td>
                  <td className="hidden px-4 py-3 sm:table-cell"><span className="text-sm text-ink-600">{o.company}</span></td>
                  <td className="hidden px-4 py-3 sm:table-cell"><Badge tone="brand">{o.type}</Badge></td>
                  <td className="hidden px-4 py-3 lg:table-cell"><span className="text-xs text-ink-400">{timeAgo(o.postedAt)}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => toast({ title: 'Opportunity flagged for review', variant: 'warning' })}><Flag className="h-4 w-4 text-warning-500" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteOpen(o.id)}><Trash2 className="h-4 w-4 text-danger-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!deleteOpen} onClose={() => setDeleteOpen(null)} title="Remove opportunity?" size="sm"
        footer={<><Button variant="outline" onClick={() => setDeleteOpen(null)}>Cancel</Button><Button variant="danger" onClick={() => { setDeleteOpen(null); toast({ title: 'Opportunity removed', variant: 'success' }); }}>Remove</Button></>}>
        <p className="text-sm text-ink-600">This will permanently remove the opportunity and all associated applications. This cannot be undone.</p>
      </Modal>
    </PageContainer>
  );
}
