'use client';

import { useState } from 'react';
import { useAssignments } from '@/hooks/useAssignments';
import { AssignmentCard } from '@/components/AssignmentCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

export default function AssignmentsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { data: assignments, isLoading, error, refetch } = useAssignments({
    type: typeFilter === 'all' ? undefined : (typeFilter as 'mcq' | 'short' | 'code'),
  });

  const sortedAssignments = [...assignments].sort((a, b) => {
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });

  const getStatus = (_assignment: any): 'not_submitted' | 'submitted' | 'graded' => {
    // This will be enhanced when we fetch submissions
    return 'not_submitted';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">View and submit your course assignments</p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium">Filter by type:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter('all')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background hover:bg-accent'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('mcq')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                typeFilter === 'mcq'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background hover:bg-accent'
              }`}
            >
              Quizzes
            </button>
            <button
              onClick={() => setTypeFilter('short')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                typeFilter === 'short'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background hover:bg-accent'
              }`}
            >
              Short Answers
            </button>
            <button
              onClick={() => setTypeFilter('code')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                typeFilter === 'code'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background hover:bg-accent'
              }`}
            >
              Code
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : sortedAssignments.length === 0 ? (
          <EmptyState
            title="No assignments found"
            description="There are no assignments available right now."
            icon={<span className="text-6xl">📝</span>}
          />
        ) : (
          <div className="space-y-4">
            {sortedAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                submissionStatus={getStatus(assignment)}
                onClick={() => (window.location.href = `/assignments/${assignment.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}