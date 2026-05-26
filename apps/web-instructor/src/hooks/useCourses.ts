import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService, liveClassesService, analyticsService } from '@edutech/api-client';

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
      return analyticsService.getDashboardMetrics();
    },
  });
}

export function useRecentActivity() {
   return useQuery({
     queryKey: ['dashboard', 'activity'],
     queryFn: async () => {
       const metrics = await analyticsService.getDashboardMetrics();
       return metrics?.recentActivity || [];
     },
   });
}

export function useUpcomingClasses() {
    return useQuery({
      queryKey: ['live', 'upcoming'],
      queryFn: async () => {
        const classes = await liveClassesService.getUpcomingClasses();
        return classes.map(c => ({
          id: c.id,
          title: c.lectureTitle || c.courseTitle,
          time: c.scheduledAt,
          enrolledCount: 0,
        }));
      },
    });
}

export function useCreationStats() {
  return useQuery({
    queryKey: ['dashboard', 'creationStats'],
    queryFn: async () => {
      return analyticsService.getCreationStats();
    },
  });
}