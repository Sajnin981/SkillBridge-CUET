import type { Notification, Role } from '@/lib/types';

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const notificationService = {
  async getAll(_role: Role): Promise<Notification[]> {
    await delay();
    return [];
  },

  async markAllRead(): Promise<void> {
    await delay(100);
  },

  async toggleRead(_id: string): Promise<void> {
    await delay(100);
  },
};
