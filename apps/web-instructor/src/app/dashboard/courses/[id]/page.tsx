'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, Button, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Skeleton } from '@edutech/ui';
import { ArrowLeft, BookOpen, Calendar, Users, BarChart3, Star, Settings } from 'lucide-react';
import { useCourse } from '@/hooks/useCourses';
import { ContentBuilder } from '@/components/content-builder/ContentBuilder';
import { SessionScheduler } from '@/components/session-scheduler/SessionScheduler';
import { CourseInfoTab } from '@/components/course-detail/CourseInfoTab';
import { PublishActions } from '@/components/course-detail/PublishActions';
import { RevisionNotesBanner, StatusBadge } from '@/components/course-detail/RevisionNotesBanner';
import Link from 'next/link';

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const { data: course, isLoading, error } = useCourse(courseId);

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Failed to load course</p>
          <p className="text-xs text-muted-foreground mt-1">
            {error ? 'An error occurred' : 'Course not found'}
          </p>
          <Link href="/dashboard/courses">
            <Button variant="outline" size="sm" className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const courseData = course as any;
  const status = courseData.status || 'draft';
  const courseStructure = courseData.courseStructure || 'normal';

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/courses">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Courses
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{courseData.title}</h1>
              <StatusBadge status={status} />
              <Badge variant="outline">{courseStructure}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {courseData.domain || 'No domain'} • ID: {courseId}
            </p>
          </div>
        </div>
      </div>

      {/* Revision Notes Banner */}
      <RevisionNotesBanner status={status} revisionNotes={courseData.revisionNotes} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info" className="gap-2">
            <Settings className="h-4 w-4" />
            Course Info
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            {courseStructure === 'live' ? <Calendar className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
            {courseStructure === 'live' ? 'Sessions' : 'Content'}
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <Star className="h-4 w-4" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="publish" className="gap-2">
            Publish
          </TabsTrigger>
        </TabsList>

        {/* Course Info Tab */}
        <TabsContent value="info">
          <CourseInfoTab course={courseData} />
        </TabsContent>

        {/* Content Tab - Conditional based on course structure */}
        <TabsContent value="content">
          {courseStructure === 'live' ? (
            <SessionScheduler courseId={courseId} />
          ) : (
            <ContentBuilder courseId={courseId} />
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Enrolled Students</p>
              <p className="text-sm text-muted-foreground/70">
                Student management will be available once students enroll in your course.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Student Reviews</p>
              <p className="text-sm text-muted-foreground/70">
                Reviews from enrolled students will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Course Analytics</p>
              <p className="text-sm text-muted-foreground/70">
                Enrollment, revenue, and completion analytics will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publish Tab */}
        <TabsContent value="publish">
          <Card>
            <CardContent className="pt-6">
              <PublishActions courseId={courseId} status={status} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
