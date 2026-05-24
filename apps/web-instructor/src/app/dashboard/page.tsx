'use client';

import { MetricCard, MetricCardGrid } from '@edutech/shared-components';
import { ActivityList, QuickActions } from '@edutech/shared-components';
import { Users, BookOpen, DollarSign, Calendar } from 'lucide-react';
import { useDashboardMetrics, useRecentActivity, useUpcomingClasses } from '@/hooks/useCourses';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading, error: metricsError } = useDashboardMetrics();
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity();
  const { data: upcomingClasses, isLoading: classesLoading } = useUpcomingClasses();

  const metricsData = metrics || {
    totalStudents: 0,
    activeCourses: 0,
    totalRevenue: 0,
    upcomingClasses: 0,
  };

  const safeNumber = (val: number | undefined | null): number => (typeof val === 'number' ? val : 0);

  const metricsList = [
    { label: 'Total Students', value: safeNumber(metricsData.totalStudents).toLocaleString(), icon: Users, change: '+12%', trend: 'up' as const },
    { label: 'Active Courses', value: safeNumber(metricsData.activeCourses).toString(), icon: BookOpen, change: '+2', trend: 'up' as const },
    { label: 'Total Revenue', value: `₹${safeNumber(metricsData.totalRevenue).toLocaleString('en-IN')}`, icon: DollarSign, change: '+18%', trend: 'up' as const },
    { label: 'Upcoming Classes', value: safeNumber(metricsData.upcomingClasses).toString(), icon: Calendar, trend: 'neutral' as const },
  ];

  if (metricsLoading || activityLoading || classesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (metricsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">Failed to load dashboard metrics. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Welcome back! Here's an overview of your courses and student activity.
        </p>
      </div>

      <MetricCardGrid>
        {metricsList.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </MetricCardGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityList activities={recentActivity || []} />

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Live Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingClasses && upcomingClasses.length > 0 ? (
                upcomingClasses.map((classItem: any) => (
                  <div
                    key={classItem.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {classItem.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{classItem.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {classItem.enrolledCount} enrolled
                      </span>
                      <Link href={`/live/${classItem.id}`} className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                        Start
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming classes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <QuickActions
        actions={[
          { label: "Create Course", href: "/dashboard/courses/create", variant: "default" },
          { label: "Schedule Class", href: "/dashboard/schedule", variant: "outline" },
          { label: "View Analytics", href: "/dashboard/analytics", variant: "outline" },
        ]}
      />
    </div>
  );
}