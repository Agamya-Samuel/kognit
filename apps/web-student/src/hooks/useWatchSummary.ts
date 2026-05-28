'use client';

import { useQuery } from '@tanstack/react-query';
import { progressService } from '@edutech/api-client';
import type { WatchTimeSummary } from '@edutech/api-client';

interface UseWatchSummaryOptions {
  enabled?: boolean;
}

interface UseWatchSummaryReturn {
  watchTime: WatchTimeSummary | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useWatchSummary({
  enabled = true,
}: UseWatchSummaryOptions = {}): UseWatchSummaryReturn {
  const {
    data: watchTime,
    isLoading,
    refetch,
  } = useQuery<WatchTimeSummary | null>({
    queryKey: ['watchTime', 'summary'],
    queryFn: async () => {
      return progressService.getWatchSummary();
    },
    enabled: enabled,
    staleTime: 60_000, // 1 minute
  });

  return {
    watchTime: watchTime ?? null,
    isLoading,
    refetch,
  };
}