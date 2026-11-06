import axios, { type AxiosInstance, AxiosError } from 'axios';

export type {
  BackendStudent,
  BackendCompany,
  BackendOpportunity,
  BackendApplication,
  BackendConversation,
  BackendMessage,
  BackendNotification,
  Pagination,
} from './types';

const TOKEN_KEY = 'skillbridge_token';
const AUTH_KEY = 'skillbridge_auth';
const ADMIN_TOKEN_KEY = 'skillbridge_admin_token';
const ADMIN_AUTH_KEY = 'skillbridge_admin_auth';

function isAdminRequest(url?: string): boolean {
  return Boolean(url && /(?:^|\/)admin(?:\/|$)/.test(url)) || window.location.pathname.startsWith('/admin');
}

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
});

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export function resolveAssetUrl(src?: string): string {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  if (src.startsWith('/')) return `${API_ORIGIN}${src}`;
  return `${API_ORIGIN}/${src}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(isAdminRequest(config.url) ? ADMIN_TOKEN_KEY : TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope>) => {
    if (error.response?.status === 401) {
      const adminRequest = isAdminRequest(error.config?.url);
      localStorage.removeItem(adminRequest ? ADMIN_TOKEN_KEY : TOKEN_KEY);
      localStorage.removeItem(adminRequest ? ADMIN_AUTH_KEY : AUTH_KEY);
      const loginPath = adminRequest ? '/admin' : '/login';
      if (window.location.pathname !== loginPath) {
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  },
);

export const setAuthToken = (token: string, role: 'student' | 'company' | 'admin') =>
  localStorage.setItem(role === 'admin' ? ADMIN_TOKEN_KEY : TOKEN_KEY, token);
export const clearAuthToken = (scope: 'admin' | 'user') =>
  localStorage.removeItem(scope === 'admin' ? ADMIN_TOKEN_KEY : TOKEN_KEY);

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: { field: string; message: string }[];
}

export class ApiError extends Error {
  status: number;
  errors?: { field: string; message: string }[];

  constructor(message: string, status: number, errors?: { field: string; message: string }[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function normalizeError(err: unknown): ApiError {
  if (err instanceof AxiosError) {
    const data = err.response?.data;
    if (data?.message) {
      return new ApiError(data.message, err.response?.status ?? 500, data.errors);
    }
    if (err.code === 'ECONNABORTED') {
      return new ApiError('Request timed out. Please try again.', 408);
    }
    if (!err.response) {
      return new ApiError('Network error. Please check your connection.', 0);
    }
    return new ApiError('Something went wrong. Please try again.', err.response.status);
  }
  if (err instanceof Error) {
    return new ApiError(err.message, 500);
  }
  return new ApiError('An unexpected error occurred.', 500);
}
