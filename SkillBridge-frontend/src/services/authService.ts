import type { Role } from '@/lib/types';
import { api, setAuthToken, clearAuthToken, type ApiEnvelope } from '@/api/axios';
import type { BackendStudent, BackendCompany, BackendAdmin, BackendRole } from '@/api/types';
import { mapStudent, mapStudentProfile, mapCompanyUser, mapAdmin } from '@/api/mappers';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  status?: string;
}

const STORAGE_KEY = 'skillbridge_auth';

interface LoginResponse {
  user: BackendStudent | BackendCompany | BackendAdmin;
  token: string;
  role: BackendRole;
}

function normalizePhone(value: string): string {
  const digitsOnly = value.replace(/\D/g, '');
  return value.includes('+') ? `+${digitsOnly}` : digitsOnly;
}

function mapBackendUser(user: BackendStudent | BackendCompany | BackendAdmin, role: BackendRole): AuthUser {
  if (role === 'student') return mapStudent(user as BackendStudent);
  if (role === 'company') return mapCompanyUser(user as BackendCompany);
  return mapAdmin(user as BackendAdmin);
}

export const authService = {
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put<ApiEnvelope>('/auth/password', { currentPassword, newPassword });
  },

  async login(email: string, password: string, role: Role): Promise<AuthUser> {
    const res = await api.post<ApiEnvelope<LoginResponse>>('/auth/login', { email, password, role });
    const { user, token, role: backendRole } = res.data.data;
    setAuthToken(token);
    const mapped = mapBackendUser(user, backendRole);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
    return mapped;
  },

  async registerStudent(data: {
    fullName: string;
    email: string;
    studentId: string;
    department: string;
    batch: string;
    phone: string;
    password: string;
    idCard: File;
    resume?: File;
  }): Promise<AuthUser> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'phone') {
        formData.append(key, normalizePhone(String(value)));
        return;
      }
      if (value instanceof File) formData.append(key, value);
      else if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    const res = await api.post<ApiEnvelope<LoginResponse & { student?: BackendStudent; company?: BackendCompany }>>('/auth/student/register', formData);
    const user = res.data.data.user || res.data.data.student!;
    const backendRole = res.data.data.role || 'student';
    return mapBackendUser(user, backendRole);
  },

  async registerCompany(data: {
    companyName: string;
    hrName: string;
    email: string;
    phone: string;
    website?: string;
    industry: string;
    address: string;
    password: string;
    tradeLicense: File;
    logo?: File;
  }): Promise<AuthUser> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'phone') {
        formData.append(key, normalizePhone(String(value)));
        return;
      }
      if (value instanceof File) formData.append(key, value);
      else if (value !== undefined && value !== null) formData.append(key, String(value));
    });
    const res = await api.post<ApiEnvelope<LoginResponse & { student?: BackendStudent; company?: BackendCompany }>>('/auth/company/register', formData);
    const user = res.data.data.user || res.data.data.company!;
    const backendRole = res.data.data.role || 'company';
    return mapBackendUser(user, backendRole);
  },

  async getMe(): Promise<AuthUser | null> {
    try {
      const res = await api.get<ApiEnvelope<{ user: BackendStudent | BackendCompany | BackendAdmin; role: BackendRole }>>('/auth/me');
      const { user, role } = res.data.data;
      const mapped = mapBackendUser(user, role);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      return mapped;
    } catch {
      return null;
    }
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
    clearAuthToken();
    localStorage.removeItem(STORAGE_KEY);
  },

  dashboardPath(role: Role): string {
    return `/${role}`;
  },
};

export { mapStudentProfile };
