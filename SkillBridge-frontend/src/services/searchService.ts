import { api, type ApiEnvelope } from '@/api/axios';
import type { BackendCompany, BackendStudent } from '@/api/types';

export interface SearchResult {
  students: BackendStudent[];
  companies: BackendCompany[];
}

export const searchService = {
  async search(q: string): Promise<SearchResult> {
    const res = await api.get<ApiEnvelope<SearchResult>>('/search', { params: { q } });
    return res.data.data;
  },
};
