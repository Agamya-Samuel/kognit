'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Label } from '@edutech/ui';
import { Textarea } from '@edutech/ui';
import { Badge } from '@edutech/ui';
import { ArrowLeft, Save, Eye, Users, DollarSign, TrendingUp, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { StatCard, StatsRow } from '@/components/StatsRow';
import { useCourse, useUpdateCourse, useInstructorAnalytics } from '@/hooks/useCourses';
import Link from 'next/link';

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  const { data: courseData, isLoading, error } = useCourse(courseId);
  const { data: analytics } = useInstructorAnalytics();
  const updateCourse = useUpdateCourse();

  const [course, setCourse] = useState({
    title: '',
    description: '',
    domain: '',
    pricingType: 'free' as 'free' | 'paid',
    priceInr: 0,
    isPublished: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Populate form from API data
  useEffect(() => {
    if (courseData) {
      setCourse({
        title: courseData.title || '',
        description: courseData.description || '',
        domain: courseData.domain || '',
        pricingType: (courseData.priceInr && courseData.priceInr > 0) ? 'paid' : 'free',
        priceInr: courseData.priceInr || 0,
        isPublished: courseData.isPublished || false,
      });
    }
  }, [courseData]);

  // Get course-specific stats from analytics
  const courseAnalytics = analytics?.courseAnalytics?.find(
    (c) => String(c.courseId) === courseId
  );

  const courseStats = [
    {
      title: 'Enrollments',
      value: (courseAnalytics?.enrollmentCount ?? 0).toString(),
      icon: Users,
    },
    {
      title: 'Revenue',
      value: `₹${(courseAnalytics?.revenue ?? 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
    },
    {
      title: 'Completion Rate',
      value: `${courseAnalytics?.completionRate ?? 0}%`,
      icon: TrendingUp,
    },
    {
      title: 'Certificates',
      value: (courseAnalytics?.certificateCount ?? 0).toString(),
      icon: BookOpen,
    },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateCourse.mutateAsync({
        id: courseId,
        dto: {
          title: course.title,
          description: course.description,
          domain: course.domain,
          priceInr: course.pricingType === 'paid' ? course.priceInr : 0,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save course:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublish = () => {
    const newPublished = !course.isPublished;
    setCourse({ ...course, isPublished: newPublished });
    // Also persist via API
    updateCourse.mutate({
      id: courseId,
      dto: { isPublished: newPublished },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="rounded-full bg-destructive/10 p-3 mx-auto mb-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
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

  return (
    <div className="container mx-auto space-y-6">
      {/* Stats Row */}
      <StatsRow>
        {courseStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </StatsRow>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/courses">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Course</h1>
            <p className="text-sm text-muted-foreground">
              Course ID: {courseId} {course.domain ? `• ${course.domain}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/courses/${courseId}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          Course updated successfully.
        </div>
      )}

      {/* Course Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Details</CardTitle>
            <Badge variant={course.isPublished ? 'default' : 'secondary'}>
              {course.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                value={course.title}
                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                placeholder="Course title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={course.domain}
                onChange={(e) => setCourse({ ...course, domain: e.target.value })}
                placeholder="e.g., Programming, Design"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={course.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCourse({ ...course, description: e.target.value })}
              placeholder="Course description"
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Publish Status</h4>
                <p className="text-sm text-muted-foreground">
                  Make your course visible to students
                </p>
              </div>
            </div>
            <Button
              variant={course.isPublished ? 'default' : 'outline'}
              onClick={togglePublish}
            >
              {course.isPublished ? 'Published' : 'Draft'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setCourse({ ...course, pricingType: 'free', priceInr: 0 })}
              className={`p-6 border-2 rounded-lg transition-colors text-left ${
                course.pricingType === 'free'
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:bg-accent'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-emerald-100 p-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold">Free</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Students can access for free
              </p>
            </button>

            <button
              type="button"
              onClick={() => setCourse({ ...course, pricingType: 'paid' })}
              className={`p-6 border-2 rounded-lg transition-colors text-left ${
                course.pricingType === 'paid'
                  ? 'border-primary bg-primary/5'
                  : 'border-input hover:bg-accent'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-md bg-blue-100 p-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold">Paid</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Set a price for your course
              </p>
            </button>
          </div>

          {course.pricingType === 'paid' && (
            <div className="space-y-2">
              <Label htmlFor="price">Price (INR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  ₹
                </span>
                <Input
                  id="price"
                  type="number"
                  min="99"
                  value={course.priceInr}
                  onChange={(e) => setCourse({ ...course, priceInr: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              Section and lecture management coming soon
            </p>
            <p className="text-sm text-muted-foreground/70 mb-4">
              You'll be able to add sections, lectures, and reorder content here
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Estimated setup time: 15-20 minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
