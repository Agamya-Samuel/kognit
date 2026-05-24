'use client';

import { Skeleton } from '@edutech/ui';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Badge } from '@edutech/ui';
import { Plus, Edit, Eye } from 'lucide-react';
import type { Course } from '@edutech/types';
import { useMyCourses } from '@/hooks/useCourses';

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
          <p className="text-gray-500 dark:text-gray-400">Failed to load courses</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-blue-600 hover:text-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const courseList = courses?.map(c => ({ ...c, enrollmentCount: 0, revenue: 0 })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your courses, track enrollments, and monitor performance.
          </p>
        </div>
        <Link href="/dashboard/courses/create" className="gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {courseList.length}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Published Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {courseList.filter((c: CourseWithMetrics) => c.isPublished).length}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {courseList.reduce((sum: number, c: CourseWithMetrics) => sum + (c.enrollmentCount || 0), 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Course
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Enrollments
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Last Updated
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  // Skeleton loading rows
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr
                      key={`skeleton-${index}`}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
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
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {course.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {course.domain}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      {course.enrollmentCount}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      ₹{(course.revenue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(course.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/dashboard/courses/${course.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm">
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
