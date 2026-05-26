import { getApiClient } from '../index';
import type { DashboardMetrics, InstructorStudentsResponse } from '@edutech/types';

export const analyticsService = {
  async getDashboardMetrics() {
    return getApiClient().get<DashboardMetrics>('/analytics/dashboard/metrics');
  },
  
  async getInstructorStudents(filters?: Record<string, unknown>) {
    return getApiClient().get<InstructorStudentsResponse>('/courses/instructor/students', filters);
  },
};