import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CompanyCard } from '@/components/shared/CompanyCard';
import { SearchBar } from '@/components/shared/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Building2 } from 'lucide-react';
import type { Company } from '@/lib/types';
import { companyService } from '@/services/companyService';

export default function PublicCompaniesPage() {
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyService.getVerified().then((c) => { setCompanies(c); setLoading(false); });
  }, []);

  const filtered = companies.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-ink-50">
      <Navbar />
      <div className="container-app py-12">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-ink-900 sm:text-4xl">Verified Companies</h1>
          <p className="mt-3 text-lg text-ink-500">Discover companies hiring from CUET.</p>
        </div>
        <div className="mx-auto mb-8 max-w-md"><SearchBar value={search} onChange={setSearch} placeholder="Search companies…" /></div>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card"><EmptyState icon={<Building2 className="h-7 w-7" />} title="No companies available" description="Verified companies will appear here once they join the platform." /></div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => <CompanyCard key={c.id} company={c} />)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
