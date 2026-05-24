'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAssignments } from '@/hooks/useAssignments';
import { Button } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Badge } from '@edutech/ui';
import { Plus, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function InstructorAssignmentsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredAssignments = assignments?.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mcq':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'short':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'code':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load assignments</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Assignments</h1>
          <p className="mt-2 text-muted-foreground">Manage and grade student assignments</p>
        </div>
        <Button asChild>
          <Link href="/assignments/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Assignments</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'mcq', 'short', 'code'].map((type) => (
                  <Button
                    key={type}
                    variant={typeFilter === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter(type)}
                  >
                    {type === 'all' ? 'All' : type === 'mcq' ? 'Quizzes' : type === 'short' ? 'Short' : 'Code'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No assignments found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchTerm ? 'Try adjusting your search' : 'Create your first assignment to get started.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-start justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-foreground">{assignment.title}</h3>
                      {isOverdue(assignment.dueAt) && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    {assignment.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{assignment.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className={`rounded-full px-2 py-1 border ${getTypeColor(assignment.type)}`}>
                        {assignment.type === 'mcq' ? 'Quiz' : assignment.type === 'short' ? 'Short Answer' : 'Code'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Due {formatDate(assignment.dueAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Max Score: {assignment.maxScore}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/assignments/${assignment.id}/submissions`}>Grade</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/assignments/${assignment.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}