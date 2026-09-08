import { useEffect, useState } from 'react';
import { GraduationCap, Trash2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { SearchBar } from '@/components/shared/SearchBar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { adminService } from '@/services/adminService';
import { normalizeError } from '@/api/axios';
import type { BackendStudent } from '@/api/types';
import { Button } from '@/components/ui/Button';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<BackendStudent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    adminService.listUsers('student', { limit: 100, search: search || undefined })
      .then((response) => setStudents(response.items))
      .catch((err) => setError(normalizeError(err).message))
      .finally(() => setLoading(false));
  }, [search]);

  const filtered = students;

  const deleteStudent = async (student: BackendStudent) => {
    if (!window.confirm(`Delete ${student.fullName}? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser('student', student._id);
      setStudents((items) => items.filter((item) => item._id !== student._id));
    } catch (err) {
      setError(normalizeError(err).message);
    }
  };

  return <PageContainer>
    <div className="mb-6"><h2 className="font-display text-2xl font-bold text-ink-800">Students</h2><p className="mt-1 text-sm text-ink-500">Manage registered student accounts and verification status.</p></div>
    <div className="mb-5"><SearchBar value={search} onChange={setSearch} placeholder="Search students…" /></div>
    {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div> : error ? <div className="card p-6 text-center text-sm text-danger-600">{error}</div> : filtered.length === 0 ? <div className="card"><EmptyState icon={<GraduationCap className="h-7 w-7" />} title="No students found" description="Registered students will appear here." /></div> : <div className="card overflow-hidden p-0"><table className="w-full"><thead className="border-b border-ink-100 bg-ink-50"><tr className="text-left text-xs font-semibold uppercase tracking-wider text-ink-400"><th className="px-4 py-3">Student</th><th className="hidden px-4 py-3 sm:table-cell">Department</th><th className="px-4 py-3">Status</th><th className="hidden px-4 py-3 sm:table-cell">Registered</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-ink-50">{filtered.map((student) => <tr key={student._id}><td className="px-4 py-3"><p className="text-sm font-semibold text-ink-800">{student.fullName}</p><p className="text-xs text-ink-400">{student.email} · {student.studentId}</p></td><td className="hidden px-4 py-3 text-sm text-ink-600 sm:table-cell">{student.department} · Batch {student.batch}</td><td className="px-4 py-3"><Badge tone={student.status === 'approved' ? 'success' : student.status === 'rejected' ? 'danger' : 'warning'}>{student.status}</Badge></td><td className="hidden px-4 py-3 text-sm text-ink-500 sm:table-cell">{new Date(student.createdAt).toLocaleDateString()}</td><td className="px-4 py-3"><Button variant="ghost" size="icon" onClick={() => deleteStudent(student)} aria-label={`Delete ${student.fullName}`}><Trash2 className="h-4 w-4 text-danger-500" /></Button></td></tr>)}</tbody></table></div>}
  </PageContainer>;
}