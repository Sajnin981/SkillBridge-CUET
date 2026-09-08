import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Globe, MapPin } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { PostFeed } from '@/components/shared/PostFeed';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/services/profileService';
import type { BackendCompany } from '@/api/types';

export default function ViewCompanyProfilePage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState<BackendCompany | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    profileService.getCompanyProfile(id)
      .then(setCompany)
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageContainer><SkeletonCard /></PageContainer>;
  if (!company) {
    return (
      <PageContainer>
        <Card>
          <EmptyState icon={<Building2 className="h-6 w-6" />} title="Company not found" description="This company may be unavailable." />
        </Card>
      </PageContainer>
    );
  }

  const myRole = user?.role === 'company' ? 'company' : 'student';

  return (
    <PageContainer>
      <Card>
        <div className="flex items-start gap-4">
          <Avatar name={company.companyName} src={company.logoUrl} size="xl" className="rounded-2xl" />
          <div>
            <h2 className="text-xl font-bold text-ink-800">{company.companyName}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-ink-500"><MapPin className="h-4 w-4" />{company.address || 'N/A'}</p>
            <p className="mt-1 text-sm text-ink-500">{company.industry}</p>
            {company.website && <a href={company.website} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-2 text-sm text-brand-700 hover:underline"><Globe className="h-4 w-4" />{company.website}</a>}
          </div>
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="About" />
        <p className="text-sm text-ink-700">{company.description || 'No company description yet.'}</p>
      </Card>

      {user && (
        <div className="mt-6">
          <PostFeed
            myId={user.id}
            myRole={myRole}
            authorId={company._id}
            authorType="company"
            canCreate={false}
          />
        </div>
      )}
    </PageContainer>
  );
}
