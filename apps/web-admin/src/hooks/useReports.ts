import { useQuery } from '@tanstack/react-query';
import { adminService } from '@edutech/api-client';

export function useReports() {
  return useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      const [metrics, chartData, demographics, courseStats, revenueBreakdown] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getChartData(),
        adminService.getDemographics(),
        adminService.getCourseStats(),
        adminService.getRevenueBreakdown(),
      ]);

      return {
        metrics: {
          totalUsers: metrics?.totalUsers ?? 0,
          totalCourses: metrics?.totalCourses ?? 0,
          totalInstructors: metrics?.totalInstructors ?? 0,
          totalRevenue: metrics?.totalRevenue ?? 0,
          activeUsers: metrics?.activeUsers ?? 0,
          newUsersThisMonth: metrics?.newUsersThisMonth ?? 0,
          completedCourses: metrics?.completedCourses ?? 0,
          pendingApprovals: metrics?.pendingApprovals ?? 0,
        },
        chartData: chartData ?? [],
        demographics: {
          students: demographics?.students ?? 0,
          instructors: demographics?.instructors ?? 0,
          admins: demographics?.admins ?? 0,
        },
        courseStats: {
          active: courseStats?.active ?? 0,
          draft: courseStats?.draft ?? 0,
          archived: courseStats?.archived ?? 0,
        },
        revenueBreakdown: {
          course_sales: revenueBreakdown?.course_sales ?? 0,
          subscriptions: revenueBreakdown?.subscriptions ?? 0,
          other: revenueBreakdown?.other ?? 0,
        },
      };
    },
  });
}
