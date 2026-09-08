import { api, type ApiEnvelope } from '@/api/axios';

export interface FAQItem {
  _id: string;
  question: string;
  answer: string;
}

export const faqService = {
  async getPublished(): Promise<FAQItem[]> {
    const res = await api.get<ApiEnvelope<{ items: FAQItem[] }>>('/faqs');
    return res.data.data.items;
  },
};