import { useQuery } from '@tanstack/react-query';
import { adminService } from '@edutech/api-client';

interface RevenueDataPoint {
  month: string;
  revenue: number;
  costs: number;
}

interface EngagementDataPoint {
  date: string;
  views: number;
  interactions: number;
}

interface RecentActivityItem {
  id: number;
  type: 'enrollment' | 'completion';
  title: string;
  time: string;
}

interface PendingModerationItem {
  id: number;
  title: string;
  instructor: string;
  count: number;
}

interface AdminDashboardData {
  totalUsers: number;
  activeCourses: number;
  revenueMTD: number;
  activeNow: number;
  revenueData: RevenueDataPoint[];
  engagementData: EngagementDataPoint[];
  recentActivity: RecentActivityItem[];
  pendingModeration: PendingModerationItem[];
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const [metricsResponse, chartResponse] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getChartData()
      ]);

      // Transform the API response to match the expected shape
      return {
        totalUsers: metricsResponse.data.totalUsers || 0,
        activeCourses: metricsResponse.data.activeCourses || 0,
        revenueMTD: metricsResponse.data.revenueMTD || 0,
        activeNow: metricsResponse.data.activeNow || 0,
        revenueData: chartResponse.data.map((item: any) => ({
          month: item.month,
          revenue: item.revenue,
          costs: item.costs
        })) || [],
        engagementData: chartResponse.data.map((item: any) => ({
          date: item.date,
          views: item.views,
          interactions: item.interactions
        })) || [],
        recentActivity: metricsResponse.data.recentActivity?.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          time: activity.time
        })) || [],
        pendingModeration: metricsResponse.data.pendingModeration?.map((item: any) => ({
          id: item.id,
          title: item.title,
          instructor: item.instructor,
          count: item.count
        })) || []
      };
    }
  });
}