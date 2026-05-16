'use client';

import { useState } from 'react';
import { useAssignment } from '@/hooks/useAssignments';
import { useAssignmentSubmissions } from '@/hooks/useGrading';
import { useGrading } from '@/hooks/useGrading';
import { GradingForm } from '@/components/GradingForm';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

export default function AssignmentGradingPage({ params }: { params: { id: string } }) {
  const { data: assignment, isLoading: assignmentLoading, error: assignmentError } = useAssignment(params.id);
  const { data: submissions, isLoading: submissionsLoading, error: submissionsError, refetch: refetchSubmissions } =
    useAssignmentSubmissions(Number(params.id));
  const { grade, autoGrade, isLoading: isGrading } = useGrading();
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'ungraded') return sub.score === null;
    if (statusFilter === 'graded') return sub.score !== null;
    return true;
  });

  const handleGrade = async (score: number, feedback: string) => {
    if (selectedSubmission === null) return;
    const result = await grade(selectedSubmission, score, feedback);
    if (result.success) {
      alert('Grade submitted successfully!');
      setSelectedSubmission(null);
      refetchSubmissions();
    } else {
      alert(result.error || 'Failed to submit grade');
    }
  };

  const handleAutoGrade = async (submissionId: number) => {
    const result = await autoGrade(submissionId);
    if (result.success) {
      alert('Auto-grading completed!');
      refetchSubmissions();
    } else {
      alert(result.error || 'Failed to auto-grade');
    }
  };

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

  if (assignmentLoading || submissionsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-4">
          <div className="h-8 animate-pulse rounded bg-muted" />
          <div className="h-40 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (assignmentError || submissionsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <ErrorState message={assignmentError || submissionsError || 'Failed to load data'} />
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <EmptyState
            title="Assignment not found"
            description="The assignment you're looking for doesn't exist."
            icon={<span className="text-6xl">😕</span>}
          />
        </div>
      </div>
    );
  }

  const gradedCount = submissions.filter((s) => s.score !== null).length;
  const ungradedCount = submissions.length - gradedCount;
  const averageScore =
    gradedCount > 0
      ? Math.round(submissions.filter((s) => s.score !== null).reduce((acc, s) => acc + s.score!, 0) / gradedCount)
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="mb-4 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Assignments
          </button>
          <h1 className="mb-2 text-3xl font-bold">{assignment.title}</h1>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted-foreground">Max Score: {assignment.maxScore}</span>
            <span className="text-muted-foreground">Total Submissions: {submissions.length}</span>
            <span className="text-green-600">Graded: {gradedCount}</span>
            <span className="text-orange-600">Ungraded: {ungradedCount}</span>
            <span className="text-blue-600">Average Score: {averageScore}</span>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium">Filter by status:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background hover:bg-accent'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('ungraded')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === 'ungraded'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background hover:bg-accent'
              }`}
            >
              Ungraded ({ungradedCount})
            </button>
            <button
              onClick={() => setStatusFilter('graded')}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === 'graded'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-background hover:bg-accent'
              }`}
            >
              Graded ({gradedCount})
            </button>
          </div>
        </div>

        {selectedSubmission !== null ? (
          <div className="mb-6">
            <button
              onClick={() => setSelectedSubmission(null)}
              className="mb-4 text-sm text-primary hover:underline"
            >
              ← Back to submissions list
            </button>
            <GradingForm
              submission={submissions.find((s) => s.id === selectedSubmission)!}
              maxScore={assignment.maxScore}
              onSubmit={handleGrade}
              onCancel={() => setSelectedSubmission(null)}
              isLoading={isGrading}
            />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <EmptyState
            title="No submissions found"
            description="No submissions match the current filter."
            icon={<span className="text-6xl">📋</span>}
          />
        ) : (
          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">Student</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Submitted</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium">Score</th>
                  <th className="px-6 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="border-b hover:bg-accent/50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{submission.student?.name}</div>
                      <div className="text-sm text-muted-foreground">{submission.student?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{formatDate(submission.submittedAt)}</td>
                    <td className="px-6 py-4">
                      {submission.score !== null ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Graded
                        </span>
                      ) : (
                        <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {submission.score !== null ? `${submission.score}/${assignment.maxScore}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {assignment.type === 'mcq' && submission.score === null && (
                          <button
                            onClick={() => handleAutoGrade(submission.id)}
                            disabled={isGrading}
                            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Auto-Grade
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedSubmission(submission.id)}
                          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent"
                        >
                          {submission.score !== null ? 'Update Grade' : 'Grade'}
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