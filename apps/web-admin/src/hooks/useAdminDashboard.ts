import { useQuery } from '@tanstack/react-query';
import { adminService } from '@edutech/api-client';

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
        totalUsers: metricsResponse.totalUsers || 0,
        activeCourses: metricsResponse.activeCourses || 0,
        revenueMTD: metricsResponse.revenueMTD || 0,
        activeNow: metricsResponse.activeNow || 0,
        revenueData: (chartResponse || []).map((item: any) => ({
          month: item.month,
          revenue: item.revenue,
          costs: item.costs
        })),
        engagementData: (chartResponse || []).map((item: any) => ({
          date: item.date,
          views: item.views,
          interactions: item.interactions
        })),
        recentActivity: metricsResponse.recentActivity?.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          time: activity.time
        })) || [],
        pendingModeration: metricsResponse.pendingModeration?.map((item: any) => ({
          id: item.id,
          title: item.title,
          instructor: item.instructor,
          count: item.count
        })) || []
      };
    }
  });
}