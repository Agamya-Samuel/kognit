'use client';

import { Skeleton } from '@edutech/ui';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Badge } from '@edutech/ui';
import { Plus, Edit, Eye, BookOpen, Users, DollarSign } from 'lucide-react';
import type { Course } from '@edutech/types';
import { useMyCourses } from '@/hooks/useCourses';
import { StatCard, StatsRow } from '@/components/StatsRow';

interface CourseWithMetrics extends Course {
  enrollmentCount: number;
  revenue: number;
}

export default function CoursesPage() {
  const { data: courses, isLoading, error } = useMyCourses();

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

  const courseList = courses?.map((c: Course) => ({ ...c, enrollmentCount: 0, revenue: 0 })) || [] as CourseWithMetrics[];

  const totalEnrollments = courseList.reduce((sum: number, c: CourseWithMetrics) => sum + (c.enrollmentCount || 0), 0);
  const totalRevenue = courseList.reduce((sum: number, c: CourseWithMetrics) => sum + (c.revenue || 0), 0);
  const publishedCount = courseList.filter((c: CourseWithMetrics) => c.isPublished).length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Courses</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your courses, track enrollments, and monitor performance.
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
          title="Total Enrollments"
          value={isLoading ? '...' : totalEnrollments.toLocaleString()}
          icon={Users}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${isLoading ? '...' : totalRevenue.toLocaleString('en-IN')}`}
          icon={DollarSign}
          iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
        />
      </StatsRow>

      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Enrollments
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                    Last Updated
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="border-b">
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-5 w-12" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-5 w-16" />
                      </td>
                      <td className="px-4 py-4">
                        <Skeleton className="h-5 w-24" />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  courseList.map((course: CourseWithMetrics) => (
                    <tr
                      key={course.id}
                      className="border-b hover:bg-accent/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-foreground">{course.title}</div>
                          <div className="text-sm text-muted-foreground">{course.domain}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-foreground">{course.enrollmentCount}</td>
                      <td className="px-4 py-4 text-sm text-foreground">
                        ₹{(course.revenue || 0).toLocaleString('en-IN')}
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
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
