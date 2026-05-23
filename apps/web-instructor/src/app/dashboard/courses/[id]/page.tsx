'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Label } from '@edutech/ui';
import { Textarea } from '@edutech/ui';
import { Badge } from '@edutech/ui';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import Link from 'next/link';

export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.id;

  // TODO: Fetch course data from API
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

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const togglePublish = () => {
    setCourse({ ...course, isPublished: !course.isPublished });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/courses">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Course</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Course ID: {course.id}
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

      {/* Course Details */}
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={course.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCourse({ ...course, description: e.target.value })}
              placeholder="Course description"
              rows={6}
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

          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Publish Status</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Make your course visible to students
              </p>
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

      {/* Pricing Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setCourse({ ...course, pricingType: 'free', priceInr: 0 })}
              className={`p-4 border-2 rounded-lg transition-colors ${
                course.pricingType === 'free'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold mb-1">Free</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Students can access for free
              </p>
            </button>

            <button
              type="button"
              onClick={() => setCourse({ ...course, pricingType: 'paid' })}
              className={`p-4 border-2 rounded-lg transition-colors ${
                course.pricingType === 'paid'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold mb-1">Paid</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set a price for your course
              </p>
            </button>
          </div>

          {course.pricingType === 'paid' && (
            <div className="space-y-2">
              <Label htmlFor="price">Price (INR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
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

      {/* Sections and Lectures */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Section and lecture management coming soon
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              You'll be able to add sections, lectures, and reorder content here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
