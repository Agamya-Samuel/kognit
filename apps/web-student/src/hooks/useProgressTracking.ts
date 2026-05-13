'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { LectureProgress, UpdateProgressResponse } from '@/types/courses';

interface UseProgressTrackingOptions {
  lectureId: number;
  enabled?: boolean;
  /** Interval in ms to send progress updates (default 10000 = 10s) */
  updateInterval?: number;
}

interface UseProgressTrackingReturn {
  /** Current progress for this lecture */
  progress: LectureProgress | null;
  /** Whether progress is being fetched */
  isLoading: boolean;
  /** Report current watch time (debounced, sent on interval) */
  reportProgress: (watchedSeconds: number) => void;
  /** Last error from update */
  updateError: string | null;
  /** Force refresh progress */
  refreshProgress: () => void;
}

export function useProgressTracking({
  lectureId,
  enabled = true,
  updateInterval = 10000,
}: UseProgressTrackingOptions): UseProgressTrackingReturn {
  const queryClient = useQueryClient();
  const lastReportedSeconds = useRef<number>(0);
  const pendingSeconds = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Fetch existing progress for the lecture
  const {
    data: progress,
    isLoading,
    refetch: refreshProgress,
  } = useQuery<LectureProgress | null>({
    queryKey: ['progress', 'lecture', lectureId],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ success: boolean; data: LectureProgress }>(
          `/progress/lecture/${lectureId}`,
        );
        return data.data;
      } catch (err: any) {
        if (err?.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: enabled && !!lectureId,
    staleTime: 30_000,
  });

  // Mutation to update progress
  const updateMutation = useMutation({
    mutationFn: async (watchedSeconds: number): Promise<UpdateProgressResponse> => {
      const { data } = await api.post<{ success: boolean; data: UpdateProgressResponse }>(
        '/progress/update',
        { lectureId, watchedSeconds },
      );
      return data.data;
    },
    onSuccess: (result) => {
      setUpdateError(null);
      // Update local cache
      queryClient.setQueryData<LectureProgress | null>(
        ['progress', 'lecture', lectureId],
        (old) =>
          old
            ? {
                ...old,
                watchedSeconds: result.watchedSeconds,
                isCompleted: result.isCompleted,
                progressPercentage: result.progressPercentage,
              }
            : null,
      );
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || 'Failed to update progress';
      setUpdateError(msg);
    },
  });

  // Report progress (stores the value, sends on interval)
  const reportProgress = useCallback((watchedSeconds: number) => {
    // Only store if it's forward progress
    if (watchedSeconds > pendingSeconds.current) {
      pendingSeconds.current = watchedSeconds;
    }
  }, []);

  // Send pending progress updates on interval
  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      const seconds = pendingSeconds.current;
      if (seconds > 0 && seconds !== lastReportedSeconds.current) {
        lastReportedSeconds.current = seconds;
        updateMutation.mutate(seconds);
      }
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, updateInterval]);

  // Send final progress on unmount
  useEffect(() => {
    return () => {
      const seconds = pendingSeconds.current;
      if (seconds > 0 && seconds !== lastReportedSeconds.current) {
        // Fire-and-forget final update
        api.post('/progress/update', { lectureId, watchedSeconds: seconds }).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lectureId]);

  return {
    progress: progress ?? null,
    isLoading,
    reportProgress,
    updateError,
    refreshProgress,
  };
}
