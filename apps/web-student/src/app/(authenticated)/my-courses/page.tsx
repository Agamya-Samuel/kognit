'use client';

import { useState } from 'react';
import { useMyEnrollments } from '@/hooks/useEnrollments';
import { CourseCard } from '@/components/CourseCard';
import { EmptyState } from '@edutech/shared-components';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@edutech/ui';
import { Progress } from '@edutech/ui';

export default function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed'>('in-progress');
  const { data: enrollments, isLoading } = useMyEnrollments();
  const safeEnrollments = Array.isArray(enrollments) ? enrollments : [];

  const inProgressCourses = safeEnrollments.filter((course) => (course.progress ?? 0) < 100);
  const completedCourses = safeEnrollments.filter((course) => (course.progress ?? 0) >= 100);

  const coursesToDisplay = activeTab === 'in-progress' ? inProgressCourses : completedCourses;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Courses</h1>
          <p className="text-muted-foreground">Continue learning or revisit completed courses</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'in-progress' | 'completed')} className="mb-8">
          <TabsList>
            <TabsTrigger value="in-progress">
              In Progress ({inProgressCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : coursesToDisplay.length === 0 ? (
              <EmptyState
                title={
                  activeTab === 'in-progress'
                    ? 'No courses in progress'
                    : 'No completed courses yet'
                }
                description={
                  activeTab === 'in-progress'
                    ? 'Start learning by enrolling in a course.'
                    : 'Complete courses to see them here.'
                }
                action={{
                  label: 'Browse Courses',
                  onClick: () => (window.location.href = '/courses'),
                }}
              />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {coursesToDisplay.map((course) => (
                    <div key={course.id} className="space-y-2">
                      <CourseCard course={course} />
                      {activeTab === 'in-progress' && (
                        <div className="px-1">
                          <Progress value={course.progress ?? 0} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {course.progress ?? 0}% complete
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}