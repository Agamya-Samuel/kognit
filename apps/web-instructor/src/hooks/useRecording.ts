'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { recordingsService } from '@edutech/api-client';

export function useRecordings(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['recordings', filters],
    queryFn: async () => {
      return recordingsService.getRecordings(filters);
    },
  });
}

export function useUpdateRecording() {
  const queryClient = useQueryClient();

  return async (id: number, data: any) => {
    const result = await recordingsService.updateRecording(id, data);
    queryClient.invalidateQueries({ queryKey: ['recordings'] });
    return result;
  };
}