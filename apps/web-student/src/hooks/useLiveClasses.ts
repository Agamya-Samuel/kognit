import { useQuery } from '@tanstack/react-query';
import { liveClassesService } from '@edutech/api-client';
import type { CalendarEvent, CalendarDay } from '@edutech/types';

export function useStudentCalendar(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['live', 'calendar', 'student', startDate, endDate],
    queryFn: async () => {
      return liveClassesService.getStudentCalendar(startDate, endDate);
    },
    enabled: !!startDate && !!endDate,
  });
}

export function useUpcomingClasses(limit: number = 10) {
  return useQuery({
    queryKey: ['live', 'upcoming', limit],
    queryFn: async () => {
      return liveClassesService.getUpcomingClasses(limit);
    },
  });
}

export function useRecordingInfo(liveClassId: number | null) {
  return useQuery({
    queryKey: ['live', 'recording', liveClassId],
    queryFn: async () => {
      return liveClassesService.getRecordingInfo(liveClassId!);
    },
    enabled: !!liveClassId,
  });
}