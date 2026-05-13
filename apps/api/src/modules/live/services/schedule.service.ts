import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { LiveClassesRepository } from '../../../db/repositories/live-classes.repository';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../../db/repositories/sections.repository';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import type { LiveClass } from '../../../db/schema';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CreateScheduleDto {
  lectureId: number;
  instructorId: number;
  scheduledAt: string; // ISO 8601
  durationMinutes: number;
}

export interface UpdateScheduleDto {
  scheduledAt?: string;
  durationMinutes?: number;
}

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
  status: string;
  livekitRoomName: string;
  recordingStatus: string;
  recordingUrl: string | null;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD in target timezone
  events: CalendarEvent[];
}

// ─── Schedule Service ────────────────────────────────────────────────────────

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    private readonly liveClassesRepo: LiveClassesRepository,
    private readonly lecturesRepo: LecturesRepository,
    private readonly sectionsRepo: SectionsRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
  ) {}

  /**
   * Create a new live class schedule.
   */
  async createSchedule(dto: CreateScheduleDto): Promise<LiveClass> {
    // Validate lecture exists
    const lecture = await this.lecturesRepo.findById(dto.lectureId);
    if (!lecture) {
      throw new NotFoundException('Lecture not found');
    }

    // Validate lecture type is 'live'
    if (lecture.type !== 'live') {
      throw new BadRequestException('Lecture must be of type "live" to schedule a class');
    }

    // Validate scheduled time is in the future
    const scheduledDate = new Date(dto.scheduledAt);
    if (scheduledDate <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    // Validate duration
    if (dto.durationMinutes < 15 || dto.durationMinutes > 480) {
      throw new BadRequestException('Duration must be between 15 and 480 minutes');
    }

    // Check for scheduling conflicts (same instructor, overlapping time)
    await this.checkInstructorConflict(dto.instructorId, scheduledDate, dto.durationMinutes);

    // Generate room name
    const livekitRoomName = `class-${dto.lectureId}-${Date.now()}`;

    const liveClass = await this.liveClassesRepo.create({
      lectureId: dto.lectureId,
      instructorId: dto.instructorId,
      scheduledAt: scheduledDate,
      durationMinutes: dto.durationMinutes,
      livekitRoomName,
      recordingUrl: null,
      recordingStatus: 'none',
      recordingMuxAssetId: null,
      recordingMuxPlaybackId: null,
      recordingS3Key: null,
      recordingError: null,
      status: 'scheduled',
    });

    this.logger.log(`Created schedule for live class ${liveClass.id}, lecture ${dto.lectureId}`);

    return liveClass;
  }

  /**
   * Update an existing schedule.
   */
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

    // Validate scheduled time is in the future
    if (dto.scheduledAt && scheduledAt <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    if (dto.durationMinutes && (dto.durationMinutes < 15 || dto.durationMinutes > 480)) {
      throw new BadRequestException('Duration must be between 15 and 480 minutes');
    }

    // Check for conflicts if time changed
    if (dto.scheduledAt || dto.durationMinutes) {
      await this.checkInstructorConflict(instructorId, scheduledAt, durationMinutes, liveClassId);
    }

    const updated = await this.liveClassesRepo.update(liveClassId, {
      scheduledAt,
      durationMinutes,
    });

    this.logger.log(`Updated schedule for live class ${liveClassId}`);
    return updated!;
  }

  /**
   * Cancel a scheduled class.
   */
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

  /**
   * Get a single schedule.
   */
  async getSchedule(liveClassId: number): Promise<CalendarEvent> {
    const liveClass = await this.liveClassesRepo.findById(liveClassId);
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    return this.toCalendarEvent(liveClass);
  }

  /**
   * Get instructor calendar for a date range.
   * All timestamps stored as UTC, displayed in the provided timezone.
   */
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

  /**
   * Get student calendar for a date range.
   * Shows all scheduled live classes for courses the student is enrolled in.
   */
  async getStudentCalendar(
    studentId: number,
    startDate: Date,
    endDate: Date,
    timezone: string = 'Asia/Kolkata',
  ): Promise<CalendarDay[]> {
    // Get all enrollments for the student
    const enrollments = await this.enrollmentsRepo.findByStudent(studentId, { limit: 100 });

    // For each course, find lectures → live classes
    const allClasses: LiveClass[] = [];
    for (const enrollment of enrollments.data) {
      const classes = await this.liveClassesRepo.findByDateRange(
        startDate,
        endDate,
      );
      // Filter to only classes for this course's lectures
      for (const liveClass of classes) {
        const lecture = await this.lecturesRepo.findById(liveClass.lectureId);
        if (lecture) {
          const section = await this.sectionsRepo.findById(lecture.sectionId);
          if (section && section.courseId === enrollment.courseId) {
            allClasses.push(liveClass);
          }
        }
      }
    }

    // Deduplicate
    const uniqueClasses = Array.from(
      new Map(allClasses.map(c => [c.id, c])).values(),
    );

    return this.groupByDate(uniqueClasses, timezone);
  }

  /**
   * Get upcoming classes for an instructor.
   */
  async getUpcomingClasses(instructorId: number, limit: number = 10): Promise<CalendarEvent[]> {
    const classes = await this.liveClassesRepo.findUpcoming({
      instructorId,
      limit,
    });

    return Promise.all(classes.map(c => this.toCalendarEvent(c)));
  }

  /**
   * Get upcoming classes for a student (from enrolled courses).
   */
  async getStudentUpcomingClasses(studentId: number, limit: number = 10): Promise<CalendarEvent[]> {
    const enrollments = await this.enrollmentsRepo.findByStudent(studentId, { limit: 50 });

    const events: CalendarEvent[] = [];
    for (const enrollment of enrollments.data) {
      const upcoming = await this.liveClassesRepo.findUpcoming({ limit: 5 });
      for (const liveClass of upcoming) {
        const lecture = await this.lecturesRepo.findById(liveClass.lectureId);
        if (lecture) {
          const section = await this.sectionsRepo.findById(lecture.sectionId);
          if (section && section.courseId === enrollment.courseId) {
            events.push(await this.toCalendarEvent(liveClass));
          }
        }
      }
    }

    // Sort by scheduled time and limit
    return events
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, limit);
  }

  // ─── Private Helpers ────────────────────────────────────────────────────

  private async checkInstructorConflict(
    instructorId: number,
    scheduledAt: Date,
    durationMinutes: number,
    excludeId?: number,
  ): Promise<void> {
    const bufferMinutes = 15;
    const classStart = scheduledAt.getTime();
    const classEnd = classStart + durationMinutes * 60 * 1000;

    // Look for conflicts within a window around the scheduled time
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

      // Check overlap
      if (classStart < existingEnd && classEnd > existingStart) {
        throw new BadRequestException(
          'Schedule conflict: instructor has another class at this time',
        );
      }
    }
  }

  private async toCalendarEvent(liveClass: LiveClass): Promise<CalendarEvent> {
    const lecture = await this.lecturesRepo.findById(liveClass.lectureId);
    const section = lecture ? await this.sectionsRepo.findById(lecture.sectionId) : null;

    return {
      id: liveClass.id,
      lectureId: liveClass.lectureId,
      lectureTitle: lecture?.title ?? 'Unknown Lecture',
      sectionId: lecture?.sectionId ?? 0,
      courseId: section?.courseId ?? 0,
      courseTitle: '', // Would need course lookup; can be enriched later
      instructorId: liveClass.instructorId,
      scheduledAt: liveClass.scheduledAt.toISOString(),
      durationMinutes: liveClass.durationMinutes,
      status: liveClass.status,
      livekitRoomName: liveClass.livekitRoomName,
      recordingStatus: liveClass.recordingStatus,
      recordingUrl: liveClass.recordingUrl,
    };
  }

  private groupByDate(classes: LiveClass[], timezone: string): CalendarDay[] {
    const dayMap = new Map<string, CalendarEvent[]>();

    for (const liveClass of classes) {
      // Format date in target timezone using ISO string manipulation
      // In production, use a library like date-fns-tz or luxon
      const dateStr = this.formatDateInTimezone(liveClass.scheduledAt, timezone);

      if (!dayMap.has(dateStr)) {
        dayMap.set(dateStr, []);
      }

      // Create basic calendar event (without enrichment for group operations)
      dayMap.get(dateStr)!.push({
        id: liveClass.id,
        lectureId: liveClass.lectureId,
        lectureTitle: '',
        sectionId: 0,
        courseId: 0,
        courseTitle: '',
        instructorId: liveClass.instructorId,
        scheduledAt: liveClass.scheduledAt.toISOString(),
        durationMinutes: liveClass.durationMinutes,
        status: liveClass.status,
        livekitRoomName: liveClass.livekitRoomName,
        recordingStatus: liveClass.recordingStatus,
        recordingUrl: liveClass.recordingUrl,
      });
    }

    const days: CalendarDay[] = [];
    for (const [date, events] of dayMap) {
      days.push({ date, events: events.sort((a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      )});
    }

    return days.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Format a UTC date as YYYY-MM-DD in the target timezone.
   * IST (Asia/Kolkata) is UTC+5:30. IST does not observe DST.
   * All timestamps stored as UTC, displayed in IST.
   */
  private formatDateInTimezone(date: Date, timezone: string): string {
    // Simple timezone offset handling for IST
    const istOffsetMs = 5.5 * 60 * 60 * 1000; // UTC+5:30
    const istDate = new Date(date.getTime() + istOffsetMs);

    const year = istDate.getUTCFullYear();
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istDate.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
