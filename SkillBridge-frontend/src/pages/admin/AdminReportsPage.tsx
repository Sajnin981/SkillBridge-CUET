import { Flag, Download } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminReportsPage() {
  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-800">Reports</h2>
          <p className="mt-1 text-sm text-ink-500">User-submitted reports and moderation queue.</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4" />Export</Button>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <Card className="text-center"><p className="text-2xl font-bold text-warning-600">0</p><p className="text-xs text-ink-400">Pending</p></Card>
        <Card className="text-center"><p className="text-2xl font-bold text-success-600">0</p><p className="text-xs text-ink-400">Resolved</p></Card>
        <Card className="text-center"><p className="text-2xl font-bold text-ink-800">0</p><p className="text-xs text-ink-400">Total</p></Card>
      </div>

      <div className="card"><EmptyState icon={<Flag className="h-7 w-7" />} title="No reports submitted" description="User-submitted reports will appear here for moderation when they come in." /></div>
    </PageContainer>
  );
}
