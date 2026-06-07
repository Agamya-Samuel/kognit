import { getApiClient } from '../index';

export interface CreateScheduleDto {
  lectureId: number;
  scheduledAt: string; // ISO 8601
  durationMinutes: number;
}

export interface ScheduledClass {
  id: number;
  lectureId: number;
  lectureTitle: string;
  sectionId: number;
  courseId: number;
  courseTitle: string;
  instructorId: number;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  livekitRoomName: string;
  recordingStatus: string;
  recordingUrl: string | null;
}

export const scheduleService = {
  async getSchedule(filters?: Record<string, unknown>) {
    return getApiClient().get<any[]>('/instructor/schedule', filters);
  },

  async createSchedule(dto: CreateScheduleDto): Promise<ScheduledClass> {
    return getApiClient().post<ScheduledClass>('/live/schedule', dto);
  },

  async cancelSchedule(liveClassId: number): Promise<void> {
    return getApiClient().post<void>('/live/schedule/cancel', { liveClassId });
  },
};