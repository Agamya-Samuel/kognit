import { getApiClient } from '../index';
import type { InstructorStudentsResponse } from '@edutech/types';

export interface InstructorDashboardMetrics {
  totalStudents: number;
  activeCourses: number;
  totalRevenue: number;
  upcomingClasses: number;
  recentActivity: Array<{
    id: number;
    type: string;
    title: string;
    time: string;
  }>;
}

export interface InstructorAnalyticsOverview {
  totalEnrollments: number;
  totalCertificates: number;
  totalRevenue: number;
  averageCompletionRate: number;
  courseAnalytics: Array<{
    courseId: number;
    courseTitle: string;
    enrollmentCount: number;
    completionRate: number;
    revenue: number;
    certificateCount: number;
  }>;
}

export interface InstructorChartDataItem {
  name: string;
  users: number;
  revenue: number;
}

export const analyticsService = {
  async getDashboardMetrics(): Promise<InstructorDashboardMetrics> {
    return getApiClient().get<InstructorDashboardMetrics>('/analytics/dashboard/metrics');
  },

  async getInstructorAnalytics(courseId?: number): Promise<InstructorAnalyticsOverview> {
    const params: Record<string, unknown> = {};
    if (courseId) params.courseId = courseId;
    return getApiClient().get<InstructorAnalyticsOverview>('/analytics/instructor', params);
  },
   
  async getInstructorStudents(filters?: Record<string, unknown>) {
    return getApiClient().get<InstructorStudentsResponse>('/courses/instructor/students', filters);
  },

  /**
   * Get chart data for instructor dashboard
   * @param days - Number of days to fetch data for (default: 30)
   * @returns Chart data array with name, users, and revenue
   */
  async getInstructorChartData(days?: number): Promise<InstructorChartDataItem[]> {
    return getApiClient().get<InstructorChartDataItem[]>(`/analytics/instructor/charts`, { days: days || 30 });
  },
};