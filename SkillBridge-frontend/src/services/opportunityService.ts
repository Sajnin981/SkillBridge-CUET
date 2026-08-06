import { api, type ApiEnvelope, type BackendOpportunity, type Pagination } from '@/api/axios';
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
    return [];
  },

  async create(_data: Partial<Opportunity>): Promise<Opportunity> {
    return {} as Opportunity;
  },
};
