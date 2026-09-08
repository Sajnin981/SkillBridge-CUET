import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PageContainer } from '@/components/layout/DashboardLayout';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { adminService } from '@/services/adminService';
import type { BackendCompany, BackendStudent } from '@/api/types';

export default function AdminSearchPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<BackendStudent[]>([]);
  const [companies, setCompanies] = useState<BackendCompany[]>([]);

  const run = async () => {
    if (q.trim().length < 2) return;
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        adminService.listUsers('student', { search: q.trim(), limit: 50 }),
        adminService.listUsers('company', { search: q.trim(), limit: 50 }),
      ]);
      setStudents(s.items);
      setCompanies(c.items);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Card>
        <CardHeader title="Admin Search" subtitle="Search students and companies" />
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input" placeholder="Search by name, email, student ID, company..." />
          <Button onClick={run} disabled={loading}><Search className="h-4 w-4" />{loading ? 'Searching...' : 'Search'}</Button>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title={`Students (${students.length})`} />
          <div className="space-y-3">
            {students.map((student) => (
              <button key={student._id} onClick={() => navigate(`/admin/students`)} className="flex w-full items-center gap-3 rounded-xl border border-ink-100 p-3 text-left hover:bg-ink-50">
                <Avatar name={student.fullName} src={student.avatarUrl} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-ink-800">{student.fullName}</p>
                  <p className="text-xs text-ink-500">{student.email}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title={`Companies (${companies.length})`} />
          <div className="space-y-3">
            {companies.map((company) => (
              <button key={company._id} onClick={() => navigate(`/admin/companies`)} className="flex w-full items-center gap-3 rounded-xl border border-ink-100 p-3 text-left hover:bg-ink-50">
                <Avatar name={company.companyName} src={company.logoUrl} size="sm" className="rounded-lg" />
                <div>
                  <p className="text-sm font-semibold text-ink-800">{company.companyName}</p>
                  <p className="text-xs text-ink-500">{company.email}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
