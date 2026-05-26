'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Label } from '@edutech/ui';
import { Textarea } from '@edutech/ui';
import { Badge } from '@edutech/ui';
import { ArrowLeft, Save, Eye, Users, DollarSign, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { StatCard, StatsRow } from '@/components/StatsRow';
import Link from 'next/link';
import { useInstructorAnalytics } from '@/hooks/useCourses';

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id;

  const [course, setCourse] = useState({
    id: parseInt(courseId as string),
    title: 'Introduction to TypeScript',
    description: 'Learn TypeScript from scratch with practical examples and real-world projects.',
    domain: 'Programming',
    pricingType: 'free' as 'free' | 'paid',
    priceInr: 0,
    isPublished: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useInstructorAnalytics(courseId ? Number(courseId) : undefined);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Connect to actual coursesService.update when hook is available
      console.log('Would save course:', course);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublish = () => {
    setCourse({ ...course, isPublished: !course.isPublished });
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Stats Row */}
      <StatsRow>
        {analyticsLoading ? (
          <>Loading...</>
        ) : analyticsError ? (
          <>Error loading analytics</>
        ) : analytics ? (
          <>
            <StatCard
              title="Enrollments"
              value={String(analytics.totalEnrollments)}
              change={{ value: 'Total enrolled', trend: 'up' }}
              icon={Users}
            />
            <StatCard
              title="Revenue"
              value={`₹${analytics.totalRevenue.toLocaleString()}`}
              change={{ value: 'Total earned', trend: 'up' }}
              icon={DollarSign}
            />
            <StatCard
              title="Completion Rate"
              value={`${analytics.averageCompletionRate}%`}
              change={{ value: 'Avg across courses', trend: 'up' }}
              icon={TrendingUp}
            />
            <StatCard
              title="Certificates"
              value={String(analytics.totalCertificates)}
              change={{ value: 'Issued', trend: 'up' }}
              icon={Clock}
            />
          </>
        ) : null}
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
              Course ID: {course.id} • {course.domain}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/courses/${course.id}`}>
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
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

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
