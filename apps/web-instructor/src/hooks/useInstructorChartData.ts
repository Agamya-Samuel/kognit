import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@edutech/api-client';

export function useInstructorChartData(days: number = 30) {
  return useQuery({
    queryKey: ['instructor', 'chart', days],
    queryFn: () => analyticsService.getInstructorChartData(days),
  });
}