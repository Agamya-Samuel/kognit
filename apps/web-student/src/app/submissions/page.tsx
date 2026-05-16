'use client';

import { useState } from 'react';
import { useMySubmissions } from '@/hooks/useSubmissions';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

export default function SubmissionsPage() {
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const { data: submissions, isLoading, error, refetch } = useMySubmissions();

  const filteredSubmissions = submissions.filter((sub) => {
    if (courseFilter === 'all') return true;
    return sub.assignment?.id.toString() === courseFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">My Submissions</h1>
          <p className="text-muted-foreground">View all your assignment submissions and grades</p>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium">Filter by assignment:</label>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">All Assignments</option>
            {[...new Set(submissions.map((s) => s.assignment?.id).filter(Boolean))].map((id) => (
              <option key={id} value={id}>
                {submissions.find((s) => s.assignment?.id === id)?.assignment?.title}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : filteredSubmissions.length === 0 ? (
          <EmptyState
            title="No submissions found"
            description="You haven't submitted any assignments yet."
            icon={<span className="text-6xl">📋</span>}
          />
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{submission.assignment?.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Submitted on {formatDate(submission.submittedAt)}
                    </p>
                  </div>
                  {submission.score !== null ? (
                    <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      {submission.score}/{submission.assignment?.maxScore}
                    </div>
                  ) : (
                    <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      Pending
                    </div>
                  )}
                </div>

                <div className="mb-4 rounded-md bg-muted p-4">
                  <h4 className="mb-2 text-sm font-medium">Your Answer</h4>
                  <pre className="whitespace-pre-wrap text-sm text-muted-foreground max-h-32 overflow-y-auto">
                    {submission.content}
                  </pre>
                </div>

                {submission.feedback && (
                  <div className="rounded-md bg-primary/5 p-4">
                    <h4 className="mb-2 text-sm font-medium">Instructor Feedback</h4>
                    <p className="text-sm text-foreground">{submission.feedback}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end">
                  <button
                    onClick={() => (window.location.href = `/assignments/${submission.assignmentId}`)}
                    className="text-sm text-primary hover:underline"
                  >
                    View Assignment →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}