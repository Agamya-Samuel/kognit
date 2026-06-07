'use client';

import { useState } from 'react';
import { useAssignments } from '@/hooks/useAssignments';
import { AssignmentCard } from '@/components/AssignmentCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@edutech/ui';

export default function AssignmentsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { data: assignments, isLoading, error, refetch } = useAssignments({
    type: typeFilter === 'all' ? undefined : (typeFilter as 'mcq' | 'short' | 'code'),
  });

  const sortedAssignments = (Array.isArray(assignments) ? assignments : []).sort((a, b) => {
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });

  const getStatus = (_assignment: any): 'not_submitted' | 'submitted' | 'graded' => {
    return 'not_submitted';
  };

  const filterCounts = {
    all: (Array.isArray(assignments) ? assignments : []).length,
    mcq: (Array.isArray(assignments) ? assignments : []).filter(a => a.type === 'mcq').length,
    short: (Array.isArray(assignments) ? assignments : []).filter(a => a.type === 'short').length,
    code: (Array.isArray(assignments) ? assignments : []).filter(a => a.type === 'code').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Assignments</h1>
        <p className="text-muted-foreground mt-1">View and submit your course assignments</p>
      </div>

      <Tabs value={typeFilter} onValueChange={setTypeFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({filterCounts.all})</TabsTrigger>
          <TabsTrigger value="mcq">Quizzes ({filterCounts.mcq})</TabsTrigger>
          <TabsTrigger value="short">Short Answers ({filterCounts.short})</TabsTrigger>
          <TabsTrigger value="code">Code ({filterCounts.code})</TabsTrigger>
        </TabsList>

        <TabsContent value={typeFilter} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error.message} onRetry={refetch} />
          ) : sortedAssignments.length === 0 ? (
            <EmptyState
              title="No assignments found"
              description="There are no assignments available right now."
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
