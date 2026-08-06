import type { Company } from '@/lib/types';

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const companyService = {
  async getAll(): Promise<Company[]> {
    await delay();
    return [];
  },

  async getVerified(): Promise<Company[]> {
    await delay();
    return [];
  },

  async getById(_id: string): Promise<Company | null> {
    await delay(200);
    return null;
  },

  async getProfile(): Promise<Company | null> {
    await delay();
    return null;
  },

  async updateProfile(_data: Partial<Company>): Promise<Company> {
    await delay();
    return { id: 'c1', name: '', logo: '', industry: '', location: '', website: '', about: '', size: '', founded: '', status: 'pending', openRoles: 0, totalHires: 0, ..._data } as Company;
  },

  async getPending(): Promise<Company[]> {
    await delay();
    return [];
  },

  async approve(_id: string): Promise<void> {
    await delay();
  },

  async reject(_id: string): Promise<void> {
    await delay();
  },
};
