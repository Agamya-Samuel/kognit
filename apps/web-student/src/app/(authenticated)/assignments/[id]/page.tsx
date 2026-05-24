'use client';

import { useState } from 'react';
import { useAssignment } from '@/hooks/useAssignments';
import { useMySubmission } from '@/hooks/useSubmissions';
import { useSubmitAssignment } from '@/hooks/useSubmissions';
import { AssignmentStatusBadge } from '@/components/AssignmentStatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

export default function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const { data: assignment, isLoading: assignmentLoading, error: assignmentError, refetch } = useAssignment(params.id);
  const { data: submission, isLoading: submissionLoading } = useMySubmission(Number(params.id));
  const { submit, isLoading: isSubmitting, error: submitError } = useSubmitAssignment();
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submit(Number(params.id), content);
    if (result.success) {
      if (result.lateStatus?.isLate) {
        alert(`Assignment submitted late! Penalty applied: ${result.lateStatus.penaltyPercent}%`);
      } else {
        alert('Assignment submitted successfully!');
      }
      setContent('');
      refetch();
    } else {
      alert(result.error || 'Failed to submit assignment');
    }
  };

  const isOverdue = assignment && new Date(assignment.dueAt) < new Date();
  const isLateWindowActive = assignment && assignment.lateWindowHours && isOverdue;
  const canSubmit = !submission && (!isOverdue || isLateWindowActive);

  if (assignmentLoading || submissionLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-8 animate-pulse rounded bg-muted" />
          <div className="h-40 animate-pulse rounded bg-muted" />
          <div className="h-40 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (assignmentError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <ErrorState message={assignmentError} onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            title="Assignment not found"
            description="The assignment you're looking for doesn't exist or has been removed."
            icon={<span className="text-6xl">😕</span>}
          />
        </div>
      </div>
    );
  }

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
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="mb-4 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Assignments
          </button>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">{assignment.title}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="capitalize">{assignment.type}</span>
                <span>•</span>
                <span>{assignment.maxScore} points</span>
              </div>
            </div>
            <AssignmentStatusBadge assignment={assignment} submission={submission} />
          </div>
        </div>

        <div className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold">Description</h2>
          {assignment.description ? (
            <p className="text-muted-foreground whitespace-pre-wrap">{assignment.description}</p>
          ) : (
            <p className="text-muted-foreground italic">No description provided.</p>
          )}
        </div>

        <div className="mb-6 rounded-lg border bg-card p-6">
          <h2 className="mb-2 text-lg font-semibold">Due Date</h2>
          <p className="text-foreground">{formatDate(assignment.dueAt)}</p>
          {assignment.lateWindowHours && assignment.lateWindowHours > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Late submissions accepted within {assignment.lateWindowHours} hours ({assignment.latePenaltyPercent}% penalty)
            </p>
          )}
          {isOverdue && !isLateWindowActive && (
            <p className="mt-2 text-sm text-red-600 font-medium">This assignment is overdue and no longer accepting submissions.</p>
          )}
        </div>

        {submission ? (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Your Submission</h2>
            <div className="mb-4 rounded-md bg-muted p-4">
              <pre className="whitespace-pre-wrap text-sm">{submission.content}</pre>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Submitted on {formatDate(submission.submittedAt)}</span>
              {submission.score !== null && (
                <span className="font-medium">
                  Score: {submission.score}/{assignment.maxScore}
                </span>
              )}
            </div>
            {submission.feedback && (
              <div className="mt-4 rounded-md bg-primary/5 p-4">
                <h3 className="mb-2 font-semibold text-sm">Instructor Feedback</h3>
                <p className="text-sm text-foreground">{submission.feedback}</p>
              </div>
            )}
          </div>
        ) : canSubmit ? (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Submit Assignment</h2>
            {assignment.type === 'mcq' ? (
              <p className="text-muted-foreground">
                This is a quiz assignment. Click the button below to start the quiz.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {assignment.type === 'code' ? 'Code Solution' : 'Your Answer'}
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    placeholder={assignment.type === 'code' ? 'Paste your code solution here...' : 'Write your answer here...'}
                    required
                  />
                </div>
                {submitError && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{submitError}</div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Submission Closed</h2>
            <p className="text-muted-foreground">This assignment is no longer accepting submissions.</p>
          </div>
        )}
      </div>
    </div>
  );
}