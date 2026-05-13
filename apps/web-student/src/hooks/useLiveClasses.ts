import { useQuery } from '@tanstack/react-query';
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

// ─── Student Calendar ─────────────────────────────────────────────────────────

export function useStudentCalendar(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['live', 'calendar', 'student', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<CalendarDay[]>('/live/calendar/student', {
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

// ─── Recording Info ──────────────────────────────────────────────────────────

export function useRecordingInfo(liveClassId: number | null) {
  return useQuery({
    queryKey: ['live', 'recording', liveClassId],
    queryFn: async () => {
      const { data } = await api.get<{
        liveClassId: number;
        status: string;
        playbackUrl: string | null;
      }>(`/live/recording/${liveClassId}`);
      return data;
    },
    enabled: !!liveClassId,
  });
}
