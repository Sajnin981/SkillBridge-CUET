import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, List as ListIcon, SlidersHorizontal, X } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { OpportunityCard } from '@/components/shared/OpportunityCard';
import { SearchBar } from '@/components/shared/SearchBar';
import { FilterSidebar, type FilterState } from '@/components/shared/FilterSidebar';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import type { Opportunity } from '@/lib/types';
import { opportunityService } from '@/services/opportunityService';
import { cn } from '@/lib/utils';

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'deadline', label: 'Deadline Soon' },
  { value: 'applicants', label: 'Most Applied' },
];

export default function OpportunityListingPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ types: [], remoteOnly: false, location: '', experience: 'Any', salaryMin: 0 });
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    opportunityService.getAll().then((o) => { setOpportunities(o); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let list = opportunities.filter((o) => {
      if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.company.toLowerCase().includes(search.toLowerCase()) && !o.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))) return false;
      if (filters.types.length && !filters.types.includes(o.type)) return false;
      if (filters.remoteOnly && !o.remote) return false;
      if (filters.location && o.location !== filters.location) return false;
      if (filters.experience !== 'Any' && o.experience !== filters.experience) return false;
      return true;
    });
    if (sort === 'recent') list = [...list].sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
    if (sort === 'deadline') list = [...list].sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline));
    if (sort === 'applicants') list = [...list].sort((a, b) => b.applicants - a.applicants);
    return list;
  }, [opportunities, search, filters, sort]);

  const perPage = 6;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-800">Opportunities</h2>
          <p className="mt-1 text-sm text-ink-500">{loading ? 'Loading…' : `${filtered.length} opportunities found`}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} className="flex-1" />
        <div className="flex items-center gap-2">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input h-10 w-auto text-sm">
            {sortOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div className="flex rounded-xl border border-ink-200 bg-white p-1">
            {(['grid', 'list'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition', view === v ? 'bg-brand-50 text-brand-600' : 'text-ink-400')}>
                {v === 'grid' ? <LayoutGrid className="h-4 w-4" /> : <ListIcon className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(filters.types.length > 0 || filters.remoteOnly || filters.location) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {filters.types.map((t) => (
            <button key={t} onClick={() => setFilters({ ...filters, types: filters.types.filter((x) => x !== t) })} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200/60">
              {t}<X className="h-3 w-3" />
            </button>
          ))}
          {filters.remoteOnly && <button onClick={() => setFilters({ ...filters, remoteOnly: false })} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200/60">Remote<X className="h-3 w-3" /></button>}
          {filters.location && <button onClick={() => setFilters({ ...filters, location: '' })} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200/60">{filters.location}<X className="h-3 w-3" /></button>}
        </div>
      )}

      <div className="flex gap-6">
        <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : paged.length === 0 ? (
            <EmptyState icon={<SlidersHorizontal className="h-7 w-7" />} title="No opportunities available" description="New opportunities will appear here once companies post them. Try adjusting your filters." action={<Button variant="outline" onClick={() => { setFilters({ types: [], remoteOnly: false, location: '', experience: 'Any', salaryMin: 0 }); setSearch(''); }}>Clear all filters</Button>} />
          ) : (
            <>
              <div className={cn(view === 'grid' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4')}>
                {paged.map((o) => <OpportunityCard key={o.id} opportunity={o} view={view} />)}
              </div>
              <div className="mt-8"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
