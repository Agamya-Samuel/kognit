import { getApiClient } from '../index';
import type { CalendarEvent, CalendarDay, RecordingInfo } from '@edutech/types';

export interface LiveKitTokenResponse {
  token: string;
  identity: string;
  roomName: string;
  expiresIn: number;
  livekitUrl: string;
}

export interface LiveClassStatusResponse {
  liveClassId: number;
  status: 'scheduled' | 'live' | 'ended';
  roomName: string;
  participantCount?: number;
  maxParticipants?: number;
  recordingUrl?: string;
}

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

  getStatus(liveClassId: number): Promise<LiveClassStatusResponse> {
    return getApiClient().get<LiveClassStatusResponse>(`/live/status/${liveClassId}`);
  },

  startClass(liveClassId: number): Promise<LiveKitTokenResponse> {
    return getApiClient().post<LiveKitTokenResponse>('/live/start', { liveClassId });
  },

  joinClass(liveClassId: number, expiresIn?: number): Promise<LiveKitTokenResponse> {
    const body: { liveClassId: number; expiresIn?: number } = { liveClassId };
    if (expiresIn) body.expiresIn = expiresIn;
    return getApiClient().post<LiveKitTokenResponse>('/live/join', body);
  },

  endClass(liveClassId: number, recordingUrl?: string): Promise<void> {
    const body: { liveClassId: number; recordingUrl?: string } = { liveClassId };
    if (recordingUrl) body.recordingUrl = recordingUrl;
    return getApiClient().post<void>('/live/end', body);
  },
};