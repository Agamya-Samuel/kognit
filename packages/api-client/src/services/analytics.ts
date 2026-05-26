import { getApiClient } from '../index';
import type { DashboardMetrics, InstructorStudentsResponse, CreationStats } from '@edutech/types';

export const analyticsService = {
  async getDashboardMetrics() {
    return getApiClient().get<DashboardMetrics>('/analytics/dashboard/metrics');
  },
  
  async getCreationStats() {
    return getApiClient().get<CreationStats>('/analytics/instructor/creation-stats');
  },
  
  async getInstructorStudents(filters?: Record<string, unknown>) {
    return getApiClient().get<InstructorStudentsResponse>('/courses/instructor/students', filters);
  },
};