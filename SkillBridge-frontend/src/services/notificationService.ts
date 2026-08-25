import { api, type ApiEnvelope, type BackendNotification, type Pagination } from '@/api/axios';
import { mapNotification } from '@/api/mappers';
import type { Notification, Role } from '@/lib/types';

interface NotifList {
  items: BackendNotification[];
  unreadCount: number;
  pagination: Pagination;
}

export const notificationService = {
  async getAll(role: Role): Promise<Notification[]> {
    void role;
    const res = await api.get<ApiEnvelope<NotifList>>('/notifications');
    return res.data.data.items.map(mapNotification);
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<ApiEnvelope<NotifList>>('/notifications', { params: { unreadOnly: true, limit: 1 } });
    return res.data.data.unreadCount;
  },

  async markRead(id: string): Promise<void> {
    await api.patch<ApiEnvelope>(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.patch<ApiEnvelope>('/notifications/read-all');
  },

  async toggleRead(id: string): Promise<void> {
    await this.markRead(id);
  },
};
