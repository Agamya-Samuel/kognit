'use client';

import { useState } from 'react';
import { useAssignments } from '@/hooks/useAssignments';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

export default function InstructorAssignmentsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { data: assignments, isLoading, error, refetch } = useAssignments({
    type: typeFilter === 'all' ? undefined : (typeFilter as 'mcq' | 'short' | 'code'),
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Assignments</h1>
            <p className="text-muted-foreground">Manage and grade student assignments</p>
          </div>
          <button
            onClick={() => (window.location.href = '/assignments/create')}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            + Create Assignment
          </button>
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
          <ErrorState message={error.message || 'Failed to load assignments'} onRetry={refetch} />
        ) : !assignments || assignments.length === 0 ? (
          <EmptyState
            title="No assignments found"
            description="Create your first assignment to get started."
            icon={<span className="text-6xl">📝</span>}
          />
        ) : (
          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Max Score</th>
                  <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b hover:bg-accent/50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{assignment.title}</div>
                      {assignment.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">{assignment.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium capitalize">
                        {assignment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDate(assignment.dueAt)}</td>
                    <td className="px-6 py-4 text-sm font-medium">{assignment.maxScore}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => (window.location.href = `/assignments/${assignment.id}/submissions`)}
                          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                        >
                          Grade
                        </button>
                        <button
                          onClick={() => (window.location.href = `/assignments/${assignment.id}/edit`)}
                          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}