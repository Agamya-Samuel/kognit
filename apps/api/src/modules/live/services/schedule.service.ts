import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { LiveClassesRepository } from '../../../db/repositories/live-classes.repository';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import type { LiveClass } from '../../../db/schema';

// --- Types ---

export interface CreateScheduleDto {
  courseId: number;
  instructorId: number;
  title: string;
  scheduledAt: string; // ISO 8601
  durationMinutes: number;
  meetingLink?: string;
}

export interface UpdateScheduleDto {
  scheduledAt?: string;
  durationMinutes?: number;
  meetingLink?: string;
}

export interface CalendarEvent {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  instructorId: number;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  livekitRoomName: string;
  recordingStatus: string;
  recordingUrl: string | null;
  meetingLink: string | null;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD in target timezone
  events: CalendarEvent[];
}

// --- Schedule Service ---

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    private readonly liveClassesRepo: LiveClassesRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  async createSchedule(dto: CreateScheduleDto): Promise<LiveClass> {
    const course = await this.coursesRepo.findById(dto.courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.courseStructure !== 'live') {
      throw new BadRequestException('Can only schedule classes for live courses');
    }

    const scheduledDate = new Date(dto.scheduledAt);
    if (scheduledDate <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    if (dto.durationMinutes < 15 || dto.durationMinutes > 480) {
      throw new BadRequestException('Duration must be between 15 and 480 minutes');
    }

    await this.checkInstructorConflict(dto.instructorId, scheduledDate, dto.durationMinutes);

    const livekitRoomName = `class-${dto.courseId}-${Date.now()}`;

    const liveClass = await this.liveClassesRepo.create({
      courseId: dto.courseId,
      instructorId: dto.instructorId,
      sessionType: 'one_time',
      title: dto.title,
      description: null,
      scheduledAt: scheduledDate,
      durationMinutes: dto.durationMinutes,
      meetingLink: dto.meetingLink ?? null,
      livekitRoomName,
      recordingUrl: null,
      recordingStatus: 'none',
      recordingMuxAssetId: null,
      recordingMuxPlaybackId: null,
      recordingS3Key: null,
      recordingError: null,
      recordingAvailable: true,
      status: 'scheduled',
      recurringScheduleId: null,
    });

    this.logger.log(`Created schedule for live class ${liveClass.id}, course ${dto.courseId}`);
    return liveClass;
  }

  async updateSchedule(
    liveClassId: number,
    instructorId: number,
    dto: UpdateScheduleDto,
  ): Promise<LiveClass> {
    const liveClass = await this.liveClassesRepo.findById(liveClassId);
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    if (liveClass.instructorId !== instructorId) {
      throw new ForbiddenException('Only the assigned instructor can update this schedule');
    }

    if (liveClass.status === 'live' || liveClass.status === 'ended') {
      throw new BadRequestException(`Cannot update schedule for class with status "${liveClass.status}"`);
    }

    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : liveClass.scheduledAt;
    const durationMinutes = dto.durationMinutes ?? liveClass.durationMinutes;

    if (dto.scheduledAt && scheduledAt <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    if (dto.durationMinutes && (dto.durationMinutes < 15 || dto.durationMinutes > 480)) {
      throw new BadRequestException('Duration must be between 15 and 480 minutes');
    }

    if (dto.scheduledAt || dto.durationMinutes) {
      await this.checkInstructorConflict(instructorId, scheduledAt, durationMinutes, liveClassId);
    }

    const updateData: any = { scheduledAt, durationMinutes };
    if (dto.meetingLink !== undefined) updateData.meetingLink = dto.meetingLink;

    const updated = await this.liveClassesRepo.update(liveClassId, updateData);

    this.logger.log(`Updated schedule for live class ${liveClassId}`);
    return updated!;
  }

  async cancelSchedule(liveClassId: number, instructorId: number): Promise<LiveClass> {
    const liveClass = await this.liveClassesRepo.findById(liveClassId);
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    if (liveClass.instructorId !== instructorId) {
      throw new ForbiddenException('Only the assigned instructor can cancel this schedule');
    }

    if (liveClass.status !== 'scheduled') {
      throw new BadRequestException(`Cannot cancel class with status "${liveClass.status}"`);
    }

    const updated = await this.liveClassesRepo.update(liveClassId, {
      status: 'cancelled',
    });

    this.logger.log(`Cancelled live class ${liveClassId}`);
    return updated!;
  }

  async getSchedule(liveClassId: number): Promise<CalendarEvent> {
    const liveClass = await this.liveClassesRepo.findById(liveClassId);
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    return this.toCalendarEvent(liveClass);
  }

  async getInstructorCalendar(
    instructorId: number,
    startDate: Date,
    endDate: Date,
    timezone: string = 'Asia/Kolkata',
  ): Promise<CalendarDay[]> {
    const classes = await this.liveClassesRepo.findByDateRange(
      startDate,
      endDate,
      { instructorId },
    );

    return this.groupByDate(classes, timezone);
  }

  async getStudentCalendar(
    studentId: number,
    startDate: Date,
    endDate: Date,
    timezone: string = 'Asia/Kolkata',
  ): Promise<CalendarDay[]> {
    const enrollments = await this.enrollmentsRepo.findByStudent(studentId, { limit: 100 });

    const allClasses: LiveClass[] = [];
    for (const enrollment of enrollments.data) {
      // Find all live classes for this enrolled course
      const classes = await this.liveClassesRepo.findByDateRange(startDate, endDate);
      const courseClasses = classes.filter(c => c.courseId === enrollment.courseId);
      allClasses.push(...courseClasses);
    }

    // Deduplicate
    const uniqueClasses = Array.from(
      new Map(allClasses.map(c => [c.id, c])).values(),
    );

    return this.groupByDate(uniqueClasses, timezone);
  }

  async getUpcomingClasses(instructorId: number, limit: number = 10): Promise<CalendarEvent[]> {
    const classes = await this.liveClassesRepo.findUpcoming({
      instructorId,
      limit,
    });

    return Promise.all(classes.map(c => this.toCalendarEvent(c)));
  }

  async getStudentUpcomingClasses(studentId: number, limit: number = 10): Promise<CalendarEvent[]> {
    const enrollments = await this.enrollmentsRepo.findByStudent(studentId, { limit: 50 });

    const events: CalendarEvent[] = [];
    for (const enrollment of enrollments.data) {
      const upcoming = await this.liveClassesRepo.findUpcoming({ limit: 50 });
      for (const liveClass of upcoming) {
        if (liveClass.courseId === enrollment.courseId) {
          events.push(await this.toCalendarEvent(liveClass));
        }
      }
    }

    return events
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, limit);
  }

  // --- Private Helpers ---

  private async checkInstructorConflict(
    instructorId: number,
    scheduledAt: Date,
    durationMinutes: number,
    excludeId?: number,
  ): Promise<void> {
    const bufferMinutes = 15;
    const classStart = scheduledAt.getTime();
    const classEnd = classStart + durationMinutes * 60 * 1000;

    const windowStart = new Date(classStart - (durationMinutes + bufferMinutes) * 60 * 1000);
    const windowEnd = new Date(classEnd + bufferMinutes * 60 * 1000);

    const existingClasses = await this.liveClassesRepo.findByDateRange(
      windowStart,
      windowEnd,
      { instructorId },
    );

    for (const existing of existingClasses) {
      if (excludeId && existing.id === excludeId) continue;
      if (existing.status === 'cancelled') continue;

      const existingStart = existing.scheduledAt.getTime();
      const existingEnd = existingStart + existing.durationMinutes * 60 * 1000;

      if (classStart < existingEnd && classEnd > existingStart) {
        throw new BadRequestException(
          'Schedule conflict: instructor has another class at this time',
        );
      }
    }
  }

  private async toCalendarEvent(liveClass: LiveClass): Promise<CalendarEvent> {
    const course = await this.coursesRepo.findById(liveClass.courseId);

    return {
      id: liveClass.id,
      courseId: liveClass.courseId,
      courseTitle: course?.title ?? 'Unknown Course',
      title: liveClass.title,
      instructorId: liveClass.instructorId,
      scheduledAt: liveClass.scheduledAt.toISOString(),
      durationMinutes: liveClass.durationMinutes,
      status: liveClass.status,
      livekitRoomName: liveClass.livekitRoomName,
      recordingStatus: liveClass.recordingStatus,
      recordingUrl: liveClass.recordingUrl,
      meetingLink: liveClass.meetingLink,
    };
  }

  private async groupByDate(classes: LiveClass[], timezone: string): Promise<CalendarDay[]> {
    const dayMap = new Map<string, CalendarEvent[]>();

    for (const liveClass of classes) {
      const dateStr = this.formatDateInTimezone(liveClass.scheduledAt, timezone);

      if (!dayMap.has(dateStr)) {
        dayMap.set(dateStr, []);
      }

      dayMap.get(dateStr)!.push(await this.toCalendarEvent(liveClass));
    }

    const days: CalendarDay[] = [];
    for (const [date, events] of dayMap) {
      days.push({ date, events: events.sort((a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      )});
    }

    return days.sort((a, b) => a.date.localeCompare(b.date));
  }

  private formatDateInTimezone(date: Date, timezone: string): string {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(date);
    } catch {
      this.logger.warn(`Invalid timezone "${timezone}", falling back to UTC`);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
}
