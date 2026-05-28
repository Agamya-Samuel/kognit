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

  async getAssignments(filters?: Record<string, unknown>) {
    return getApiClient().get<any[]>('/admin/assignments', filters);
  },

  async deleteAssignment(id: number) {
    return getApiClient().delete<void>(`/admin/assignments/${id}`);
  },

  async getDashboardMetrics() {
    return getApiClient().get<any>('/admin/dashboard/metrics');
  },

   async getChartData(days?: number) {
     return getApiClient().get<any[]>('/admin/dashboard/chart', { days: days || 30 });
   },

   async getDemographics() {
     return getApiClient().get<any>('/admin/dashboard/demographics');
   },

   async getCourseStats() {
     return getApiClient().get<any>('/admin/dashboard/course-stats');
   },

   async getRevenueBreakdown() {
     return getApiClient().get<any>('/admin/dashboard/revenue-breakdown');
   },
 };