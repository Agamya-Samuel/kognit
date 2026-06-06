import { getApiClient } from '../index';
import type { DashboardMetrics, InstructorStudentsResponse, ChartData } from '@edutech/types';

export const analyticsService = {
  async getDashboardMetrics() {
    return getApiClient().get<DashboardMetrics>('/analytics/dashboard/metrics');
  },
   
  async getInstructorStudents(filters?: Record<string, unknown>) {
    return getApiClient().get<InstructorStudentsResponse>('/courses/instructor/students', filters);
  },

  /**
   * Get chart data for instructor dashboard
   * @param days - Number of days to fetch data for (default: 30)
   * @returns Chart data array with name, users, and revenue
   */
  async getInstructorChartData(days?: number) {
    return getApiClient().get<ChartData[]>(`/analytics/instructor/charts`, { days: days || 30 });
  },
};