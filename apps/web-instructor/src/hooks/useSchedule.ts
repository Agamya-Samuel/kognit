import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: number;
  lectureId: number;
  lectureTitle: string;
  sectionId: number;
  courseId: number;
  courseTitle: string;
  instructorId: number;
  scheduledAt: string;
  durationMinutes: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  livekitRoomName: string;
  recordingStatus: 'none' | 'recording' | 'processing' | 'ready' | 'failed';
  recordingUrl: string | null;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  events: CalendarEvent[];
}

export interface CreateSchedulePayload {
  lectureId: number;
  scheduledAt: string; // ISO 8601
  durationMinutes: number;
}

export interface UpdateSchedulePayload {
  scheduledAt?: string;
  durationMinutes?: number;
}

// ─── Schedule Mutations ──────────────────────────────────────────────────────

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSchedulePayload) => {
      const { data } = await api.post<CalendarEvent>('/live/schedule', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live', 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['live', 'upcoming'] });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ liveClassId, payload }: { liveClassId: number; payload: UpdateSchedulePayload }) => {
      const { data } = await api.post<CalendarEvent>(`/live/schedule/${liveClassId}/update`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live', 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['live', 'upcoming'] });
    },
  });
}

export function useCancelSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (liveClassId: number) => {
      const { data } = await api.post<{ message: string }>('/live/schedule/cancel', { liveClassId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live', 'calendar'] });
      queryClient.invalidateQueries({ queryKey: ['live', 'upcoming'] });
    },
  });
}

// ─── Calendar Queries ────────────────────────────────────────────────────────

export function useInstructorCalendar(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['live', 'calendar', 'instructor', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<CalendarDay[]>('/live/calendar/instructor', {
        params: { startDate, endDate, timezone: 'Asia/Kolkata' },
      });
      return data;
    },
    enabled: !!startDate && !!endDate,
  });
}

// ─── Upcoming Classes ────────────────────────────────────────────────────────

export function useUpcomingClasses(limit: number = 10) {
  return useQuery({
    queryKey: ['live', 'upcoming', limit],
    queryFn: async () => {
      const { data } = await api.get<CalendarEvent[]>('/live/upcoming', {
        params: { limit },
      });
      return data;
    },
  });
}

// ─── Schedule Detail ─────────────────────────────────────────────────────────

export function useScheduleDetail(liveClassId: number | null) {
  return useQuery({
    queryKey: ['live', 'schedule', liveClassId],
    queryFn: async () => {
      const { data } = await api.get<CalendarEvent>(`/live/schedule/${liveClassId}`);
      return data;
    },
    enabled: !!liveClassId,
  });
}
