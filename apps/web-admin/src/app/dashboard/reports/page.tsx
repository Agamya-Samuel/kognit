'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Users, BookOpen, Award, TrendingUp, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { useReports } from '@/hooks/useReports';

export default function ReportsPage() {
  const { data, isLoading: loading, error: queryError } = useReports();
  const error = queryError ? 'Failed to load reports data. Please try again.' : null;

  const metrics = data?.metrics ?? {
    totalUsers: 0,
    totalCourses: 0,
    totalInstructors: 0,
    totalRevenue: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    completedCourses: 0,
    pendingApprovals: 0,
  };
  const chartData = data?.chartData ?? [];
  const demographics = data?.demographics ?? { students: 0, instructors: 0, admins: 0 };
  const courseStats = data?.courseStats ?? { active: 0, draft: 0, archived: 0 };
  const revenueBreakdown = data?.revenueBreakdown ?? { course_sales: 0, subscriptions: 0, other: 0 };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const MetricCard = ({ title, value, icon: Icon, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    subtitle?: string;
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-card-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="h-12 w-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MetricCardSkeleton = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-8 w-16 rounded bg-muted animate-pulse" />
            <div className="h-3 w-28 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );

  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    const data = chartData.slice(-7);
    const maxUsers = Math.max(1, ...data.map((d) => d.users));
    const maxRevenue = Math.max(1, ...data.map((d) => d.revenue));

    if (data.length === 0) {
      return (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <TrendingUp className="h-8 w-8 opacity-40" />
          <p className="text-sm">No chart data available</p>
        </div>
      );
    }

    return (
      <div className="h-64">
        <div className="flex items-end justify-between h-full px-4">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-end justify-center w-full gap-1 mb-2">
                <div
                  className="w-3 bg-primary rounded-t min-h-[2px] transition-all"
                  style={{ height: `${(item.users / maxUsers) * 80}%` }}
                />
                <div
                  className="w-3 bg-emerald-500 rounded-t min-h-[2px] transition-all"
                  style={{ height: `${(item.revenue / maxRevenue) * 80}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(item.name).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded" />
            <span className="text-xs text-muted-foreground">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics & Reports"
          description="Monitor platform performance and user engagement"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <AlertCircle className="h-10 w-10 text-destructive opacity-60" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        description="Monitor platform performance and user engagement"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              title="Total Users"
              value={formatNumber(metrics.totalUsers)}
              icon={Users}
              subtitle={metrics.newUsersThisMonth > 0 ? `+${metrics.newUsersThisMonth} new this period` : 'No new users this period'}
            />
            <MetricCard
              title="Total Courses"
              value={formatNumber(metrics.totalCourses)}
              icon={BookOpen}
              subtitle={metrics.totalCourses > 0 ? `${metrics.totalCourses} total on platform` : 'No courses yet'}
            />
            <MetricCard
              title="Total Revenue"
              value={formatCurrency(metrics.totalRevenue)}
              icon={DollarSign}
              subtitle={metrics.totalRevenue > 0 ? 'All-time platform revenue' : 'No revenue yet'}
            />
            <MetricCard
              title="Active Users"
              value={formatNumber(metrics.activeUsers)}
              icon={TrendingUp}
              subtitle={metrics.activeUsers > 0 ? `${metrics.activeUsers} currently active` : 'No active users'}
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              User Growth (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderChart()}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      New users registered
                    </p>
                    <p className="text-xs text-muted-foreground">Today</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-card-foreground tabular-nums">
                  +{metrics.newUsersThisMonth}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Courses completed
                    </p>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-card-foreground tabular-nums">
                  {metrics.completedCourses}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Award className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      Pending approvals
                    </p>
                    <p className="text-xs text-muted-foreground">Requires attention</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-card-foreground tabular-nums">
                  {metrics.pendingApprovals}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      New instructors
                    </p>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-card-foreground tabular-nums">
                  +{metrics.totalInstructors}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Students', value: demographics.students },
                { label: 'Instructors', value: demographics.instructors },
                { label: 'Admins', value: demographics.admins },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-card-foreground tabular-nums">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Active Courses', value: courseStats.active },
                { label: 'Draft Courses', value: courseStats.draft },
                { label: 'Archived Courses', value: courseStats.archived },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-card-foreground tabular-nums">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Course Sales', value: revenueBreakdown.course_sales },
                { label: 'Subscriptions', value: revenueBreakdown.subscriptions },
                { label: 'Other', value: revenueBreakdown.other },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium text-card-foreground tabular-nums">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
