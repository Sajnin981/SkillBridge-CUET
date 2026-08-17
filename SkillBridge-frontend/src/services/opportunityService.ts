import { api, type ApiEnvelope, type BackendOpportunity, type BackendApplication, type Pagination } from '@/api/axios';
import { mapOpportunity } from '@/api/mappers';
import type { Opportunity } from '@/lib/types';

interface PaginatedOpps {
  items: BackendOpportunity[];
  pagination: Pagination;
}

export const opportunityService = {
  async getAll(params?: { type?: string; search?: string; location?: string; isRemote?: boolean; status?: string; page?: number; limit?: number; sort?: string }): Promise<Opportunity[]> {
    const res = await api.get<ApiEnvelope<PaginatedOpps>>('/opportunities', { params });
    return res.data.data.items.map(mapOpportunity);
  },

  async getById(id: string): Promise<Opportunity | null> {
    const res = await api.get<ApiEnvelope<{ opportunity: BackendOpportunity }>>(`/opportunities/${id}`);
    return mapOpportunity(res.data.data.opportunity);
  },

  async getSaved(): Promise<Opportunity[]> {
    const res = await api.get<ApiEnvelope<{ items: BackendOpportunity[] }>>('/student/saved-opportunities');
    return res.data.data.items.map(mapOpportunity);
  },

  async getApplied(): Promise<Opportunity[]> {
    const res = await api.get<ApiEnvelope<{ items: BackendApplication[]; pagination: Pagination }>>('/applications/me', { params: { limit: 100 } });
    return res.data.data.items.map((a) => {
      const oppRef = typeof a.opportunity === 'object' ? a.opportunity : null;
      const companyRef = typeof a.company === 'object' ? a.company : null;
      return {
        id: oppRef?._id || '',
        title: oppRef?.title || '',
        company: companyRef?.companyName || '',
        companyLogo: companyRef?.logoUrl || '',
        companyId: companyRef?._id || (typeof a.company === 'string' ? a.company : ''),
        type: (oppRef?.type as Opportunity['type']) || 'Internship',
        category: (oppRef?.type as Opportunity['type']) || 'Internship',
        location: oppRef?.location || 'Remote',
        remote: false,
        salary: '—',
        stipend: '',
        experience: 'Any',
        deadline: oppRef?.deadline || '',
        postedAt: a.createdAt,
        openings: 1,
        applicants: 0,
        description: '',
        responsibilities: [],
        requirements: [],
        skills: [],
        tags: [],
        saved: false,
        applied: true,
      };
    });
  },

  async create(data: Partial<BackendOpportunity>): Promise<Opportunity> {
    const res = await api.post<ApiEnvelope<{ opportunity: BackendOpportunity }>>('/company/opportunities', data);
    return mapOpportunity(res.data.data.opportunity);
  },
};
