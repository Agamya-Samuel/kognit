'use client';

import type { CourseStatus } from '@edutech/types';
import { Badge } from '@edutech/ui';
import { AlertTriangle } from 'lucide-react';

interface RevisionNotesBannerProps {
  status: CourseStatus;
  revisionNotes?: string | null;
}

export function RevisionNotesBanner({ status, revisionNotes }: RevisionNotesBannerProps) {
  if (status !== 'revision_requested' || !revisionNotes) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-amber-800 dark:text-amber-200">Revision Requested</h4>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">{revisionNotes}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Please address the feedback above and resubmit for review.
          </p>
        </div>
      </div>
    </div>
  );
}

const statusConfig: Record<CourseStatus, { label: string; variant: string; className: string }> = {
  draft: { label: 'Draft', variant: 'secondary', className: '' },
  in_review: { label: 'In Review', variant: 'default', className: 'bg-blue-600' },
  revision_requested: { label: 'Revision Requested', variant: 'default', className: 'bg-amber-600' },
  published: { label: 'Published', variant: 'default', className: 'bg-emerald-600' },
  archived: { label: 'Archived', variant: 'secondary', className: 'opacity-60' },
};

export function StatusBadge({ status }: { status: CourseStatus }) {
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <Badge variant={config.variant as any} className={config.className}>
      {config.label}
    </Badge>
  );
}
