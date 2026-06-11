import { getApiClient } from '../index';

export interface CreateCourseSessionDto {
  title: string;
  description?: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  recordingAvailable?: boolean;
}

export interface UpdateCourseSessionDto {
  title?: string;
  description?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  meetingLink?: string;
  recordingAvailable?: boolean;
}

export interface CourseSession {
  id: number;
  courseId: number;
  instructorId: number;
  sessionType: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string | null;
  livekitRoomName: string;
  recordingUrl: string | null;
  recordingStatus: string;
  recordingAvailable: boolean;
  status: string;
}

export interface CreateRecurringScheduleDto {
  title: string;
  daysOfWeek: string[];
  startTime: string;
  durationMinutes: number;
  startDate: string;
  endDate: string;
  meetingLink?: string;
}

export interface UpdateRecurringScheduleDto {
  title?: string;
  daysOfWeek?: string[];
  startTime?: string;
  durationMinutes?: number;
  endDate?: string;
  meetingLink?: string;
}

export interface RecurringSchedule {
  id: number;
  courseId: number;
  title: string;
  daysOfWeek: string;
  startTime: string;
  durationMinutes: number;
  startDate: string;
  endDate: string;
  meetingLink: string | null;
  livekitRoomPrefix: string | null;
}

export const sessionService = {
  async listSessions(courseId: number | string, filters?: Record<string, unknown>) {
    return getApiClient().get<{ data: CourseSession[]; total: number }>(`/courses/${courseId}/sessions`, filters);
  },

  async createSession(courseId: number | string, dto: CreateCourseSessionDto) {
    return getApiClient().post<CourseSession>(`/courses/${courseId}/sessions`, dto);
  },

  async updateSession(courseId: number | string, sessionId: number, dto: UpdateCourseSessionDto) {
    return getApiClient().put<CourseSession>(`/courses/${courseId}/sessions/${sessionId}`, dto);
  },

  async cancelSession(courseId: number | string, sessionId: number) {
    return getApiClient().post<CourseSession>(`/courses/${courseId}/sessions/${sessionId}/cancel`);
  },

  // Recurring Schedules
  async listSchedules(courseId: number | string) {
    return getApiClient().get<RecurringSchedule[]>(`/courses/${courseId}/recurring-schedules`);
  },

  async getSchedule(courseId: number | string, scheduleId: number) {
    return getApiClient().get<{ schedule: RecurringSchedule; sessions: CourseSession[] }>(`/courses/${courseId}/recurring-schedules/${scheduleId}`);
  },

  async createSchedule(courseId: number | string, dto: CreateRecurringScheduleDto) {
    return getApiClient().post<RecurringSchedule>(`/courses/${courseId}/recurring-schedules`, dto);
  },

  async updateSchedule(courseId: number | string, scheduleId: number, dto: UpdateRecurringScheduleDto) {
    return getApiClient().put<RecurringSchedule>(`/courses/${courseId}/recurring-schedules/${scheduleId}`, dto);
  },

  async deleteSchedule(courseId: number | string, scheduleId: number) {
    return getApiClient().delete<void>(`/courses/${courseId}/recurring-schedules/${scheduleId}`);
  },
};

// Legacy schedule service (for backward compatibility with live module endpoints)
export interface CreateScheduleDto {
  courseId: number;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
}

export const scheduleService = {
  async getSchedule(filters?: Record<string, unknown>) {
    return getApiClient().get<any[]>('/instructor/schedule', filters);
  },

  async createSchedule(dto: CreateScheduleDto) {
    return getApiClient().post<any>('/live/schedule', dto);
  },

  async cancelSchedule(liveClassId: number): Promise<void> {
    return getApiClient().post<void>('/live/schedule/cancel', { liveClassId });
  },
};
