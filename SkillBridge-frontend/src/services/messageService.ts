import { api, type ApiEnvelope, type BackendConversation, type BackendMessage, type Pagination } from '@/api/axios';
import { mapConversation, mapMessage } from '@/api/mappers';
import type { Role } from '@/lib/types';

interface ConvList { items: BackendConversation[] }
interface MsgList { items: BackendMessage[]; pagination: Pagination }

export const messageService = {
  async getConversations(role: Role): Promise<{ id: string; name: string; avatar: string; role: string; last: string; time: string; unread: number; online: boolean }[]> {
    void role;
    const res = await api.get<ApiEnvelope<ConvList>>('/messages/conversations');
    return res.data.data.items.map(mapConversation);
  },

  async startConversation(data: { companyId?: string; studentId?: string; opportunityId?: string }) {
    const res = await api.post<ApiEnvelope<{ conversation: BackendConversation }>>('/messages/conversations', data);
    return res.data.data.conversation;
  },

  async getMessages(conversationId: string, userRole?: string, userId?: string, page = 1, limit = 50): Promise<{ id: string; from: 'me' | 'them'; text: string; time: string }[]> {
    const res = await api.get<ApiEnvelope<MsgList>>(`/messages/conversations/${conversationId}/messages`, { params: { page, limit } });
    return res.data.data.items.map((m) => mapMessage(m, userRole, userId));
  },

  async sendMessage(conversationId: string, content: string) {
    const res = await api.post<ApiEnvelope<{ message: BackendMessage }>>(`/messages/conversations/${conversationId}/messages`, { content });
    return res.data.data.message;
  },

  async markRead(conversationId: string) {
    await api.patch<ApiEnvelope>(`/messages/conversations/${conversationId}/read`);
  },
};
