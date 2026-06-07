import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService, liveClassesService, analyticsService, authService, usersService, scheduleService, type CreateScheduleDto } from '@edutech/api-client';

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

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: number | string; dto: any }) => {
      return coursesService.update(id, dto);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', id] });
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

export function useInstructorAnalytics() {
  return useQuery({
    queryKey: ['instructor', 'analytics'],
    queryFn: async () => {
      return analyticsService.getInstructorAnalytics();
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

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      return authService.changePassword(currentPassword, newPassword);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name?: string; mobile?: string }) => {
      return usersService.updateProfile(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateScheduleDto) => {
      return scheduleService.createSchedule(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live', 'upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
    },
  });
}