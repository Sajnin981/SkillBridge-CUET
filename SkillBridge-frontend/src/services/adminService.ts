import { api, type ApiEnvelope, type BackendStudent, type BackendCompany, type BackendOpportunity, type Pagination } from '@/api/axios';
import { mapStudent, mapCompany, mapOpportunity } from '@/api/mappers';
import type { Company, Opportunity } from '@/lib/types';

interface PaginatedVerifications {
  role: string;
  items: BackendStudent[] | BackendCompany[];
  pagination: Pagination;
}

interface AdminAnalytics {
  students: { total: number; approved: number; pending: number };
  companies: { total: number; approved: number; pending: number };
  opportunities: { total: number; active: number; byType: Record<string, number> };
  applications: { total: number; byStatus: Record<string, number> };
}

interface AdminReports {
  totals: { students: number; companies: number; opportunities: number; applications: number };
  applicationsByStatus: Record<string, number>;
  opportunitiesByType: Record<string, number>;
}

interface PaginatedOpps {
  items: BackendOpportunity[];
  pagination: Pagination;
}

export const adminService = {
  async getStats() {
    const res = await api.get<ApiEnvelope<AdminAnalytics>>('/admin/analytics');
    const a = res.data.data;
    return {
      totalStudents: a.students.total,
      totalCompanies: a.companies.total,
      totalOpportunities: a.opportunities.total,
      pendingVerifications: a.students.pending + a.companies.pending,
    };
  },

  async getPendingVerifications() {
    const [studentsRes, companiesRes] = await Promise.all([
      api.get<ApiEnvelope<PaginatedVerifications>>('/admin/verifications', { params: { role: 'student', status: 'pending' } }),
      api.get<ApiEnvelope<PaginatedVerifications>>('/admin/verifications', { params: { role: 'company', status: 'pending' } }),
    ]);
    const students = studentsRes.data.data.items.map((s) => ({ ...mapStudent(s as BackendStudent), role: 'student' as const }));
    const companies = companiesRes.data.data.items.map((c) => ({ ...mapCompany(c as BackendCompany), role: 'company' as const }));
    return [...students, ...companies];
  },

  async getPlatformActivity() {
    const res = await api.get<ApiEnvelope<AdminAnalytics>>('/admin/analytics');
    return res.data.data;
  },

  async getSystemHealth() {
    return [
      { label: 'API Status', value: 'Operational', tone: 'success' as const },
      { label: 'Database', value: 'Operational', tone: 'success' as const },
      { label: 'AI Service', value: 'Operational', tone: 'success' as const },
    ];
  },

  async getReports(): Promise<AdminReports> {
    const res = await api.get<ApiEnvelope<AdminReports>>('/admin/reports');
    return res.data.data;
  },

  async listUsers(role: 'student' | 'company', params?: { status?: string; search?: string; page?: number; limit?: number }) {
    const res = await api.get<ApiEnvelope<PaginatedVerifications>>('/admin/users', { params: { role, ...params } });
    return res.data.data;
  },

  async approveVerification(role: 'student' | 'company', id: string): Promise<void> {
    await api.patch<ApiEnvelope>(`/admin/verifications/${role}/${id}/approve`);
  },

  async rejectVerification(role: 'student' | 'company', id: string, reason?: string): Promise<void> {
    await api.patch<ApiEnvelope>(`/admin/verifications/${role}/${id}/reject`, { reason: reason || '' });
  },

  async deleteOpportunity(id: string): Promise<void> {
    await api.delete<ApiEnvelope>(`/admin/opportunities/${id}`);
  },

  async listAllOpportunities(params?: { page?: number; limit?: number }): Promise<Opportunity[]> {
    const res = await api.get<ApiEnvelope<PaginatedOpps>>('/opportunities', { params: { status: 'open', ...params, limit: 100 } });
    return res.data.data.items.map(mapOpportunity);
  },
};
