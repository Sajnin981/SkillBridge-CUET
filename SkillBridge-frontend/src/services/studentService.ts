import { api, type ApiEnvelope, type BackendStudent } from '@/api/axios';
import { mapStudentProfile } from '@/api/mappers';
import type { StudentProfile } from '@/lib/types';

export const studentService = {
  async getProfile(): Promise<StudentProfile | null> {
    const res = await api.get<ApiEnvelope<{ student: BackendStudent }>>('/student/profile');
    return mapStudentProfile(res.data.data.student);
  },

  async getRawProfile(): Promise<BackendStudent | null> {
    const res = await api.get<ApiEnvelope<{ student: BackendStudent }>>('/student/profile');
    return res.data.data.student;
  },

  async updateProfile(data: Partial<{
    bio: string;
    skills: string[];
    avatarUrl: string;
    education: BackendStudent['education'];
    experience: BackendStudent['experience'];
    certifications: BackendStudent['certifications'];
    achievements: BackendStudent['achievements'];
    portfolio: string[];
  }>): Promise<StudentProfile> {
    const res = await api.put<ApiEnvelope<{ student: BackendStudent }>>('/student/profile', data);
    return mapStudentProfile(res.data.data.student);
  },

  async uploadResume(file: File): Promise<{ resumeUrl: string }> {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await api.post<ApiEnvelope<{ resumeUrl: string }>>('/student/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  async getSavedOpportunities() {
    const res = await api.get<ApiEnvelope<{ items: unknown[] }>>('/student/saved-opportunities');
    return res.data.data.items;
  },

  async saveOpportunity(opportunityId: string) {
    const res = await api.post<ApiEnvelope>(`/student/saved-opportunities/${opportunityId}`);
    return res.data;
  },

  async unsaveOpportunity(opportunityId: string) {
    const res = await api.delete<ApiEnvelope>(`/student/saved-opportunities/${opportunityId}`);
    return res.data;
  },

  async getAll(): Promise<{ id: string; name: string; avatar: string; email: string; department: string; cgpa: number; batch: string; status: string }[]> {
    const res = await api.get<ApiEnvelope<{ items: BackendStudent[]; pagination: unknown }>>('/admin/users', {
      params: { role: 'student' },
    });
    return (res.data.data.items || []).map((s) => ({
      id: s._id,
      name: s.fullName,
      avatar: s.avatarUrl || s.fullName.slice(0, 2).toUpperCase(),
      email: s.email,
      department: s.department,
      cgpa: 0,
      batch: s.batch,
      status: s.status,
    }));
  },
};
