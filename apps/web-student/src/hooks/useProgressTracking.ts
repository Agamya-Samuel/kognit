'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressService, getApiClient } from '@edutech/api-client';
import type { LectureProgress, UpdateProgressResponse } from '@/types/courses';

interface UseProgressTrackingOptions {
  lectureId: number;
  enabled?: boolean;
  updateInterval?: number;
}

interface UseProgressTrackingReturn {
  progress: LectureProgress | null;
  isLoading: boolean;
  reportProgress: (watchedSeconds: number) => void;
  updateError: string | null;
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

  const {
    data: progress,
    isLoading,
    refetch: refreshProgress,
  } = useQuery<LectureProgress | null>({
    queryKey: ['progress', 'lecture', lectureId],
    queryFn: async () => {
      return progressService.getLectureProgress(lectureId);
    },
    enabled: enabled && !!lectureId,
    staleTime: 30_000,
  });

  const updateMutation = useMutation({
    mutationFn: async (watchedSeconds: number): Promise<UpdateProgressResponse> => {
      return progressService.updateProgress(lectureId, watchedSeconds);
    },
    onSuccess: (result) => {
      setUpdateError(null);
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

  const reportProgress = useCallback((watchedSeconds: number) => {
    if (watchedSeconds > pendingSeconds.current) {
      pendingSeconds.current = watchedSeconds;
    }
  }, []);

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
  }, [enabled, updateInterval]);

  useEffect(() => {
    return () => {
      const seconds = pendingSeconds.current;
      if (seconds > 0 && seconds !== lastReportedSeconds.current) {
        progressService.updateProgress(lectureId, seconds).catch(() => {});
      }
    };
  }, [lectureId]);

  return {
    progress: progress ?? null,
    isLoading,
    reportProgress,
    updateError,
    refreshProgress,
  };
}