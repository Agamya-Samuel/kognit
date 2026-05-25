'use client';

import { Users, BookOpen, DollarSign, Activity, CheckCircle, Clock, UserPlus } from 'lucide-react';
import { StatCard, StatsRow } from '@/components/StatsRow';
import { RevenueChart, EngagementChart } from '@/components/charts/Charts';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

export default function AdminDashboardPage() {
  const revenueData = [
    { month: 'Jan', revenue: 125000, costs: 85000 },
    { month: 'Feb', revenue: 142000, costs: 92000 },
    { month: 'Mar', revenue: 168000, costs: 98000 },
    { month: 'Apr', revenue: 155000, costs: 94000 },
    { month: 'May', revenue: 189000, costs: 105000 },
    { month: 'Jun', revenue: 215000, costs: 112000 },
  ];

  const engagementData = [
    { date: 'Mon', views: 12400, interactions: 8200 },
    { date: 'Tue', views: 11200, interactions: 7600 },
    { date: 'Wed', views: 15600, interactions: 10400 },
    { date: 'Thu', views: 14200, interactions: 9200 },
    { date: 'Fri', views: 16800, interactions: 11800 },
    { date: 'Sat', views: 9800, interactions: 6200 },
    { date: 'Sun', views: 8400, interactions: 5100 },
  ];

  const recentActivity = [
    { id: 1, type: 'enrollment', title: 'New enrollment in React Fundamentals', time: '2 minutes ago' },
    { id: 2, type: 'completion', title: 'Priya Sharma completed Advanced Python', time: '15 minutes ago' },
    { id: 3, type: 'enrollment', title: 'New enrollment in UI/UX Design', time: '32 minutes ago' },
    { id: 4, type: 'enrollment', title: 'New enrollment in Data Science', time: '1 hour ago' },
    { id: 5, type: 'completion', title: 'Rahul Verma completed Machine Learning', time: '2 hours ago' },
  ];

  const pendingModeration = [
    { id: 1, title: 'AWS Cloud Architecture Course', instructor: 'Ankit Patel', count: 3 },
    { id: 2, title: 'Digital Marketing Masterclass', instructor: 'Sneha Gupta', count: 2 },
    { id: 3, title: 'Full Stack Development Bootcamp', instructor: 'Vikram Singh', count: 5 },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and management."
      />

      <StatsRow>
        <StatCard
          title="Total Users"
          value="12,847"
          change={{ value: '+5.2%', trend: 'up' }}
          icon={Users}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Active Courses"
          value="234"
          change={{ value: '+12', trend: 'up' }}
          icon={BookOpen}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Revenue (MTD)"
          value="₹2,15,000"
          change={{ value: '+22%', trend: 'up' }}
          icon={DollarSign}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Active Now"
          value="342"
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Moderation</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" asChild>
              <Link href="/dashboard/users">Manage Users</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/instructors">Review Instructors</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/courses">Moderate Courses</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/analytics">View Analytics</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}