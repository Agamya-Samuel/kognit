import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService, liveClassesService, analyticsService, authService, usersService, scheduleService, sessionService, attachmentsService, type CreateScheduleDto } from '@edutech/api-client';

// --- Course Queries ---

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

export function useCourseValidation(id: number | string) {
  return useQuery({
    queryKey: ['course', id, 'validation'],
    queryFn: async () => {
      return coursesService.getValidation(id);
    },
    enabled: !!id,
  });
}

export function useDomains() {
  return useQuery({
    queryKey: ['courses', 'domains'],
    queryFn: async () => {
      return coursesService.getDomains();
    },
  });
}

// --- Course Mutations ---

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

export function useSubmitForReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      return coursesService.submitForReview(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
    },
  });
}

export function useApproveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      return coursesService.approve(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useRequestRevision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: number | string; notes: string }) => {
      return coursesService.requestRevision(id, notes);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
    },
  });
}

export function useArchiveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number | string) => {
      return coursesService.archive(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['course', id] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// --- Dashboard ---

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
         title: c.sessionTitle || c.courseTitle,
         time: c.scheduledAt,
         enrolledCount: 0,
       }));
     },
   });
}

// --- User ---

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

// --- Sessions (Legacy) ---

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

// --- Course Sessions ---

export function useCourseSessions(courseId: number | string) {
  return useQuery({
    queryKey: ['courses', courseId, 'sessions'],
    queryFn: async () => {
      return sessionService.listSessions(courseId);
    },
    enabled: !!courseId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, dto }: { courseId: number | string; dto: any }) => {
      return sessionService.createSession(courseId, dto);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'sessions'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, sessionId, dto }: { courseId: number | string; sessionId: number; dto: any }) => {
      return sessionService.updateSession(courseId, sessionId, dto);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'sessions'] });
    },
  });
}

export function useCancelSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, sessionId }: { courseId: number | string; sessionId: number }) => {
      return sessionService.cancelSession(courseId, sessionId);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'sessions'] });
    },
  });
}

// --- Recurring Schedules ---

export function useRecurringSchedules(courseId: number | string) {
  return useQuery({
    queryKey: ['courses', courseId, 'recurring-schedules'],
    queryFn: async () => {
      return sessionService.listSchedules(courseId);
    },
    enabled: !!courseId,
  });
}

export function useCreateRecurringSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, dto }: { courseId: number | string; dto: any }) => {
      return sessionService.createSchedule(courseId, dto);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'recurring-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'sessions'] });
    },
  });
}

export function useDeleteRecurringSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, scheduleId }: { courseId: number | string; scheduleId: number }) => {
      return sessionService.deleteSchedule(courseId, scheduleId);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'recurring-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'sessions'] });
    },
  });
}

// --- Attachments ---

export function useAttachments(lectureId: number | string) {
  return useQuery({
    queryKey: ['lectures', lectureId, 'attachments'],
    queryFn: async () => {
      return attachmentsService.list(lectureId);
    },
    enabled: !!lectureId,
  });
}

export function useAddAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lectureId, dto }: { lectureId: number | string; dto: any }) => {
      return attachmentsService.add(lectureId, dto);
    },
    onSuccess: (_, { lectureId }) => {
      queryClient.invalidateQueries({ queryKey: ['lectures', lectureId, 'attachments'] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lectureId, attachmentId }: { lectureId: number | string; attachmentId: number }) => {
      return attachmentsService.remove(lectureId, attachmentId);
    },
    onSuccess: (_, { lectureId }) => {
      queryClient.invalidateQueries({ queryKey: ['lectures', lectureId, 'attachments'] });
    },
  });
}
