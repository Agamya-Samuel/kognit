import { CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Badge } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { CheckCircle, AlertCircle, Globe, Users, Clock } from 'lucide-react';

interface ReviewStepProps {
  data: {
    title: string;
    description: string;
    domain: string;
    pricingType: 'free' | 'paid';
    priceInr: number;
    sections: any[];
    isPublished: boolean;
  };
  onChange: (data: any) => void;
}

export function ReviewStep({ data, onChange }: ReviewStepProps) {
  const validationErrors = [];

  if (!data.title) validationErrors.push('Course title is required');
  if (!data.description) validationErrors.push('Description is required');
  if (!data.domain) validationErrors.push('Domain is required');
  if (data.pricingType === 'paid' && data.priceInr < 99) {
    validationErrors.push('Price must be at least ₹99');
  }
  if (data.sections.length === 0) {
    validationErrors.push('Add at least one section');
  }

  const isValid = validationErrors.length === 0;

  return (
    <>
      <CardHeader>
        <CardTitle>Review & Publish</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Validation Status */}
        {!isValid && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                  Please fix the following issues:
                </h4>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-800 dark:text-red-200">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {isValid && (
          <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100">
                  Your course is ready to publish!
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                  Review the details below and click &quot;Create Course&quot; to publish.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Course Details Review */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Course Overview</h3>
          <div className="grid gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Title</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{data.title || 'Not set'}</p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Domain</span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">{data.domain || 'Not set'}</p>
            </div>

            <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={data.pricingType === 'free' ? 'secondary' : 'default'}>
                  {data.pricingType === 'free' ? 'Free' : 'Paid'}
                </Badge>
                {data.pricingType === 'paid' && (
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{data.priceInr.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Review */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Course Content</h3>
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sections</span>
            </div>
            {data.sections.length === 0 ? (
              <p className="text-sm text-gray-500">No sections added</p>
            ) : (
              <ul className="space-y-2">
                {data.sections.map((section: any, index: number) => (
                  <li key={section.id} className="text-sm text-gray-900 dark:text-white">
                    {index + 1}. {section.title || 'Untitled Section'}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Publish Settings */}
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Publish Immediately
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Make your course visible to students
              </p>
            </div>
            <Button
              variant={data.isPublished ? 'default' : 'outline'}
              onClick={() => onChange({ ...data, isPublished: !data.isPublished })}
            >
              {data.isPublished ? 'Published' : 'Draft'}
            </Button>
          </div>
        </div>
      </CardContent>
    </>
  );
}
