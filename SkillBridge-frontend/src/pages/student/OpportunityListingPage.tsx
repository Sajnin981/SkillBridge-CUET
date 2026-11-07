import { useEffect, useState } from 'react';
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

const backendTypeByLabel: Partial<Record<Opportunity['type'], string[]>> = {
  Internship: ['internship', 'industrial-training'],
  Job: ['job'],
  Freelancing: ['freelancing'],
  Research: ['research'],
  Competition: ['competition'],
};

export default function OpportunityListingPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ types: [], remoteOnly: false, location: '', skills: [], experience: 'Any', salaryMin: 0 });
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [filterOptionsError, setFilterOptionsError] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    opportunityService.getFilterOptions().then((options) => {
      setLocations(options.locations);
      setAvailableSkills(options.skills);
    }).catch(() => {
      setLocations([]);
      setAvailableSkills([]);
      setFilterOptionsError(true);
    });
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    opportunityService.getPage({
      type: filters.types.flatMap((type) => backendTypeByLabel[type] || []),
      search: search.trim() || undefined,
      location: filters.location || undefined,
      isRemote: filters.remoteOnly || undefined,
      skills: filters.skills,
      page,
      limit: 6,
      sort: sort === 'deadline' ? 'deadline' : sort === 'applicants' ? 'applicants' : '-createdAt',
    }).then((result) => {
      if (!active) return;
      setOpportunities(result.items);
      setTotalCount(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    }).catch(() => {
      if (!active) return;
      setOpportunities([]);
      setTotalCount(0);
      setTotalPages(1);
      setError(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [filters, page, search, sort]);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-800">Opportunities</h2>
          <p className="mt-1 text-sm text-ink-500">{loading ? 'Loading…' : `${totalCount} opportunities found`}</p>
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

      {(filters.types.length > 0 || filters.remoteOnly || filters.location || filters.skills.length > 0) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {filters.types.map((t) => (
            <button key={t} onClick={() => { setFilters({ ...filters, types: filters.types.filter((x) => x !== t) }); setPage(1); }} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200/60">
              {t}<X className="h-3 w-3" />
            </button>
          ))}
          {filters.remoteOnly && <button onClick={() => { setFilters({ ...filters, remoteOnly: false }); setPage(1); }} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200/60">Remote<X className="h-3 w-3" /></button>}
          {filters.location && <button onClick={() => { setFilters({ ...filters, location: '' }); setPage(1); }} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200/60">{filters.location}<X className="h-3 w-3" /></button>}
          {filters.skills.map((skill) => (
            <button key={skill} onClick={() => { setFilters({ ...filters, skills: filters.skills.filter((selected) => selected !== skill) }); setPage(1); }} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200/60">
              {skill}<X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      {filterOptionsError && <p className="mb-3 text-xs text-danger-600">Could not load location and skills filter options.</p>}
      <div className="flex gap-6">
        <FilterSidebar filters={filters} locations={locations} skills={availableSkills} onChange={(f) => { setFilters(f); setPage(1); }} />
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : error ? (
            <div className="card p-6 text-center text-sm text-danger-600">Could not load opportunities. Please try again.</div>
          ) : opportunities.length === 0 ? (
            <EmptyState icon={<SlidersHorizontal className="h-7 w-7" />} title="No opportunities available" description="New opportunities will appear here once companies post them. Try adjusting your filters." action={<Button variant="outline" onClick={() => { setFilters({ types: [], remoteOnly: false, location: '', skills: [], experience: 'Any', salaryMin: 0 }); setSearch(''); setPage(1); }}>Clear all filters</Button>} />
          ) : (
            <>
              <div className={cn(view === 'grid' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4')}>
                {opportunities.map((o) => <OpportunityCard key={o.id} opportunity={o} view={view} />)}
              </div>
              <div className="mt-8"><Pagination page={page} totalPages={totalPages} onChange={setPage} /></div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
