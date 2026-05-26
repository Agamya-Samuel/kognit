import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@edutech/api-client';

export function useInstructorStudents(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['instructor', 'students', filters],
    queryFn: async () => {
      return analyticsService.getInstructorStudents(filters);
    },
  });
}