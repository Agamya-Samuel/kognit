import { getApiClient } from '../index';
import type { CalendarEvent, CalendarDay, RecordingInfo } from '@edutech/types';

export const liveClassesService = {
  async getStudentCalendar(startDate: string, endDate: string, timezone = 'Asia/Kolkata') {
    return getApiClient().get<CalendarDay[]>('/live/calendar/student', {
      startDate,
      endDate,
      timezone,
    });
  },

  async getUpcomingClasses(limit = 10) {
    return getApiClient().get<CalendarEvent[]>('/live/upcoming', { limit });
  },

  async getRecordingInfo(liveClassId: number) {
    return getApiClient().get<RecordingInfo & {
      status: string;
      playbackUrl: string | null;
    }>(`/live/recording/${liveClassId}`);
  },
};