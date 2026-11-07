import { api, type ApiEnvelope, type BackendConversation, type BackendMessage, type Pagination } from '@/api/axios';
import { mapConversation, mapMessage } from '@/api/mappers';
import type { Role } from '@/lib/types';

interface ConvList { items: BackendConversation[] }
interface MsgList { items: BackendMessage[]; pagination: Pagination }
type MappedMessage = ReturnType<typeof mapMessage>;

function sortMessages(items: MappedMessage[]): MappedMessage[] {
  return items.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
}

export const messageService = {
  async getConversations(role: Role): Promise<{ id: string; name: string; avatar: string; participantPath?: string; role: string; last: string; time: string; lastMessageAt: string; unread: number; online: boolean }[]> {
    const res = await api.get<ApiEnvelope<ConvList>>('/messages/conversations');
    return res.data.data.items.map((conversation) => mapConversation(conversation, role));
  },

  async startConversation(data: { adminId?: string; companyId?: string; studentId?: string; opportunityId?: string }) {
    const res = await api.post<ApiEnvelope<{ conversation: BackendConversation }>>('/messages/conversations', data);
    return res.data.data.conversation;
  },

  async getMessages(conversationId: string, userRole?: string, userId?: string, page = 1, limit = 50): Promise<MappedMessage[]> {
    const res = await api.get<ApiEnvelope<MsgList>>(`/messages/conversations/${conversationId}/messages`, { params: { page, limit, sort: 'newest' } });
    return sortMessages(res.data.data.items.map((m) => mapMessage(m, userRole, userId)));
  },

  async getMessagesSince(conversationId: string, userRole: string, userId: string, after?: string): Promise<MappedMessage[]> {
    const items: BackendMessage[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await api.get<ApiEnvelope<MsgList>>(`/messages/conversations/${conversationId}/messages`, {
        params: { page, limit: 100, after, sort: 'oldest' },
      });
      items.push(...res.data.data.items);
      totalPages = res.data.data.pagination.totalPages;
      page += 1;
    } while (page <= totalPages);
    return sortMessages(items.map((message) => mapMessage(message, userRole, userId)));
  },

  async sendMessage(conversationId: string, content: string) {
    const res = await api.post<ApiEnvelope<{ message: BackendMessage }>>(`/messages/conversations/${conversationId}/messages`, { content });
    return res.data.data.message;
  },

  async markRead(conversationId: string) {
    await api.patch<ApiEnvelope>(`/messages/conversations/${conversationId}/read`);
  },
};
