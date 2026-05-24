import { getApiClient } from '../index';

export const adminService = {
  async getInstructors(filters?: Record<string, unknown>) {
    return getApiClient().get<any[]>('/admin/instructors', filters);
  },

  async approveInstructor(id: number) {
    return getApiClient().patch<void>(`/admin/instructors/${id}/approve`);
  },

  async rejectInstructor(id: number, reason: string) {
    return getApiClient().patch<void>(`/admin/instructors/${id}/reject`, { reason });
  },

  async getCourses(filters?: Record<string, unknown>) {
    return getApiClient().get<any[]>('/admin/courses', filters);
  },

  async approveCourse(id: number) {
    return getApiClient().patch<void>(`/admin/courses/${id}/approve`);
  },

  async rejectCourse(id: number, reason: string) {
    return getApiClient().patch<void>(`/admin/courses/${id}/reject`, { reason });
  },

  async suspendCourse(id: number, reason: string) {
    return getApiClient().patch<void>(`/admin/courses/${id}/suspend`, { reason });
  },

  async getUsers(filters?: Record<string, unknown>) {
    return getApiClient().get<any[]>('/admin/users', filters);
  },
};