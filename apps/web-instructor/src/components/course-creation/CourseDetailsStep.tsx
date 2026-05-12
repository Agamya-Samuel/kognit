import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Label } from '@edutech/ui';
import { Textarea } from '@edutech/ui';

interface CourseDetailsStepProps {
  data: {
    title: string;
    description: string;
    domain: string;
    thumbnailUrl: string;
  };
  onChange: (data: any) => void;
}

export function CourseDetailsStep({ data, onChange }: CourseDetailsStepProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Introduction to TypeScript"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Provide a detailed description of your course..."
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain *</Label>
            <Input
              id="domain"
              value={data.domain}
              onChange={(e) => handleChange('domain', e.target.value)}
              placeholder="e.g., Programming, Design, Business"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              value={data.thumbnailUrl}
              onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
            />
            <p className="text-xs text-gray-500">
              Recommended size: 1920x1080 pixels (16:9 aspect ratio)
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
