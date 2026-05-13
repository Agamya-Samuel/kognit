'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, Play, BookOpen, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import type { WatchHistoryResponse } from '@/types/courses';

export default function WatchHistoryPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery<WatchHistoryResponse>({
    queryKey: ['watch-history', page, limit],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: WatchHistoryResponse }>(
        `/progress/history?offset=${page * limit}&limit=${limit}`,
      );
      return data.data;
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Watch History</h1>
          <p className="text-gray-500 mt-1">Track your learning progress across all courses</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-lg border p-8 text-center">
            <p className="text-red-500 mb-4">Failed to load watch history</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {data && data.items.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No watch history yet</h3>
            <p className="text-gray-500 mb-6">
              Start watching lectures to see your progress here.
            </p>
            <button
              onClick={() => router.push('/courses')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              Browse Courses
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* History List */}
        {data && data.items.length > 0 && (
          <>
            <div className="space-y-3">
              {data.items.map((item) => (
                <button
                  key={`${item.lectureId}-${item.lastWatchedAt}`}
                  onClick={() =>
                    router.push(`/courses/${item.courseId}/lectures/${item.lectureId}`)
                  }
                  className="w-full text-left bg-white rounded-lg border hover:border-blue-300 hover:shadow-sm transition-all p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        item.isCompleted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {item.isCompleted ? (
                        <CheckCircle size={20} />
                      ) : (
                        <Play size={20} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {item.lectureTitle}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="truncate">{item.courseTitle}</span>
                        <span>&middot;</span>
                        <span>{item.sectionTitle}</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${item.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-400">
                          {item.progressPercentage}%
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDuration(item.watchedSeconds)} / {formatDuration(item.lectureDuration)}
                        </span>
                        <span>{formatDate(item.lastWatchedAt)}</span>
                        {item.isCompleted && (
                          <span className="text-green-600 font-medium">Completed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {data.total > limit && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {page + 1} of {Math.ceil(data.total / limit)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={(page + 1) * limit >= data.total}
                  className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
