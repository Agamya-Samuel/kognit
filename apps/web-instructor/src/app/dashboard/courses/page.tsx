'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Badge } from '@edutech/ui';
import { Plus, Edit, Eye } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  domain: string;
  pricingType: 'free' | 'paid';
  priceInr: number;
  isPublished: boolean;
  enrollmentCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

export default function CoursesPage() {
  const [courses] = useState<Course[]>([
    {
      id: 1,
      title: 'Introduction to TypeScript',
      description: 'Learn TypeScript from scratch with practical examples',
      domain: 'Programming',
      pricingType: 'free',
      priceInr: 0,
      isPublished: true,
      enrollmentCount: 156,
      revenue: 0,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
    },
    {
      id: 2,
      title: 'Advanced React Patterns',
      description: 'Master advanced React patterns and best practices',
      domain: 'Programming',
      pricingType: 'paid',
      priceInr: 4999,
      isPublished: true,
      enrollmentCount: 89,
      revenue: 444911,
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-25T16:00:00Z',
    },
    {
      id: 3,
      title: 'Node.js Fundamentals',
      description: 'Build scalable backend applications with Node.js',
      domain: 'Programming',
      pricingType: 'paid',
      priceInr: 3999,
      isPublished: false,
      enrollmentCount: 0,
      revenue: 0,
      createdAt: '2024-01-28T11:00:00Z',
      updatedAt: '2024-01-28T11:00:00Z',
    },
  ]);

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
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
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {courses.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Published Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {courses.filter((c) => c.isPublished).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {courses.reduce((sum, c) => sum + c.enrollmentCount, 0)}
            </div>
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
                {courses.map((course) => (
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
                      ₹{course.revenue.toLocaleString('en-IN')}
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
