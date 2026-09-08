import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { PostFeed } from '@/components/shared/PostFeed';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/services/profileService';
import type { BackendStudent } from '@/api/types';

export default function ViewStudentProfilePage() {
  const { id = '' } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState<BackendStudent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    profileService.getStudentProfile(id)
      .then(setStudent)
      .catch(() => setStudent(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageContainer><SkeletonCard /></PageContainer>;
  if (!student) {
    return (
      <PageContainer>
        <Card>
          <EmptyState icon={<GraduationCap className="h-6 w-6" />} title="Student not found" description="This profile may be unavailable." />
        </Card>
      </PageContainer>
    );
  }

  const myRole = user?.role === 'company' ? 'company' : 'student';

  return (
    <PageContainer>
      <Card>
        <div className="flex items-start gap-4">
          <Avatar name={student.fullName} src={student.avatarUrl} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-ink-800">{student.fullName}</h2>
            <p className="mt-1 text-sm text-ink-500">{student.department} · Batch {student.batch}</p>
            <p className="mt-1 text-sm text-ink-500">{student.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(student.skills || []).map((skill: string) => <Badge key={skill} tone="brand">{skill}</Badge>)}
            </div>
          </div>
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Bio" />
        <p className="text-sm text-ink-700">{student.bio || 'No bio yet.'}</p>
      </Card>

      {user && (
        <div className="mt-6">
          <PostFeed
            myId={user.id}
            myRole={myRole}
            authorId={student._id}
            authorType="student"
            canCreate={false}
          />
        </div>
      )}
    </PageContainer>
  );
}
