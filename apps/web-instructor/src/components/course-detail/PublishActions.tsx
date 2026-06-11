'use client';

import { Button, Card, CardContent } from '@edutech/ui';
import { Send, Archive, CheckCircle, AlertCircle } from 'lucide-react';
import type { CourseStatus } from '@edutech/types';
import { useSubmitForReview, useArchiveCourse, useCourseValidation } from '@/hooks/useCourses';
import { StatusBadge } from './RevisionNotesBanner';

interface PublishActionsProps {
  courseId: number | string;
  status: CourseStatus;
}

export function PublishActions({ courseId, status }: PublishActionsProps) {
  const submitForReview = useSubmitForReview();
  const archiveCourse = useArchiveCourse();
  const { data: validation } = useCourseValidation(courseId);

  const canSubmit = status === 'draft' || status === 'revision_requested';
  const canArchive = status !== 'archived';

  const handleSubmit = () => {
    submitForReview.mutate(courseId);
  };

  const handleArchive = () => {
    if (confirm('Archive this course? Students will no longer be able to enroll.')) {
      archiveCourse.mutate(courseId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Validation */}
      {validation && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              {validation.isValid ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-600" />
              )}
              <span className="font-medium text-sm">
                {validation.isValid ? 'Ready for submission' : 'Issues to resolve'}
              </span>
            </div>
            {!validation.isValid && validation.errors.length > 0 && (
              <ul className="space-y-1 ml-7">
                {validation.errors.map((err: any, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                    <span className="text-amber-600">•</span>
                    {err.message}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {canSubmit && (
          <Button
            onClick={handleSubmit}
            disabled={submitForReview.isPending}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {submitForReview.isPending ? 'Submitting...' : 'Submit for Review'}
          </Button>
        )}

        {canArchive && (
          <Button
            variant="outline"
            onClick={handleArchive}
            disabled={archiveCourse.isPending}
            className="gap-2 text-muted-foreground"
          >
            <Archive className="h-4 w-4" />
            {archiveCourse.isPending ? 'Archiving...' : 'Archive Course'}
          </Button>
        )}

        {status === 'in_review' && (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-4 py-2 text-sm text-blue-700 dark:text-blue-300">
            This course is currently under admin review. You'll be notified when it's approved.
          </div>
        )}

        {status === 'archived' && (
          <div className="rounded-lg bg-gray-50 dark:bg-gray-950 border px-4 py-2 text-sm text-muted-foreground">
            This course is archived. Students cannot enroll or access it.
          </div>
        )}
      </div>
    </div>
  );
}
