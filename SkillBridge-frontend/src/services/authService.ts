import type { Role } from '@/lib/types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
}

const STORAGE_KEY = 'skillbridge_auth';

function delay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const authService = {
  async login(email: string, _password: string, role: Role): Promise<AuthUser> {
    await delay();
    const names: Record<Role, string> = {
      student: 'Rahim Ahmed',
      company: 'Brain Station 23',
      admin: 'Admin User',
    };
    const avatars: Record<Role, string> = {
      student: 'RA',
      company: 'BS',
      admin: 'AD',
    };
    const user: AuthUser = {
      id: Math.random().toString(36).slice(2),
      name: names[role],
      email,
      avatar: avatars[role],
      role,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  async register(email: string, name: string, role: Role): Promise<AuthUser> {
    await delay();
    const avatars: Record<Role, string> = {
      student: name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'ST',
      company: name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'CO',
      admin: 'AD',
    };
    const user: AuthUser = {
      id: Math.random().toString(36).slice(2),
      name,
      email,
      avatar: avatars[role],
      role,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  dashboardPath(role: Role): string {
    return `/${role}`;
  },
};
