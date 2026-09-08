import { api, type ApiEnvelope, type BackendCompany, type BackendCompanySettings, type BackendOpportunity, type Pagination } from '@/api/axios';
import { mapCompany, mapOpportunity } from '@/api/mappers';
import type { Company, Opportunity } from '@/lib/types';

interface PaginatedOpps {
  items: BackendOpportunity[];
  pagination: Pagination;
}

export interface CompanyAnalytics {
  totalOpportunities: number;
  totalApplications: number;
  newApplicants: number;
  shortlisted: number;
  rejected: number;
}

export const companyService = {
  async getProfile(): Promise<Company | null> {
    const res = await api.get<ApiEnvelope<{ company: BackendCompany }>>('/company/profile');
    return mapCompany(res.data.data.company);
  },

  async getRawProfile(): Promise<BackendCompany | null> {
    const res = await api.get<ApiEnvelope<{ company: BackendCompany }>>('/company/profile');
    return res.data.data.company;
  },

  async updateProfile(data: Partial<BackendCompany>): Promise<Company> {
    const res = await api.put<ApiEnvelope<{ company: BackendCompany }>>('/company/profile', data);
    return mapCompany(res.data.data.company);
  },

  async getSettings(): Promise<BackendCompanySettings> {
    const res = await api.get<ApiEnvelope<{ settings: BackendCompanySettings }>>('/company/settings');
    return res.data.data.settings;
  },

  async updateSettings(settings: BackendCompanySettings): Promise<BackendCompanySettings> {
    const res = await api.put<ApiEnvelope<{ settings: BackendCompanySettings }>>('/company/settings', settings);
    return res.data.data.settings;
  },

  async createOpportunity(data: Partial<BackendOpportunity>): Promise<Opportunity> {
    const res = await api.post<ApiEnvelope<{ opportunity: BackendOpportunity }>>('/company/opportunities', data);
    return mapOpportunity(res.data.data.opportunity);
  },

  async listMyOpportunities(): Promise<Opportunity[]> {
    const res = await api.get<ApiEnvelope<PaginatedOpps>>('/company/opportunities');
    return res.data.data.items.map(mapOpportunity);
  },

  async updateOpportunity(id: string, data: Partial<BackendOpportunity>): Promise<Opportunity> {
    const res = await api.put<ApiEnvelope<{ opportunity: BackendOpportunity }>>(`/company/opportunities/${id}`, data);
    return mapOpportunity(res.data.data.opportunity);
  },

  async deleteOpportunity(id: string): Promise<void> {
    await api.delete<ApiEnvelope>(`/company/opportunities/${id}`);
  },

  async getApplicantCount(opportunityId: string) {
    const res = await api.get<ApiEnvelope<{ opportunityId: string; total: number; byStatus: Record<string, number> }>>(`/company/opportunities/${opportunityId}/applicants-count`);
    return res.data.data;
  },

  async getAnalytics(): Promise<CompanyAnalytics> {
    const res = await api.get<ApiEnvelope<{
      opportunities: { total: number; active: number };
      applications: { total: number; byStatus: Record<string, number> };
    }>>('/company/analytics');
    const { opportunities, applications } = res.data.data;
    return {
      totalOpportunities: opportunities.active,
      totalApplications: applications.total,
      newApplicants: applications.byStatus.pending || 0,
      shortlisted: applications.byStatus.shortlisted || 0,
      rejected: applications.byStatus.rejected || 0,
    };
  },

  async getAll(params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<Company[]> {
    const res = await api.get<ApiEnvelope<{ items: BackendCompany[]; pagination: Pagination }>>('/admin/users', { params: { role: 'company', ...params } });
    return res.data.data.items.map(mapCompany);
  },

  async getVerified(): Promise<Company[]> {
    const res = await api.get<ApiEnvelope<{ items: BackendCompany[]; pagination: Pagination }>>('/companies', { params: { limit: 100 } });
    return res.data.data.items.map(mapCompany);
  },

  async getById(id: string): Promise<Company | null> {
    const res = await api.get<ApiEnvelope<{ company: BackendCompany }>>('/companies/' + id);
    return mapCompany(res.data.data.company);
  },

  async getPending(): Promise<Company[]> {
    const res = await api.get<ApiEnvelope<{ items: BackendCompany[]; pagination: Pagination }>>('/admin/verifications', { params: { role: 'company', status: 'pending' } });
    return res.data.data.items.map(mapCompany);
  },

  async approve(id: string): Promise<void> {
    await api.patch<ApiEnvelope>(`/admin/verifications/company/${id}/approve`);
  },

  async reject(id: string, reason?: string): Promise<void> {
    await api.patch<ApiEnvelope>(`/admin/verifications/company/${id}/reject`, { reason: reason || '' });
  },
};
