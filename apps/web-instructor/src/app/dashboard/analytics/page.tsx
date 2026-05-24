'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Users, DollarSign, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/useCourses';
import { StatCard, StatsRow } from '@/components/StatsRow';
import { RevenueChart, EnrollmentChart, EngagementChart, ProgressChart } from '@/components/charts/Charts';

export default function AnalyticsPage() {
  const { data: metrics, isLoading } = useDashboardMetrics();

  const metricsData = metrics || {
    totalStudents: 0,
    activeCourses: 0,
    totalRevenue: 0,
    upcomingClasses: 0,
  };

  const revenueData = [
    { month: 'Jan', revenue: 45000, costs: 32000 },
    { month: 'Feb', revenue: 52000, costs: 35000 },
    { month: 'Mar', revenue: 61000, costs: 38000 },
    { month: 'Apr', revenue: 58000, costs: 36000 },
    { month: 'May', revenue: 72000, costs: 42000 },
    { month: 'Jun', revenue: 85000, costs: 48000 },
  ];

  const enrollmentData = [
    { month: 'Jan', enrolled: 120, completed: 45 },
    { month: 'Feb', enrolled: 145, completed: 62 },
    { month: 'Mar', enrolled: 168, completed: 78 },
    { month: 'Apr', enrolled: 152, completed: 85 },
    { month: 'May', enrolled: 189, completed: 98 },
    { month: 'Jun', enrolled: 210, completed: 112 },
  ];

  const engagementData = [
    { date: 'Mon', views: 2400, interactions: 1800 },
    { date: 'Tue', views: 2100, interactions: 1600 },
    { date: 'Wed', views: 3200, interactions: 2400 },
    { date: 'Thu', views: 2800, interactions: 2200 },
    { date: 'Fri', views: 3600, interactions: 2800 },
    { date: 'Sat', views: 1900, interactions: 1200 },
    { date: 'Sun', views: 1600, interactions: 1100 },
  ];

  const coursePerformanceData = [
    { name: 'TypeScript Basics', value: 78 },
    { name: 'React Patterns', value: 92 },
    { name: 'Node.js Fundamentals', value: 65 },
    { name: 'Advanced React', value: 88 },
    { name: 'Next.js Mastery', value: 71 },
  ];

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
          change={{ value: '+12%', trend: 'up' }}
          icon={Users}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Active Courses"
          value={metricsData.activeCourses.toString()}
          change={{ value: '+2', trend: 'up' }}
          icon={BookOpen}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${metricsData.totalRevenue.toLocaleString('en-IN')}`}
          change={{ value: '+18%', trend: 'up' }}
          icon={DollarSign}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Avg. Watch Time"
          value="4.5h"
          change={{ value: '+5%', trend: 'up' }}
          icon={Clock}
          iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
        />
      </StatsRow>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Enrollment Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentChart data={enrollmentData} />
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
            <EngagementChart data={engagementData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart data={coursePerformanceData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}