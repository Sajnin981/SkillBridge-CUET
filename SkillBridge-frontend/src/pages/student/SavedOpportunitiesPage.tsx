import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { OpportunityCard } from '@/components/shared/OpportunityCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import type { Opportunity } from '@/lib/types';
import { opportunityService } from '@/services/opportunityService';

export default function SavedOpportunitiesPage() {
  const [saved, setSaved] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    opportunityService.getSaved().then((s) => { setSaved(s); setLoading(false); });
  }, []);

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Saved Opportunities</h2>
        <p className="mt-1 text-sm text-ink-500">{loading ? 'Loading…' : `${saved.length} opportunities saved`}</p>
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">{[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : saved.length === 0 ? (
        <div className="card"><EmptyState icon={<Bookmark className="h-7 w-7" />} title="No saved opportunities" description="Bookmark opportunities to find them quickly later." action={<Link to="/student/opportunities"><Button>Browse Opportunities</Button></Link>} /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {saved.map((o) => <OpportunityCard key={o.id} opportunity={o} />)}
        </div>
      )}
    </PageContainer>
  );
}
