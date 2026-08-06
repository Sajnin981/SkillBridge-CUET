import type { Notification, Role } from '@/lib/types';

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const messageService = {
  async getNotifications(_role: Role): Promise<Notification[]> {
    await delay(200);
    return [];
  },

  async getConversations(_role: Role): Promise<{ id: string; name: string; avatar: string; role: string; last: string; time: string; unread: number; online: boolean }[]> {
    await delay();
    return [];
  },

  async getMessages(_conversationId: string): Promise<{ id: string; from: 'me' | 'them'; text: string; time: string }[]> {
    await delay();
    return [];
  },
};
