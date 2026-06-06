'use client';

import {
  Users,
  BookOpen,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  Video,
  BarChart3,
  UsersRound,
  Inbox,
  CalendarCheck,
} from 'lucide-react';
import { StatCard, StatsRow } from '@/components/StatsRow';
import { RevenueChart, EngagementChart } from '@/components/charts/Charts';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import Link from 'next/link';
import { useDashboardMetrics, useRecentActivity, useUpcomingClasses } from '@/hooks/useCourses';
import { useInstructorChartData } from '@/hooks/useInstructorChartData';
import { PageHeader } from '@/components/PageHeader';

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();
  const { data: upcomingClasses, isLoading: classesLoading } = useUpcomingClasses();
  const { data: chartData, isLoading: chartLoading } = useInstructorChartData();

  const metricsData = metrics || {
    totalStudents: 0,
    activeCourses: 0,
    totalRevenue: 0,
    upcomingClasses: 0,
  };

  const safeNumber = (val: number | undefined | null): number => (typeof val === 'number' ? val : 0);
  const safeChartData = Array.isArray(chartData) ? chartData : [];

  const revenueData = safeChartData.map((item: any) => ({
    month: item.name,
    revenue: item.revenue,
    costs: Math.round(item.revenue * 0.7)
  })) || [
    { month: 'Jan', revenue: 45000, costs: 32000 },
    { month: 'Feb', revenue: 52000, costs: 35000 },
    { month: 'Mar', revenue: 61000, costs: 38000 },
    { month: 'Apr', revenue: 58000, costs: 36000 },
    { month: 'May', revenue: 72000, costs: 42000 },
    { month: 'Jun', revenue: 85000, costs: 48000 },
  ];

  const engagementData = safeChartData.map((item: any) => ({
    date: item.name,
    views: item.users,
    interactions: Math.round(item.users * 0.75)
  })) || [
    { date: 'Mon', views: 2400, interactions: 1800 },
    { date: 'Tue', views: 2100, interactions: 1600 },
    { date: 'Wed', views: 3200, interactions: 2400 },
    { date: 'Thu', views: 2800, interactions: 2200 },
    { date: 'Fri', views: 3600, interactions: 2800 },
    { date: 'Sat', views: 1900, interactions: 1200 },
    { date: 'Sun', views: 1600, interactions: 1100 },
  ];

  if (metricsLoading || activityLoading || classesLoading || chartLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (metricsError) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="rounded-full bg-destructive/10 p-3 mx-auto mb-3">
            <BarChart3 className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm font-medium text-foreground">Failed to load metrics</p>
          <p className="text-xs text-muted-foreground mt-1">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back!"
        description="Here's an overview of your teaching activity."
      />

      <StatsRow>
        <StatCard
          title="Total Revenue"
          value={`₹${safeNumber(metricsData.totalRevenue).toLocaleString('en-IN')}`}
          change={{ value: '+18%', trend: 'up' }}
          icon={DollarSign}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Active Students"
          value={safeNumber(metricsData.totalStudents).toLocaleString()}
          change={{ value: '+12%', trend: 'up' }}
          icon={Users}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Active Courses"
          value={safeNumber(metricsData.activeCourses).toString()}
          change={{ value: '+2', trend: 'up' }}
          icon={BookOpen}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Upcoming Classes"
          value={safeNumber(metricsData.upcomingClasses).toString()}
          icon={Calendar}
          iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
        />
      </StatsRow>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <EngagementChart data={engagementData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="rounded-full bg-primary/10 p-1.5">
                      {activity.type === 'enrollment' ? (
                        <Users className="h-3.5 w-3.5 text-primary" />
                      ) : activity.type === 'completion' ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Inbox className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Student enrollments and completions will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingClasses && upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {upcomingClasses.slice(0, 4).map((classItem: any) => (
                  <div
                    key={classItem.id}
                    className="rounded-lg border bg-card p-3"
                  >
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {classItem.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{classItem.time}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {classItem.enrolledCount} enrolled
                      </span>
                      <Link href={`/live/${classItem.id}`}>
                        <Button size="sm" variant="default" className="h-7 text-xs">
                          Start
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <CalendarCheck className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No upcoming classes</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Schedule a live class to see it here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" className="gap-2" asChild>
              <Link href="/dashboard/courses/create">
                <Plus className="h-4 w-4" />
                Create Course
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/dashboard/schedule">
                <Video className="h-4 w-4" />
                Schedule Class
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/dashboard/analytics">
                <BarChart3 className="h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/dashboard/students">
                <UsersRound className="h-4 w-4" />
                Manage Students
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
