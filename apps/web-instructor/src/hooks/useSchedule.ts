'use client';

import { useQuery } from '@tanstack/react-query';
import { scheduleService } from '@edutech/api-client';

export function useInstructorSchedule(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['schedule', filters],
    queryFn: async () => {
      return scheduleService.getSchedule(filters);
    },
  });
}