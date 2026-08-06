import { api, type ApiEnvelope, type BackendCompany, type BackendOpportunity, type Pagination } from '@/api/axios';
import { mapCompany, mapOpportunity } from '@/api/mappers';
import type { Company, Opportunity } from '@/lib/types';

interface PaginatedOpps {
  items: BackendOpportunity[];
  pagination: Pagination;
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

  async scheduleInterview(applicationId: string, data: { scheduledAt: string; location?: string; notes?: string }) {
    const res = await api.patch<ApiEnvelope>(`/company/applications/${applicationId}/interview`, data);
    return res.data.data;
  },

  async getAnalytics() {
    const res = await api.get<ApiEnvelope>('/company/analytics');
    return res.data.data;
  },

  async getAll(): Promise<Company[]> {
    return [];
  },

  async getVerified(): Promise<Company[]> {
    return [];
  },

  async getById(_id: string): Promise<Company | null> {
    return null;
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
