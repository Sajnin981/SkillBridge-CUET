import { useEffect, useState } from 'react';
import { Search, Users, Eye, Ban, GraduationCap } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/shared/SearchBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { studentService } from '@/services/studentService';

interface StudentRow {
  id: string; name: string; avatar: string; email: string; department: string; cgpa: number; batch: string; status: string;
}

const statusTone: Record<string, 'success' | 'danger'> = { active: 'success', suspended: 'danger' };

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getAll().then((s) => { setStudents(s); setLoading(false); });
  }, []);

  const filtered = students.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.department.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageContainer>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink-800">Students</h2>
        <p className="mt-1 text-sm text-ink-500">{loading ? 'Loading…' : `${filtered.length} registered students`}</p>
      </div>

      <div className="mb-5"><SearchBar value={search} onChange={setSearch} className="max-w-md" /></div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={<GraduationCap className="h-7 w-7" />} title="No students found" description="Students will appear here once they register on the platform." /></div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                <th className="px-4 py-3">Student</th>
                <th className="hidden px-4 py-3 sm:table-cell">Department</th>
                <th className="hidden px-4 py-3 sm:table-cell">CGPA</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map((s) => (
                <tr key={s.id} className="transition hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{s.avatar}</div>
                      <div><p className="text-sm font-semibold text-ink-800">{s.name}</p><p className="text-xs text-ink-400">{s.email}</p></div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell"><span className="text-sm text-ink-600">{s.department} · {s.batch}</span></td>
                  <td className="hidden px-4 py-3 sm:table-cell"><span className="text-sm font-semibold text-ink-700">{s.cgpa}</span></td>
                  <td className="px-4 py-3"><Badge tone={statusTone[s.status] ?? 'success'}>{s.status}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Ban className="h-4 w-4 text-danger-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
