import type { Opportunity } from '@/lib/types';

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const placeholderOpportunities: Opportunity[] = [
  { id: 'o1', title: 'Frontend Engineer Intern', company: 'Brain Station 23', companyLogo: 'BS', companyId: 'c1', type: 'Internship', category: 'Engineering', location: 'Dhaka, BD', remote: true, salary: '—', stipend: 'BDT 15,000/mo', experience: '0-1 yrs', deadline: '2026-08-15', postedAt: '2026-07-18', openings: 3, applicants: 0, description: 'Join our product engineering team to build delightful web experiences with React and TypeScript.', responsibilities: ['Build and maintain React components', 'Collaborate with designers on UI implementation'], requirements: ['Strong React fundamentals', 'Familiarity with TypeScript'], skills: ['React', 'TypeScript', 'Tailwind CSS'], tags: ['Remote', 'Mentorship'], saved: false, applied: false },
];

export const opportunityService = {
  async getAll(): Promise<Opportunity[]> {
    await delay();
    return [...placeholderOpportunities];
  },

  async getById(id: string): Promise<Opportunity | null> {
    await delay(200);
    return placeholderOpportunities.find((o) => o.id === id) ?? null;
  },

  async getSaved(): Promise<Opportunity[]> {
    await delay();
    return [];
  },

  async getApplied(): Promise<Opportunity[]> {
    await delay();
    return [];
  },

  async create(_data: Partial<Opportunity>): Promise<Opportunity> {
    await delay();
    return { ...placeholderOpportunities[0], id: Math.random().toString(36).slice(2), ..._data };
  },
};
