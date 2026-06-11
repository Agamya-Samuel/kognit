'use client';

import { useState } from 'react';
import { Skeleton } from '@edutech/ui';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Badge } from '@edutech/ui';
import { Plus, Edit, BookOpen, Calendar } from 'lucide-react';
import type { Course, CourseStatus } from '@edutech/types';
import { useMyCourses } from '@/hooks/useCourses';
import { StatCard, StatsRow } from '@/components/StatsRow';

const STATUS_TABS: { key: CourseStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'in_review', label: 'In Review' },
  { key: 'published', label: 'Published' },
  { key: 'revision_requested', label: 'Revision' },
  { key: 'archived', label: 'Archived' },
];

const statusBadge: Record<CourseStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  in_review: { label: 'In Review', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  revision_requested: { label: 'Revision', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  published: { label: 'Published', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
};

export default function CoursesPage() {
  const { data: courses, isLoading, error } = useMyCourses();
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all');

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load courses</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const courseList = (courses || []) as Course[];

  const filtered = statusFilter === 'all'
    ? courseList
    : courseList.filter((c) => c.status === statusFilter);

  const publishedCount = courseList.filter((c) => c.status === 'published').length;
  const draftCount = courseList.filter((c) => c.status === 'draft').length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Courses</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your courses, track progress, and publish content.
          </p>
        </div>
        <Link href="/dashboard/courses/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </Link>
      </div>

      <StatsRow>
        <StatCard
          title="Total Courses"
          value={isLoading ? '...' : courseList.length.toString()}
          icon={BookOpen}
          iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Published"
          value={isLoading ? '...' : publishedCount.toString()}
          icon={BookOpen}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Drafts"
          value={isLoading ? '...' : draftCount.toString()}
          icon={Edit}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="In Review"
          value={isLoading ? '...' : courseList.filter(c => c.status === 'in_review').length.toString()}
          icon={Calendar}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </StatsRow>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 border-b pb-px">
        {STATUS_TABS.map(tab => {
          const count = tab.key === 'all'
            ? courseList.length
            : courseList.filter(c => c.status === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-2 text-sm font-medium rounded-t-md transition-colors ${
                statusFilter === tab.key
                  ? 'bg-accent text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {statusFilter === 'all' ? 'All Courses' : `${STATUS_TABS.find(t => t.key === statusFilter)?.label} Courses`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Pricing</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Updated</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-4"><Skeleton className="h-5 w-48" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-6 w-16" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-4 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No courses found
                    </td>
                  </tr>
                ) : (
                  filtered.map((course) => {
                    const sb = statusBadge[course.status] || statusBadge.draft;
                    return (
                      <tr key={course.id} className="border-b hover:bg-accent/50 transition-colors">
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-foreground">{course.title}</div>
                            <div className="text-sm text-muted-foreground">{course.domain || 'No domain'}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={sb.className}>{sb.label}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className="text-xs">
                            {course.courseStructure === 'live' ? (
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Live</span>
                            ) : (
                              <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> Normal</span>
                            )}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-foreground">
                          {course.priceInr > 0 ? `₹${course.priceInr.toLocaleString('en-IN')}` : 'Free'}
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">
                          {new Date(course.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/courses/${course.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
