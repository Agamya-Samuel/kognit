'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Label } from '@edutech/ui';
import { Textarea } from '@edutech/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@edutech/ui';
import { BookOpen, Radio, DollarSign } from 'lucide-react';
import { useCreateCourse } from '@/hooks/useCourses';

const COURSE_DOMAINS = [
  'Engineering & Tech',
  'Design & Creativity',
  'Business & Management',
  'Science & Mathematics',
  'Language & Communication',
  'Health & Wellness',
  'Arts & Humanities',
  'Finance & Accounting',
  'Personal Development',
  'Competitive Exams',
] as const;

export default function CreateCoursePage() {
  const router = useRouter();
  const { mutate: createCourse, isPending: isCreating } = useCreateCourse();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    domain: '',
    thumbnailUrl: '',
    courseStructure: 'normal' as 'live' | 'normal',
    pricingType: 'free' as 'free' | 'paid',
    priceInr: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim() || formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!formData.domain) {
      newErrors.domain = 'Please select a domain';
    }
    if (formData.pricingType === 'paid' && (!formData.priceInr || formData.priceInr <= 0)) {
      newErrors.priceInr = 'Paid courses must have a price greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createCourse(
      {
        title: formData.title,
        description: formData.description || undefined,
        domain: formData.domain,
        courseStructure: formData.courseStructure,
        pricingType: formData.pricingType,
        priceInr: formData.pricingType === 'paid' ? formData.priceInr : 0,
        thumbnailUrl: formData.thumbnailUrl || undefined,
      },
      {
        onSuccess: (data) => {
          router.push(`/dashboard/courses/${data.id}`);
        },
      },
    );
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Course</h1>
          <p className="mt-2 text-muted-foreground">
            Set up your course details. You can add content after creation.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Details
            </CardTitle>
            <CardDescription>Basic information about your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Introduction to React"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what students will learn..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain *</Label>
              <Select
                value={formData.domain}
                onValueChange={(value) => setFormData({ ...formData, domain: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_DOMAINS.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.domain && <p className="text-sm text-destructive">{errors.domain}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    id="thumbnailUrl"
                    placeholder="https://example.com/image.jpg"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  />
                </div>
                {formData.thumbnailUrl && (
                  <div className="h-16 w-24 overflow-hidden rounded border">
                    <img
                      src={formData.thumbnailUrl}
                      alt="Thumbnail preview"
                      className="h-full w-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Structure */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Course Structure
            </CardTitle>
            <CardDescription>Choose how you want to deliver your content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, courseStructure: 'normal' })}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  formData.courseStructure === 'normal'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <div className="font-semibold">Normal Course</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pre-recorded video lessons organized in sections
                </p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, courseStructure: 'live' })}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  formData.courseStructure === 'live'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <div className="font-semibold">Live Course</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Scheduled live sessions with students
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing
            </CardTitle>
            <CardDescription>Set your course pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, pricingType: 'free' })}
                className={`flex-1 rounded-lg border-2 p-4 text-center transition-colors ${
                  formData.pricingType === 'free'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <div className="font-semibold">Free</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, pricingType: 'paid' })}
                className={`flex-1 rounded-lg border-2 p-4 text-center transition-colors ${
                  formData.pricingType === 'paid'
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <div className="font-semibold">Paid</div>
              </button>
            </div>

            {formData.pricingType === 'paid' && (
              <div className="space-y-2">
                <Label htmlFor="priceInr">Price (INR) *</Label>
                <Input
                  id="priceInr"
                  type="number"
                  min={1}
                  placeholder="e.g. 999"
                  value={formData.priceInr || ''}
                  onChange={(e) => setFormData({ ...formData, priceInr: parseInt(e.target.value) || 0 })}
                />
                {errors.priceInr && <p className="text-sm text-destructive">{errors.priceInr}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  );
}
