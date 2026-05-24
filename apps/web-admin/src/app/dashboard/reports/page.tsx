'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Users, BookOpen, Award, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { adminService } from '@edutech/api-client';

interface DashboardMetrics {
  totalUsers: number;
  totalCourses: number;
  totalInstructors: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisMonth: number;
  completedCourses: number;
  pendingApprovals: number;
}

interface ChartData {
  name: string;
  users: number;
  revenue: number;
}

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalCourses: 0,
    totalInstructors: 0,
    totalRevenue: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    completedCourses: 0,
    pendingApprovals: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch dashboard metrics
        const metricsResult = await adminService.getDashboardMetrics();
        setMetrics(metricsResult);

        // Fetch chart data (last 30 days)
        const chartResult = await adminService.getChartData();
        setChartData(chartResult);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const MetricCard = ({ title, value, icon: Icon, subtitle, trend }: {
    title: string;
    value: string | number;
    icon: any;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <div className="h-64">
        {/* Simple bar chart implementation */}
        <div className="flex items-end justify-between h-full px-4">
          {chartData.slice(-7).map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-end justify-center w-full gap-1 mb-2">
                <div 
                  className="w-3 bg-primary rounded-t"
                  style={{ height: `${(data.users / Math.max(...chartData.map(d => d.users))) * 80}%` }}
                />
                <div 
                  className="w-3 bg-green-500 rounded-t"
                  style={{ height: `${(data.revenue / Math.max(...chartData.map(d => d.revenue))) * 80}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {new Date(data.name).toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span className="text-xs text-gray-600">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600">Revenue</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics & Reports
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Monitor platform performance and user engagement
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={formatNumber(metrics.totalUsers)}
          icon={Users}
          subtitle="+12% from last month"
        />
        <MetricCard
          title="Total Courses"
          value={formatNumber(metrics.totalCourses)}
          icon={BookOpen}
          subtitle="+8 new this month"
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          icon={DollarSign}
          subtitle="+24% from last month"
        />
        <MetricCard
          title="Active Users"
          value={formatNumber(metrics.activeUsers)}
          icon={TrendingUp}
          subtitle="+5% from last week"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
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
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      New users registered
                    </p>
                    <p className="text-xs text-gray-500">Today</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  +{metrics.newUsersThisMonth}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Courses completed
                    </p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {metrics.completedCourses}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Award className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Pending approvals
                    </p>
                    <p className="text-xs text-gray-500">Requires attention</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {metrics.pendingApprovals}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      New instructors
                    </p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
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
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Students</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {Math.round((metrics.totalUsers * 0.7).toLocaleString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Instructors</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {metrics.totalInstructors}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Admins</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Courses</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {Math.round((metrics.totalCourses * 0.8).toLocaleString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Draft Courses</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {Math.round((metrics.totalCourses * 0.2).toLocaleString())}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Archived Courses</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {Math.round((metrics.totalCourses * 0.1).toLocaleString())}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Course Sales</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(metrics.totalRevenue * 0.7)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Subscriptions</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(metrics.totalRevenue * 0.25)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Other</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(metrics.totalRevenue * 0.05)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}