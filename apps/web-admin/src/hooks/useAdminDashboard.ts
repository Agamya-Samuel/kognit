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

      // Transform the raw API response into the dashboard display shape.
      // Field names here must match what dashboard/page.tsx consumes.
      return {
        totalUsers: metricsResponse.totalUsers || 0,
        activeCourses: metricsResponse.totalCourses || 0,
        revenueMTD: metricsResponse.totalRevenue || 0,
        activeNow: metricsResponse.activeUsers || 0,
        newUsersThisMonth: metricsResponse.newUsersThisMonth || 0,
        pendingApprovals: metricsResponse.pendingApprovals || 0,
        revenueData: (chartResponse || []).map((item: any) => ({
          month: new Date(item.name).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: item.revenue,
          costs: 0
        })),
        engagementData: (chartResponse || []).map((item: any) => ({
          date: new Date(item.name).toLocaleDateString('en-US', { weekday: 'short' }),
          views: item.users,
          interactions: 0
        })),
        recentActivity: metricsResponse.recentActivity || [],
        pendingModeration: metricsResponse.pendingModeration || [],
      };
    }
  });
}
