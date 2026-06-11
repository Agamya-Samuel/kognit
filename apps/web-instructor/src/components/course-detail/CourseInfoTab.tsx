'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea, Badge } from '@edutech/ui';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@edutech/ui';
import { Save } from 'lucide-react';
import { useUpdateCourse, useDomains } from '@/hooks/useCourses';
import type { Course } from '@edutech/types';

interface CourseInfoTabProps {
  course: Course;
}

export function CourseInfoTab({ course }: CourseInfoTabProps) {
  const [title, setTitle] = useState(course.title || '');
  const [description, setDescription] = useState(course.description || '');
  const [domain, setDomain] = useState(course.domain || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnailUrl || '');
  const [pricingType, setPricingType] = useState<'free' | 'paid'>(
    course.priceInr > 0 ? 'paid' : 'free'
  );
  const [priceInr, setPriceInr] = useState(course.priceInr || 0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: domains } = useDomains();
  const updateCourse = useUpdateCourse();

  useEffect(() => {
    setTitle(course.title || '');
    setDescription(course.description || '');
    setDomain(course.domain || '');
    setThumbnailUrl(course.thumbnailUrl || '');
    setPricingType(course.priceInr > 0 ? 'paid' : 'free');
    setPriceInr(course.priceInr || 0);
  }, [course.id]);

  const handleSave = async () => {
    try {
      await updateCourse.mutateAsync({
        id: course.id,
        dto: {
          title,
          description: description || undefined,
          domain,
          thumbnailUrl: thumbnailUrl || undefined,
          priceInr: pricingType === 'paid' ? priceInr : 0,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  const domainList = Array.isArray(domains) ? domains : [];

  return (
    <div className="space-y-6">
      {saveSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          Course updated successfully.
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Information</CardTitle>
            <Button onClick={handleSave} disabled={updateCourse.isPending} className="gap-2" size="sm">
              <Save className="h-4 w-4" />
              {updateCourse.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="info-title">Title</Label>
              <Input id="info-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="info-domain">Domain</Label>
              {domainList.length > 0 ? (
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger id="info-domain">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {domainList.map((d: string) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input id="info-domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="info-desc">Description</Label>
            <Textarea
              id="info-desc"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="info-thumb">Thumbnail URL</Label>
            <div className="flex gap-3">
              <Input
                id="info-thumb"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1"
              />
              {thumbnailUrl && (
                <div className="w-16 h-16 rounded-lg border overflow-hidden shrink-0">
                  <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setPricingType('free'); setPriceInr(0); }}
              className={`flex-1 p-4 border-2 rounded-lg text-left transition-colors ${
                pricingType === 'free' ? 'border-primary bg-primary/5' : 'border-input hover:bg-accent'
              }`}
            >
              <h4 className="font-medium">Free</h4>
              <p className="text-sm text-muted-foreground">No charge for students</p>
            </button>
            <button
              type="button"
              onClick={() => setPricingType('paid')}
              className={`flex-1 p-4 border-2 rounded-lg text-left transition-colors ${
                pricingType === 'paid' ? 'border-primary bg-primary/5' : 'border-input hover:bg-accent'
              }`}
            >
              <h4 className="font-medium">Paid</h4>
              <p className="text-sm text-muted-foreground">Set a price in INR</p>
            </button>
          </div>
          {pricingType === 'paid' && (
            <div className="space-y-2">
              <Label htmlFor="info-price">Price (INR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                <Input
                  id="info-price"
                  type="number"
                  min={99}
                  value={priceInr}
                  onChange={(e) => setPriceInr(Number(e.target.value))}
                  className="pl-8"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Structure: <Badge variant="outline">{course.courseStructure}</Badge></p>
            <p>Created: {new Date(course.createdAt).toLocaleDateString()}</p>
            <p>Last updated: {new Date(course.updatedAt).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
