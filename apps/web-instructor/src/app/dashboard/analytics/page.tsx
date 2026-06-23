'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Users, DollarSign, BookOpen, TrendingUp, AlertCircle } from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/useCourses';
import { useInstructorAnalytics } from '@/hooks/useCourses';
import { useInstructorChartData } from '@/hooks/useInstructorChartData';
import { StatCard, StatsRow } from '@/components/StatsRow';
import dynamic from 'next/dynamic';

// Heavy recharts components — loaded client-side only to reduce initial bundle
const RevenueChart = dynamic(
  () => import('@/components/charts/Charts').then(m => m.RevenueChart),
  { ssr: false, loading: () => <div className="h-[350px] flex items-center justify-center text-muted-foreground">Loading chart…</div> },
);
const EnrollmentChart = dynamic(
  () => import('@/components/charts/Charts').then(m => m.EnrollmentChart),
  { ssr: false, loading: () => <div className="h-[350px] flex items-center justify-center text-muted-foreground">Loading chart…</div> },
);
const EngagementChart = dynamic(
  () => import('@/components/charts/Charts').then(m => m.EngagementChart),
  { ssr: false, loading: () => <div className="h-[350px] flex items-center justify-center text-muted-foreground">Loading chart…</div> },
);
const ProgressChart = dynamic(
  () => import('@/components/charts/Charts').then(m => m.ProgressChart),
  { ssr: false, loading: () => <div className="h-[350px] flex items-center justify-center text-muted-foreground">Loading chart…</div> },
);

export default function AnalyticsPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: analytics, isLoading: analyticsLoading } = useInstructorAnalytics();
  const { data: chartData, isLoading: chartLoading } = useInstructorChartData();

  const isLoading = metricsLoading || analyticsLoading || chartLoading;

  const metricsData = {
    totalStudents: metrics?.totalStudents ?? 0,
    activeCourses: metrics?.activeCourses ?? 0,
    totalRevenue: metrics?.totalRevenue ?? 0,
    upcomingClasses: metrics?.upcomingClasses ?? 0,
  };

  // Transform chart API data for revenue chart
  const revenueData = useMemo(() => {
    if (!Array.isArray(chartData) || chartData.length === 0) return [];
    return chartData.map((item) => ({
      month: new Date(item.name).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: item.revenue,
      costs: 0,
    }));
  }, [chartData]);

  // Derive enrollment data from per-course analytics
  const enrollmentData = useMemo(() => {
    if (!analytics?.courseAnalytics || analytics.courseAnalytics.length === 0) return [];
    return analytics.courseAnalytics.map((course) => ({
      month: course.courseTitle.length > 12 ? course.courseTitle.slice(0, 12) + '…' : course.courseTitle,
      enrolled: course.enrollmentCount,
      completed: Math.round((course.enrollmentCount * course.completionRate) / 100),
    }));
  }, [analytics]);

  // Use chart data for engagement (users = views, derive interactions)
  const engagementData = useMemo(() => {
    if (!Array.isArray(chartData) || chartData.length === 0) return [];
    return chartData.map((item) => ({
      date: new Date(item.name).toLocaleDateString('en-US', { weekday: 'short' }),
      views: item.users,
      interactions: Math.round(item.users * 0.6),
    }));
  }, [chartData]);

  // Course performance from analytics overview
  const coursePerformanceData = useMemo(() => {
    if (!analytics?.courseAnalytics || analytics.courseAnalytics.length === 0) return [];
    return analytics.courseAnalytics.map((course) => ({
      name: course.courseTitle.length > 20 ? course.courseTitle.slice(0, 20) + '…' : course.courseTitle,
      value: course.completionRate,
    }));
  }, [analytics]);

  const hasChartData = revenueData.length > 0 || engagementData.length > 0;
  const hasCourseData = enrollmentData.length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Track your course performance and student engagement
        </p>
      </div>

      <StatsRow>
        <StatCard
          title="Total Students"
          value={metricsData.totalStudents.toLocaleString()}
          icon={Users}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Active Courses"
          value={metricsData.activeCourses.toString()}
          icon={BookOpen}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${metricsData.totalRevenue.toLocaleString('en-IN')}`}
          icon={DollarSign}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Avg. Completion"
          value={`${analytics?.averageCompletionRate ?? 0}%`}
          icon={TrendingUp}
          iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
        />
      </StatsRow>

      {!hasChartData && !hasCourseData ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No analytics data yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Analytics will appear here once students start enrolling in your courses and generating activity data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueData.length > 0 ? (
                <RevenueChart data={revenueData} />
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
                  <DollarSign className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No revenue data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Enrollment by Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enrollmentData.length > 0 ? (
                <EnrollmentChart data={enrollmentData} />
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
                  <Users className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No enrollment data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Student Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {engagementData.length > 0 ? (
                <EngagementChart data={engagementData} />
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No engagement data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Completion Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {coursePerformanceData.length > 0 ? (
                <ProgressChart data={coursePerformanceData} />
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
                  <BookOpen className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">No course performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
