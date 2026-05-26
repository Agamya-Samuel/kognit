'use client';

import { useState } from 'react';
import { useMySubmissions } from '@/hooks/useSubmissions';
import { EmptyState, ErrorState } from '@edutech/shared-components';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Skeleton } from '@edutech/ui';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export default function SubmissionsPage() {
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const { data: submissions, isLoading, error, refetch } = useMySubmissions();

  const filteredSubmissions = submissions?.filter((sub) => {
    if (courseFilter === 'all') return true;
    return sub.assignment?.id.toString() === courseFilter;
  }) ?? [];

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
          <h1 className="mb-2 text-3xl font-bold tracking-tight">My Submissions</h1>
          <p className="text-muted-foreground">View all your assignment submissions and grades</p>
        </div>

        {submissions && submissions.length > 0 && (
          <div className="mb-6 flex items-center gap-4">
            <label className="text-sm font-medium">Filter by assignment:</label>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Select assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                {[...new Set(submissions.map((s) => s.assignment?.id).filter(Boolean))].map((id) => (
                  <SelectItem key={id} value={id.toString()}>
                    {submissions.find((s) => s.assignment?.id === id)?.assignment?.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            message="Failed to load submissions. Please try again later."
            onRetry={refetch}
          />
        ) : filteredSubmissions.length === 0 ? (
          <EmptyState
            title="No submissions found"
            description="You haven't submitted any assignments yet."
          />
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{submission.assignment?.title}</CardTitle>
                    {submission.score !== null ? (
                      <Badge variant="outline" className="gap-1 border-green-600 text-green-700 bg-green-50">
                        <CheckCircle2 className="h-3 w-3" />
                        {submission.score}/{submission.assignment?.maxScore}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {formatDate(submission.submittedAt)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="mb-2 text-sm font-medium">Your Answer</h4>
                    <pre className="whitespace-pre-wrap text-sm text-muted-foreground max-h-32 overflow-y-auto">
                      {submission.content}
                    </pre>
                  </div>

                  {submission.feedback && (
                    <div className="rounded-md bg-primary/5 border border-primary/10 p-4">
                      <h4 className="mb-2 text-sm font-medium">Instructor Feedback</h4>
                      <p className="text-sm text-foreground">{submission.feedback}</p>
                    </div>
                  )}

                  <Button variant="ghost" size="sm" className="w-full sm:w-auto" asChild>
                    <a href={`/assignments/${submission.assignmentId}`}>
                      View Assignment <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}