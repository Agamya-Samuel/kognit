'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Users, BookOpen, DollarSign, Calendar } from 'lucide-react';

export default function DashboardPage() {
  // TODO: Replace with actual data from API
  const metrics = [
    { label: 'Total Students', value: '1,234', icon: Users, change: '+12%' },
    { label: 'Active Courses', value: '8', icon: BookOpen, change: '+2' },
    { label: 'Total Revenue', value: '₹2,45,000', icon: DollarSign, change: '+18%' },
    { label: 'Upcoming Classes', value: '3', icon: Calendar, change: '' },
  ];

  const recentActivity = [
    { id: 1, type: 'enrollment', message: 'John Doe enrolled in TypeScript Basics', time: '2 min ago' },
    { id: 2, type: 'completion', message: 'Jane Smith completed React Patterns', time: '15 min ago' },
    { id: 3, type: 'review', message: 'New review: "Excellent course!" on Node.js Fundamentals', time: '1 hour ago' },
    { id: 4, type: 'enrollment', message: 'Mike Johnson enrolled in Advanced React', time: '2 hours ago' },
  ];

  const upcomingClasses = [
    { id: 1, title: 'TypeScript Live Session', time: 'Today, 3:00 PM', enrolled: 45 },
    { id: 2, title: 'React Patterns Q&A', time: 'Tomorrow, 10:00 AM', enrolled: 32 },
    { id: 3, title: 'Node.js Best Practices', time: 'Friday, 2:00 PM', enrolled: 28 },
  ];

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
        {metrics.map((metric) => {
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
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
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
              {upcomingClasses.map((classItem) => (
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
                      {classItem.enrolled} enrolled
                    </span>
                    <button className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                      Start
                    </button>
                  </div>
                </div>
              ))}
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
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Create Course
            </button>
            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Schedule Class
            </button>
            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              View Analytics
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
