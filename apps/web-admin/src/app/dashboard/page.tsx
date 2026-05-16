'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Users, BookOpen, DollarSign, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const metrics = [
    { label: 'Total Users', value: '12,847', icon: Users, change: '+5.2%' },
    { label: 'Active Courses', value: '234', icon: BookOpen, change: '+12' },
    { label: 'Revenue (MTD)', value: '\u20B918,45,000', icon: DollarSign, change: '+22%' },
    { label: 'Active Now', value: '342', icon: Activity, change: '' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Platform overview and management.
        </p>
      </div>

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
    </div>
  );
}
