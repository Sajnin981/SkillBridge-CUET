import type { Applicant, StudentProfile } from '@/lib/types';

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const studentService = {
  async getProfile(): Promise<StudentProfile | null> {
    await delay();
    return null;
  },

  async updateProfile(_data: Partial<StudentProfile>): Promise<StudentProfile> {
    await delay();
    return {} as StudentProfile;
  },

  async getAll(): Promise<{ id: string; name: string; avatar: string; email: string; department: string; cgpa: number; batch: string; status: string }[]> {
    await delay();
    return [];
  },
};

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
    await delay();
  },

  async reject(_id: string): Promise<void> {
    await delay();
  },
};
