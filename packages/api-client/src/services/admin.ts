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

  async getUsers(filters?: Record<string, unknown>): Promise<{ users: any[]; total: number; page: number; limit: number }> {
    return getApiClient().get<{ users: any[]; total: number; page: number; limit: number }>('/admin/users', filters);
  },

  async toggleUserActive(id: number) {
    return getApiClient().patch<void>(`/admin/users/${id}/toggle-active`);
  },

  async updateUserRole(id: number, role: string) {
    return getApiClient().patch<void>(`/admin/users/${id}/role`, { role });
  },

  async deleteUser(id: number) {
    return getApiClient().delete<void>(`/admin/users/${id}`);
  },

  async getAssignments(filters?: Record<string, unknown>) {
    return getApiClient().get<{ assignments: any[]; total: number; page: number; limit: number }>('/admin/assignments', filters);
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

   async getInstitutions(filters?: { page?: number; limit?: number; search?: string }) {
     return getApiClient().get<any>('/admin/institutions', filters);
   },

   async getInstitution(id: number) {
     return getApiClient().get<any>(`/admin/institutions/${id}`);
   },

  async importStudents(institutionId: number, students: { name: string; email: string }[]) {
    return getApiClient().post<{ successCount: number; failureCount: number; errors: { row: number; email: string; reason: string }[] }>(`/admin/institutions/${institutionId}/students/import`, { students });
  },

  async getSettings() {
    return getApiClient().get<Record<string, string>>('/admin/settings');
  },

  async updateSettings(settings: Record<string, string>) {
    return getApiClient().patch<void>('/admin/settings', settings);
  },

  async getNotificationConfig() {
    return getApiClient().get<any>('/admin/notifications/config');
  },

  async getUserNotificationPreferences(userId: number) {
    return getApiClient().get<any>(`/admin/notifications/users/${userId}/preferences`);
  },

  async updateUserNotificationPreferences(userId: number, preferences: Record<string, unknown>) {
    return getApiClient().patch<any>(`/admin/notifications/users/${userId}/preferences`, preferences);
  },

  async getDatabaseStats() {
    return getApiClient().get<{
      databaseSize: { bytes: number; pretty: string };
      tableCount: number;
      tables: { name: string; rowCount: number; sizeBytes: number; sizePretty: string }[];
      connectionPool: { active: number; idle: number; total: number; maxPool: number };
    }>('/admin/database-stats');
  },
};