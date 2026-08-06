import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OpportunityType } from '@/lib/types';

const types: OpportunityType[] = ['Internship', 'Job', 'Freelancing', 'Research', 'Competition', 'Scholarship', 'Part-time'];
const locations = ['Dhaka, BD', 'Chittagong, BD', 'Remote', 'Nationwide'];
const experiences = ['Any', '0-1 yrs', '1-2 yrs', '1-3 yrs', '2+ yrs'];

export interface FilterState {
  types: OpportunityType[];
  remoteOnly: boolean;
  location: string;
  experience: string;
  salaryMin: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  className?: string;
}

export function FilterSidebar({ filters, onChange, className }: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleType = (t: OpportunityType) => {
    const next = filters.types.includes(t) ? filters.types.filter((x) => x !== t) : [...filters.types, t];
    onChange({ ...filters, types: next });
  };

  const reset = () => onChange({ types: [], remoteOnly: false, location: '', experience: 'Any', salaryMin: 0 });

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
          <SlidersHorizontal className="h-4 w-4" />Filters
        </h3>
        <button onClick={reset} className="text-xs font-medium text-brand-600 hover:text-brand-700">Reset all</button>
      </div>

      <FilterSection title="Opportunity Type">
        <div className="space-y-2">
          {types.map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-600">
              <input type="checkbox" checked={filters.types.includes(t)} onChange={() => toggleType(t)} className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
              {t}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Work Mode">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-600">
          <input type="checkbox" checked={filters.remoteOnly} onChange={(e) => onChange({ ...filters, remoteOnly: e.target.checked })} className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
          Remote only
        </label>
      </FilterSection>

      <FilterSection title="Location">
        <div className="space-y-2">
          {locations.map((l) => (
            <label key={l} className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-600">
              <input type="radio" name="location" checked={filters.location === l} onChange={() => onChange({ ...filters, location: l })} className="h-4 w-4 border-ink-300 text-brand-600 focus:ring-brand-500" />
              {l}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Experience">
        <div className="flex flex-wrap gap-1.5">
          {experiences.map((e) => (
            <button
              key={e}
              onClick={() => onChange({ ...filters, experience: e })}
              className={cn('chip text-xs transition', filters.experience === e ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200')}
            >
              {e}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title={`Minimum Salary · BDT ${filters.salaryMin.toLocaleString()}`}>
        <input type="range" min={0} max={100000} step={5000} value={filters.salaryMin} onChange={(e) => onChange({ ...filters, salaryMin: Number(e.target.value) })} className="w-full accent-brand-600" />
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className={cn('hidden w-64 shrink-0 lg:block', className)}>
        <div className="card sticky top-20 p-5">{content}</div>
      </aside>

      {/* Mobile trigger */}
      <button onClick={() => setMobileOpen(true)} className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm font-medium text-ink-600 lg:hidden">
        <SlidersHorizontal className="h-4 w-4" />Filters
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 right-0 w-72 overflow-y-auto bg-white p-5 animate-fade-in">
            <button onClick={() => setMobileOpen(false)} className="mb-4 rounded-lg p-1.5 text-ink-400 hover:bg-ink-100"><X className="h-5 w-5" /></button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-ink-100 pb-5 last:border-0 last:pb-0">
      <button onClick={() => setOpen(!open)} className="mb-3 flex w-full items-center justify-between text-sm font-medium text-ink-700">
        {title}
        <ChevronDown className={cn('h-4 w-4 text-ink-400 transition', open && 'rotate-180')} />
      </button>
      {open && children}
    </div>
  );
}
