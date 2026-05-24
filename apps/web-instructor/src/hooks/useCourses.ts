import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService, liveClassesService } from '@edutech/api-client';

export function useMyCourses() {
  return useQuery({
    queryKey: ['courses', 'instructor', 'mine'],
    queryFn: async () => {
      return coursesService.list({ instructorOnly: true });
    },
  });
}

export function useCourse(id: number | string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      return coursesService.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: any) => {
      return coursesService.create(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor', 'mine'] });
    },
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      return {
        totalStudents: 0,
        activeCourses: 0,
        totalRevenue: 0,
        upcomingClasses: 0,
      };
    },
  });
}

export function useRecentActivity() {
  return useQuery<any[]>({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => [],
  });
}

export function useUpcomingClasses() {
  return useQuery({
    queryKey: ['live', 'upcoming'],
    queryFn: async () => {
      return liveClassesService.getUpcomingClasses();
    },
  });
}