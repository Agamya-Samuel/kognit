import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { RecurringSchedulesRepository } from '../../../db/repositories/recurring-schedules.repository';
import { CourseSessionsRepository } from '../../../db/repositories/course-sessions.repository';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import type { RecurringSchedule, LiveClass } from '../../../db/schema';

const DAY_MAP: Record<string, number> = {
  mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0,
};

@Injectable()
export class RecurringSchedulesService {
  private readonly logger = new Logger(RecurringSchedulesService.name);

  constructor(
    private readonly schedulesRepo: RecurringSchedulesRepository,
    private readonly sessionsRepo: CourseSessionsRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  async listSchedules(courseId: number): Promise<RecurringSchedule[]> {
    await this.assertCourseExists(courseId);
    return this.schedulesRepo.findByCourseId(courseId);
  }

  async getSchedule(scheduleId: number): Promise<RecurringSchedule> {
    const schedule = await this.schedulesRepo.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Recurring schedule not found.');
    }
    return schedule;
  }

  async getScheduleWithSessions(scheduleId: number): Promise<{
    schedule: RecurringSchedule;
    sessions: LiveClass[];
  }> {
    const schedule = await this.getSchedule(scheduleId);
    const sessions = await this.sessionsRepo.findByRecurringScheduleId(scheduleId);
    return { schedule, sessions };
  }

  async createSchedule(
    courseId: number,
    instructorId: number,
    data: {
      title: string;
      daysOfWeek: string[];
      startTime: string;
      durationMinutes: number;
      startDate: string;
      endDate: string;
      meetingLink?: string;
    },
  ): Promise<RecurringSchedule> {
    const course = await this.assertCourseExists(courseId);

    if (course.courseStructure !== 'live') {
      throw new BadRequestException('Recurring schedules can only be created for live courses.');
    }

    if (!data.daysOfWeek || data.daysOfWeek.length === 0) {
      throw new BadRequestException('At least one day of week must be selected.');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date.');
    }

    const livekitRoomPrefix = `course-${courseId}-recurring-${Date.now()}`;

    const schedule = await this.schedulesRepo.create({
      courseId,
      title: data.title,
      daysOfWeek: JSON.stringify(data.daysOfWeek),
      startTime: data.startTime,
      durationMinutes: data.durationMinutes,
      startDate: data.startDate,
      endDate: data.endDate,
      meetingLink: data.meetingLink ?? null,
      livekitRoomPrefix,
    });

    // Auto-generate individual sessions
    const sessions = this.generateSessions(schedule, instructorId);
    if (sessions.length > 0) {
      await this.sessionsRepo.createMany(sessions);
    }

    this.logger.log(
      `Recurring schedule created: ${schedule.id} for course ${courseId}, generated ${sessions.length} sessions`,
    );
    return schedule;
  }

  async updateSchedule(
    scheduleId: number,
    data: {
      title?: string;
      daysOfWeek?: string[];
      startTime?: string;
      durationMinutes?: number;
      endDate?: string;
      meetingLink?: string;
    },
  ): Promise<RecurringSchedule> {
    const schedule = await this.schedulesRepo.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Recurring schedule not found.');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.daysOfWeek !== undefined) updateData.daysOfWeek = JSON.stringify(data.daysOfWeek);
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;
    if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink;

    const updated = await this.schedulesRepo.update(scheduleId, updateData);
    if (!updated) {
      throw new NotFoundException('Recurring schedule not found after update.');
    }

    // If schedule pattern changed, regenerate future sessions
    if (data.daysOfWeek || data.startTime || data.endDate) {
      await this.regenerateFutureSessions(updated);
    }

    this.logger.log(`Recurring schedule updated: ${scheduleId}`);
    return updated;
  }

  async deleteSchedule(scheduleId: number): Promise<void> {
    const schedule = await this.schedulesRepo.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Recurring schedule not found.');
    }

    // Cancel all future sessions for this schedule
    const cancelledCount = await this.sessionsRepo.cancelByRecurringSchedule(scheduleId);

    // Delete the schedule itself
    await this.schedulesRepo.delete(scheduleId);

    this.logger.log(
      `Recurring schedule deleted: ${scheduleId}, cancelled ${cancelledCount} future sessions`,
    );
  }

  /**
   * Generate session records from a recurring schedule pattern.
   */
  private generateSessions(
    schedule: RecurringSchedule,
    instructorId: number,
  ): Omit<LiveClass, 'id' | 'createdAt' | 'updatedAt'>[] {
    const daysOfWeek: string[] = JSON.parse(schedule.daysOfWeek);
    const dayNumbers = daysOfWeek.map(d => DAY_MAP[d]).filter(d => d !== undefined);

    if (dayNumbers.length === 0) return [];

    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const [hours, minutes] = schedule.startTime.split(':').map(Number);

    const sessions: Omit<LiveClass, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      if (dayNumbers.includes(current.getDay())) {
        const scheduledAt = new Date(current);
        scheduledAt.setHours(hours, minutes, 0, 0);

        sessions.push({
          courseId: schedule.courseId,
          instructorId,
          recurringScheduleId: schedule.id,
          sessionType: 'recurring',
          title: schedule.title,
          description: null,
          scheduledAt,
          durationMinutes: schedule.durationMinutes,
          meetingLink: schedule.meetingLink,
          livekitRoomName: `${schedule.livekitRoomPrefix}-${scheduledAt.toISOString().split('T')[0]}`,
          recordingUrl: null,
          recordingStatus: 'none',
          recordingMuxAssetId: null,
          recordingMuxPlaybackId: null,
          recordingS3Key: null,
          recordingError: null,
          recordingAvailable: true,
          status: 'scheduled',
        });
      }

      // Move to next day
      current.setDate(current.getDate() + 1);
    }

    return sessions;
  }

  /**
   * Regenerate future sessions after schedule pattern change.
   * Keeps past and in-progress sessions, cancels future ones, and regenerates.
   */
  private async regenerateFutureSessions(schedule: RecurringSchedule): Promise<void> {
    const now = new Date();

    // Cancel all future scheduled sessions
    await this.sessionsRepo.cancelByRecurringSchedule(schedule.id);

    // Get existing sessions to avoid duplicates for today
    const existingSessions = await this.sessionsRepo.findByRecurringScheduleId(schedule.id);
    const existingDates = new Set(
      existingSessions
        .filter(s => s.status !== 'cancelled')
        .map(s => s.scheduledAt.toISOString().split('T')[0]),
    );

    // Generate new sessions from now onwards
    const daysOfWeek: string[] = JSON.parse(schedule.daysOfWeek);
    const dayNumbers = daysOfWeek.map(d => DAY_MAP[d]).filter(d => d !== undefined);
    const [hours, minutes] = schedule.startTime.split(':').map(Number);
    const endDate = new Date(schedule.endDate);

    const newSessions: Omit<LiveClass, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    const current = new Date(now);
    current.setDate(current.getDate()); // start from today

    while (current <= endDate) {
      if (dayNumbers.includes(current.getDay())) {
        const dateStr = current.toISOString().split('T')[0];
        if (!existingDates.has(dateStr)) {
          const scheduledAt = new Date(current);
          scheduledAt.setHours(hours, minutes, 0, 0);

          if (scheduledAt > now) {
            newSessions.push({
              courseId: schedule.courseId,
              instructorId: existingSessions[0]?.instructorId ?? 0,
              recurringScheduleId: schedule.id,
              sessionType: 'recurring',
              title: schedule.title,
              description: null,
              scheduledAt,
              durationMinutes: schedule.durationMinutes,
              meetingLink: schedule.meetingLink,
              livekitRoomName: `${schedule.livekitRoomPrefix}-${dateStr}`,
              recordingUrl: null,
              recordingStatus: 'none',
              recordingMuxAssetId: null,
              recordingMuxPlaybackId: null,
              recordingS3Key: null,
              recordingError: null,
              recordingAvailable: true,
              status: 'scheduled',
            });
          }
        }
      }
      current.setDate(current.getDate() + 1);
    }

    if (newSessions.length > 0) {
      await this.sessionsRepo.createMany(newSessions);
    }
  }

  private async assertCourseExists(courseId: number) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }
    return course;
  }
}
