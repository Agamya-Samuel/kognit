'use client';

import { useState } from 'react';
import type { Submission } from '@edutech/types';
import { useAssignment } from '@/hooks/useAssignments';
import { useAssignmentSubmissions } from '@/hooks/useGrading';
import { useGrading } from '@/hooks/useGrading';
import { GradingForm } from '@/components/GradingForm';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Badge } from '@edutech/ui';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AssignmentGradingPage({ params }: { params: { id: string } }) {
  const { data: assignment, isLoading: assignmentLoading, error: assignmentError } = useAssignment(params.id);
  const { data: submissions, isLoading: submissionsLoading, error: submissionsError, refetch: refetchSubmissions } =
    useAssignmentSubmissions(Number(params.id));
  const { grade, autoGrade, isLoading: isGrading } = useGrading();
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSubmissions = submissions ? submissions.filter((sub: Submission) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'ungraded') return sub.score === null;
    if (statusFilter === 'graded') return sub.score !== null;
    return true;
  }) : [];

  const handleGrade = async (score: number, feedback: string) => {
    if (selectedSubmission === null) return;
    const result = await grade(selectedSubmission, score, feedback);
    if (result.success) {
      toast.success('Grade submitted successfully!');
      setSelectedSubmission(null);
      refetchSubmissions();
    } else {
      toast.error(result.error || 'Failed to submit grade');
    }
  };

  const handleAutoGrade = async (submissionId: number) => {
    const result = await autoGrade(submissionId);
    if (result.success) {
      toast.success('Auto-grading completed!');
      refetchSubmissions();
    } else {
      toast.error(result.error || 'Failed to auto-grade');
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
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      </div>
    );
  }

  if (assignmentError || submissionsError) {
    const errorMsg = (assignmentError?.message || submissionsError?.message || 'Failed to load data') as string;
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">{errorMsg}</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">Assignment not found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          The assignment you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  const gradedCount = submissions?.filter((s: Submission) => s.score !== null).length || 0;
  const ungradedCount = (submissions?.length || 0) - gradedCount;
  const averageScore =
    gradedCount > 0 && submissions
      ? Math.round(submissions.filter((s: Submission) => s.score !== null).reduce((acc: number, s: Submission) => acc + (s.score || 0), 0) / gradedCount)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/assignments" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assignments
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{assignment.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
          <span className="text-muted-foreground">Max Score: {assignment.maxScore}</span>
          <span className="text-muted-foreground">Total Submissions: {submissions?.length || 0}</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            Graded: {gradedCount}
          </span>
          <span className="text-amber-600 dark:text-amber-400">Ungraded: {ungradedCount}</span>
          <span className="text-blue-600 dark:text-blue-400">Average Score: {averageScore}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          All
        </Button>
        <Button
          variant={statusFilter === 'ungraded' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('ungraded')}
        >
          Ungraded ({ungradedCount})
        </Button>
        <Button
          variant={statusFilter === 'graded' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter('graded')}
        >
          Graded ({gradedCount})
        </Button>
      </div>

      {selectedSubmission !== null ? (() => {
        const found = submissions?.find((s: Submission) => s.id === selectedSubmission);
        if (!found) return null;
        return (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSubmission(null)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to submissions list
          </Button>
          <GradingForm
            submission={found}
            maxScore={assignment.maxScore}
            onSubmit={handleGrade}
            onCancel={() => setSelectedSubmission(null)}
            isLoading={isGrading}
          />
        </div>
        );
      })() : filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No submissions found</h3>
            <p className="mt-2 text-sm text-muted-foreground">No submissions match the current filter.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">Score</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission: Submission) => (
                    <tr key={submission.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">Student #{submission.studentId}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(submission.submittedAt)}</td>
                      <td className="px-6 py-4">
                        {submission.score !== null ? (
                          <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">Graded</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {submission.score !== null ? `${submission.score}/${assignment.maxScore}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {assignment.type === 'mcq' && submission.score === null && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleAutoGrade(submission.id)}
                              disabled={isGrading}
                            >
                              Auto-Grade
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSubmission(submission.id)}
                          >
                            {submission.score !== null ? 'Update' : 'Grade'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}