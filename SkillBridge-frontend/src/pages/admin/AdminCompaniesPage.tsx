import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/shared/SearchBar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { companyService } from '@/services/companyService';
import type { Company } from '@/lib/types';

const statusTone: Record<string, 'success' | 'warning' | 'danger'> = { verified: 'success', pending: 'warning', rejected: 'danger' };

export default function AdminCompaniesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyService.getAll().then((c) => { setCompanies(c); setLoading(false); });
  }, []);

  const filtered = companies.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'All' && c.status !== filter.toLowerCase()) return false;
    return true;
  });

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Companies</h2>
        <p className="mt-1 text-sm text-ink-500">{loading ? 'Loading…' : `${filtered.length} companies on the platform`}</p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} className="flex-1" />
        <div className="flex gap-1.5">
          {['All', 'Verified', 'Pending', 'Rejected'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`chip text-xs font-medium transition ${filter === f ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<Building2 className="h-7 w-7" />} title="No companies found" description="Companies will appear here once they register on the platform." /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                <th className="px-4 py-3">Company</th>
                <th className="hidden px-4 py-3 sm:table-cell">Industry</th>
                <th className="px-4 py-3">Status</th>
                <th className="hidden px-4 py-3 sm:table-cell">Open Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map((c) => (
                <tr key={c.id} className="transition hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{c.logo}</div>
                      <div><p className="text-sm font-semibold text-ink-800">{c.name}</p><p className="text-xs text-ink-400">{c.location}</p></div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell"><span className="text-sm text-ink-600">{c.industry}</span></td>
                  <td className="px-4 py-3"><Badge tone={statusTone[c.status]}>{c.status}</Badge></td>
                  <td className="hidden px-4 py-3 sm:table-cell"><span className="text-sm font-semibold text-ink-700">{c.openRoles}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
