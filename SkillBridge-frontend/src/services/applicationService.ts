import { api, type ApiEnvelope, type BackendApplication, type Pagination } from '@/api/axios';
import { mapApplicant } from '@/api/mappers';
import type { Applicant } from '@/lib/types';

interface PaginatedApps {
  items: BackendApplication[];
  pagination: Pagination;
}

export const applicationService = {
  async apply(opportunityId: string, data: { coverLetter?: string; resumeUrl?: string }, resumeFile?: File): Promise<BackendApplication> {
    let body: FormData | Record<string, unknown> = { ...data };
    let headers: Record<string, string> | undefined;
    if (resumeFile) {
      const formData = new FormData();
      if (data.coverLetter) formData.append('coverLetter', data.coverLetter);
      if (data.resumeUrl) formData.append('resumeUrl', data.resumeUrl);
      formData.append('resume', resumeFile);
      body = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    }
    const res = await api.post<ApiEnvelope<{ application: BackendApplication }>>(`/opportunities/${opportunityId}/apply`, body, { headers });
    return res.data.data.application;
  },

  async getApplications(): Promise<{ id: string; status: string; stage: string; opportunityTitle: string; companyName: string; companyLogo: string; date: string; opportunityId: string }[]> {
    const res = await api.get<ApiEnvelope<PaginatedApps>>('/applications/me');
    return res.data.data.items.map((a) => {
      const opp = typeof a.opportunity === 'object' ? a.opportunity : null;
      const comp = typeof a.company === 'object' ? a.company : null;
      return {
        id: a._id,
        status: a.status,
        stage: opp?.title || 'Application',
        opportunityTitle: opp?.title || 'Opportunity',
        companyName: comp?.companyName || 'Company',
        companyLogo: comp?.logoUrl || '',
        date: a.createdAt,
        opportunityId: opp?._id || '',
      };
    });
  },

  async getApplication(id: string): Promise<BackendApplication | null> {
    const res = await api.get<ApiEnvelope<{ application: BackendApplication }>>(`/applications/${id}`);
    return res.data.data.application;
  },

  async withdraw(id: string): Promise<void> {
    await api.delete<ApiEnvelope>(`/applications/${id}/withdraw`);
  },

  async getApplicants(opportunityId?: string): Promise<Applicant[]> {
    const url = opportunityId ? `/applications/opportunity/${opportunityId}` : '/applications/company';
    const res = await api.get<ApiEnvelope<PaginatedApps>>(url);
    return res.data.data.items.map(mapApplicant);
  },

  async updateStatus(id: string, status: string, note?: string): Promise<void> {
    await api.patch<ApiEnvelope>(`/applications/${id}/status`, { status, note });
  },

  async shortlist(id: string): Promise<void> {
    await this.updateStatus(id, 'shortlisted');
  },

  async reject(id: string): Promise<void> {
    await this.updateStatus(id, 'rejected');
  },
};
