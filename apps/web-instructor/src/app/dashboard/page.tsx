'use client';

import { Card, CardContent, CardHeader, CardTitle, Spinner } from '@edutech/ui';
import { Users, BookOpen, DollarSign, Calendar } from 'lucide-react';
import { useDashboardMetrics, useRecentActivity, useUpcomingClasses } from '@/hooks/useCourses';
import Link from 'next/link';

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
    { label: 'Total Students', value: safeNumber(metricsData.totalStudents).toLocaleString(), icon: Users, change: '+12%' },
    { label: 'Active Courses', value: safeNumber(metricsData.activeCourses).toString(), icon: BookOpen, change: '+2' },
    { label: 'Total Revenue', value: `₹${safeNumber(metricsData.totalRevenue).toLocaleString('en-IN')}`, icon: DollarSign, change: '+18%' },
    { label: 'Upcoming Classes', value: safeNumber(metricsData.upcomingClasses).toString(), icon: Calendar, change: '' },
  ];

  if (metricsLoading || activityLoading || classesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (metricsError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">Failed to load dashboard metrics. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome back! Here's an overview of your courses and student activity.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsList.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {metric.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </div>
                {metric.change && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    {metric.change} from last month
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-start gap-3 border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Classes */}
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
                    className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {classItem.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{classItem.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {classItem.enrolledCount} enrolled
                      </span>
                      <Link href={`/live/${classItem.id}`} className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                        Start
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming classes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Link href="/dashboard/courses/create" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Create Course
            </Link>
            <Link href="/dashboard/schedule" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Schedule Class
            </Link>
            <Link href="/dashboard/analytics" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              View Analytics
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
