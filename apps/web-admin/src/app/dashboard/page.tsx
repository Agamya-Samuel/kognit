'use client';

import { useQuery } from '@tanstack/react-query';
import { adminService } from '@edutech/api-client';
import {
  Users,
  BookOpen,
  DollarSign,
  Activity,
  CheckCircle,
  Clock,
  UserPlus,
  UserCog,
  GraduationCap,
  FileText,
  BarChart3,
  Settings,
  Inbox,
} from 'lucide-react';
import { StatCard, StatsRow } from '@/components/StatsRow';
import { RevenueChart, EngagementChart } from '@/components/charts/Charts';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

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

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const [metricsResponse, chartResponse] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getChartData()
      ]);

      return {
        totalUsers: metricsResponse.totalUsers || 0,
        activeCourses: metricsResponse.totalCourses || 0,
        revenueMTD: metricsResponse.totalRevenue || 0,
        activeNow: metricsResponse.activeUsers || 0,
        revenueData: (chartResponse || []).map((item: any) => ({
          month: item.name,
          revenue: item.revenue,
          costs: 0
        })),
        engagementData: (chartResponse || []).map((item: any) => ({
          date: item.name,
          views: item.users,
          interactions: 0
        })),
        recentActivity: [],
        pendingModeration: []
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="rounded-full bg-destructive/10 p-3 mx-auto mb-3">
            <Activity className="h-6 w-6 text-destructive" />
          </div>
          <p className="text-sm font-medium text-foreground">Failed to load dashboard</p>
          <p className="text-xs text-muted-foreground mt-1">Please try again later.</p>
        </div>
      </div>
    );
  }

  const { totalUsers, activeCourses, revenueMTD, activeNow, revenueData, engagementData, recentActivity, pendingModeration } = data || {
    totalUsers: 0,
    activeCourses: 0,
    revenueMTD: 0,
    activeNow: 0,
    revenueData: [] as RevenueDataPoint[],
    engagementData: [] as EngagementDataPoint[],
    recentActivity: [] as RecentActivityItem[],
    pendingModeration: [] as PendingModerationItem[],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and management."
      />

      <StatsRow>
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          change={{ value: '+5.2%', trend: 'up' }}
          icon={Users}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Active Courses"
          value={activeCourses.toString()}
          change={{ value: '+12', trend: 'up' }}
          icon={BookOpen}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Revenue (MTD)"
          value={`₹${revenueMTD.toLocaleString('en-IN')}`}
          change={{ value: '+22%', trend: 'up' }}
          icon={DollarSign}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Active Now"
          value={activeNow.toString()}
          icon={Activity}
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
            <CardTitle>User Engagement</CardTitle>
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
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="rounded-full bg-primary/10 p-1.5">
                      {activity.type === 'enrollment' ? (
                        <UserPlus className="h-3.5 w-3.5 text-primary" />
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
                  Platform activity will appear here once users start enrolling.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingModeration.length > 0 ? (
              <div className="space-y-4">
                {pendingModeration.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border bg-card p-3"
                  >
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{item.instructor}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {item.count} items pending
                      </span>
                      <Button size="sm" variant="default" className="h-7 text-xs">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <CheckCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">All caught up</p>
                <p className="text-xs text-muted-foreground mt-1">No items pending moderation.</p>
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
              <Link href="/dashboard/users">
                <UserCog className="h-4 w-4" />
                Manage Users
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/dashboard/instructors">
                <GraduationCap className="h-4 w-4" />
                Review Instructors
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/dashboard/courses">
                <FileText className="h-4 w-4" />
                Moderate Courses
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/dashboard/reports">
                <BarChart3 className="h-4 w-4" />
                View Reports
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
