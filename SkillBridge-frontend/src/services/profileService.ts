import { api, type ApiEnvelope } from '@/api/axios';
import type { BackendCompany, BackendStudent } from '@/api/types';

export const profileService = {
  async getCompanyProfile(id: string): Promise<BackendCompany> {
    const res = await api.get<ApiEnvelope<{ company: BackendCompany }>>(`/profiles/companies/${id}`);
    return res.data.data.company;
  },

  async getStudentProfile(id: string): Promise<BackendStudent> {
    const res = await api.get<ApiEnvelope<{ student: BackendStudent }>>(`/profiles/students/${id}`);
    return res.data.data.student;
  },
};
