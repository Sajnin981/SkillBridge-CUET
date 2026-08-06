import type { Applicant } from '@/lib/types';

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const applicationService = {
  async getApplications(): Promise<{ id: string; status: string; stage: string; date: string; opportunityId: string }[]> {
    await delay();
    return [];
  },

  async getApplicants(_opportunityId?: string): Promise<Applicant[]> {
    await delay();
    return [];
  },

  async shortlist(_id: string): Promise<void> {
    await delay(100);
  },

  async reject(_id: string): Promise<void> {
    await delay(100);
  },
};
