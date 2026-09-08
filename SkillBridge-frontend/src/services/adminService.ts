import { api, type ApiEnvelope, type BackendCompany, type BackendOpportunity, type BackendStudent, type Pagination } from '@/api/axios';
import { mapCompany, mapOpportunity } from '@/api/mappers';
import type { Opportunity } from '@/lib/types';

interface PaginatedVerifications {
  role: string;
  items: BackendCompany[];
  pagination: Pagination;
}

interface PaginatedStudents {
  role: string;
  items: BackendStudent[];
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

type UserListParams = { status?: string; search?: string; page?: number; limit?: number };

async function listUsers(role: 'student', params?: UserListParams): Promise<PaginatedStudents>;
async function listUsers(role: 'company', params?: UserListParams): Promise<PaginatedVerifications>;
async function listUsers(role: 'student' | 'company', params?: UserListParams): Promise<PaginatedStudents | PaginatedVerifications>;
async function listUsers(role: 'student' | 'company', params?: UserListParams): Promise<PaginatedStudents | PaginatedVerifications> {
  const response = await api.get<ApiEnvelope<PaginatedStudents | PaginatedVerifications>>('/admin/users', { params: { role, ...params } });
  return response.data.data;
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
    const companiesRes = await api.get<ApiEnvelope<PaginatedVerifications>>('/admin/verifications', { params: { role: 'company', status: 'pending' } });
    const companies = companiesRes.data.data.items.map((c) => ({ ...mapCompany(c as BackendCompany), role: 'company' as const }));
    return companies;
  },

  async getPlatformActivity() {
    const res = await api.get<ApiEnvelope<AdminAnalytics>>('/admin/analytics');
    return res.data.data;
  },

  async getSystemHealth() {
    const res = await api.get<ApiEnvelope>('/../health');
    return [{ label: 'API Status', value: res.data.success ? 'Operational' : 'Unavailable', tone: res.data.success ? 'success' as const : 'warning' as const }];
  },

  async getReports(): Promise<AdminReports> {
    const res = await api.get<ApiEnvelope<AdminReports>>('/admin/reports');
    return res.data.data;
  },

  listUsers,

  async approveVerification(role: 'student' | 'company', id: string): Promise<void> {
    await api.patch<ApiEnvelope>(`/admin/verifications/${role}/${id}/approve`);
  },

  async rejectVerification(role: 'student' | 'company', id: string, reason?: string): Promise<void> {
    await api.patch<ApiEnvelope>(`/admin/verifications/${role}/${id}/reject`, { reason: reason || '' });
  },

  async deleteUser(role: 'student' | 'company', id: string): Promise<void> {
    await api.delete<ApiEnvelope>(`/admin/users/${role}/${id}`);
  },

  async deleteOpportunity(id: string): Promise<void> {
    await api.delete<ApiEnvelope>(`/admin/opportunities/${id}`);
  },

  async listAllOpportunities(params?: { page?: number; limit?: number }): Promise<Opportunity[]> {
    const res = await api.get<ApiEnvelope<PaginatedOpps>>('/opportunities', { params: { status: 'open', ...params, limit: 100 } });
    return res.data.data.items.map(mapOpportunity);
  },
};
