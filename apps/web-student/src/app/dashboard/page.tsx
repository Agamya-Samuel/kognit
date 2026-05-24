'use client';

import { StudentDashboard } from '@edutech/shared-components';

export default function DashboardPage() {
  return (
    <StudentDashboard
      metrics={{
        enrolledCourses: 3,
        completedCourses: 1,
        watchTime: 7200,
        certificates: 1,
      }}
      recentActivity={[
        { id: '1', message: 'Completed "Introduction to React"', time: '2 hours ago', status: 'success' },
        { id: '2', message: 'Started "Advanced TypeScript"', time: '1 day ago', status: 'info' },
        { id: '3', message: 'Submitted assignment for "UI Design"', time: '2 days ago', status: 'success' },
      ]}
      inProgressCourses={[
        { id: '1', title: 'Advanced TypeScript', instructor: 'John Doe', progress: 45, lastWatched: '1 hour ago' },
        { id: '2', title: 'UI Design Principles', instructor: 'Jane Smith', progress: 72, lastWatched: '3 hours ago' },
      ]}
    />
  );
}