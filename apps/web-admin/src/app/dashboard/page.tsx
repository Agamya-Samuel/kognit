'use client';

import { MetricCard, MetricCardGrid } from '@edutech/shared-components';
import { Users, BookOpen, DollarSign, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
  const metrics = [
    { label: 'Total Users', value: '12,847', icon: Users, change: '+5.2%', trend: 'up' as const },
    { label: 'Active Courses', value: '234', icon: BookOpen, change: '+12', trend: 'up' as const },
    { label: 'Revenue (MTD)', value: '₹18,45,000', icon: DollarSign, change: '+22%', trend: 'up' as const },
    { label: 'Active Now', value: '342', icon: Activity, trend: 'neutral' as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Platform overview and management.
        </p>
      </div>

      <MetricCardGrid>
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </MetricCardGrid>
    </div>
  );
}