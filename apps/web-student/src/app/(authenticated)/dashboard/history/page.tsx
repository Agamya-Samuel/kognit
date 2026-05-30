'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, Play, BookOpen, ArrowRight } from 'lucide-react';
import { progressService } from '@edutech/api-client';
import type { WatchHistoryResponse } from '@/types/courses';
import { EmptyState, ErrorState, StatusBadge } from '@edutech/shared-components';
import { Progress } from '@edutech/ui';

export default function WatchHistoryPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery<WatchHistoryResponse>({
    queryKey: ['watch-history', page, limit],
    queryFn: async () => {
      const result = await progressService.getWatchHistory(page * limit, limit) as WatchHistoryResponse & { items?: unknown[] };
      if (result && typeof result === 'object' && Array.isArray((result as { items?: unknown[] }).items)) {
        return result as WatchHistoryResponse;
      }
      return { items: [], total: 0, offset: 0, limit } as WatchHistoryResponse;
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Watch History</h1>
        <p className="text-muted-foreground mt-1">Track your learning progress across all courses</p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <ErrorState
          message="Failed to load watch history"
          onRetry={() => refetch()}
        />
      )}

      {data && data.items.length === 0 && (
        <EmptyState
          title="No watch history yet"
          description="Start watching lectures to see your progress here."
          icon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
          action={{
            label: "Browse Courses",
            onClick: () => router.push('/courses')
          }}
        />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="space-y-3">
            {data.items.map((item) => (
              <button
                key={`${item.lectureId}-${item.lastWatchedAt}`}
                onClick={() =>
                  router.push(`/courses/${item.courseId}/lectures/${item.lectureId}`)
                }
                className="w-full text-left bg-card rounded-lg border hover:border-primary/50 hover:shadow-sm transition-all p-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      item.isCompleted
                        ? 'bg-success/10 text-success'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {item.isCompleted ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Play size={20} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">
                        {item.lectureTitle}
                      </h3>
                      {item.isCompleted && (
                        <StatusBadge status="completed" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="truncate">{item.courseTitle}</span>
                      <span>&middot;</span>
                      <span>{item.sectionTitle}</span>
                    </div>

                    <div className="mt-2">
                      <Progress value={item.progressPercentage} />
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDuration(item.watchedSeconds)} / {formatDuration(item.lectureDuration)}
                      </span>
                      <span>{formatDate(item.lastWatchedAt)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {data.total > limit && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {Math.ceil(data.total / limit)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * limit >= data.total}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}