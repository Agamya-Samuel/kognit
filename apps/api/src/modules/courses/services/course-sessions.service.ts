import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CourseSessionsRepository } from '../../../db/repositories/course-sessions.repository';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import type { LiveClass } from '../../../db/schema';

@Injectable()
export class CourseSessionsService {
  private readonly logger = new Logger(CourseSessionsService.name);

  constructor(
    private readonly sessionsRepo: CourseSessionsRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  async listSessions(
    courseId: number,
    options: { status?: string; offset?: number; limit?: number } = {},
  ) {
    await this.assertCourseExists(courseId);
    return this.sessionsRepo.findByCourseId(courseId, options);
  }

  async getSession(sessionId: number): Promise<LiveClass> {
    const session = await this.sessionsRepo.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found.');
    }
    return session;
  }

  async createSession(
    courseId: number,
    instructorId: number,
    data: {
      title: string;
      description?: string;
      scheduledAt: string;
      durationMinutes: number;
      meetingLink?: string;
      recordingAvailable?: boolean;
    },
  ): Promise<LiveClass> {
    const course = await this.assertCourseExists(courseId);

    if (course.courseStructure !== 'live') {
      throw new BadRequestException('Sessions can only be created for live courses.');
    }

    const livekitRoomName = `course-${courseId}-session-${Date.now()}`;

    const session = await this.sessionsRepo.create({
      courseId,
      instructorId,
      sessionType: 'one_time',
      title: data.title,
      description: data.description ?? null,
      scheduledAt: new Date(data.scheduledAt),
      durationMinutes: data.durationMinutes,
      meetingLink: data.meetingLink ?? null,
      livekitRoomName,
      recordingAvailable: data.recordingAvailable ?? true,
      recurringScheduleId: null,
      recordingUrl: null,
      recordingStatus: 'none',
      recordingMuxAssetId: null,
      recordingMuxPlaybackId: null,
      recordingS3Key: null,
      recordingError: null,
      status: 'scheduled',
    });

    this.logger.log(`Session created: ${session.id} for course ${courseId}`);
    return session;
  }

  async updateSession(
    sessionId: number,
    instructorId: number,
    data: {
      title?: string;
      description?: string;
      scheduledAt?: string;
      durationMinutes?: number;
      meetingLink?: string;
      recordingAvailable?: boolean;
    },
  ): Promise<LiveClass> {
    const session = await this.sessionsRepo.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    if (session.status === 'cancelled') {
      throw new BadRequestException('Cannot update a cancelled session.');
    }

    if (session.status === 'ended') {
      throw new BadRequestException('Cannot update an ended session.');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.scheduledAt !== undefined) updateData.scheduledAt = new Date(data.scheduledAt);
    if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;
    if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink;
    if (data.recordingAvailable !== undefined) updateData.recordingAvailable = data.recordingAvailable;

    const updated = await this.sessionsRepo.update(sessionId, updateData);
    if (!updated) {
      throw new NotFoundException('Session not found after update.');
    }

    this.logger.log(`Session updated: ${sessionId}`);
    return updated;
  }

  async cancelSession(sessionId: number, instructorId: number): Promise<LiveClass> {
    const session = await this.sessionsRepo.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found.');
    }

    if (session.status === 'cancelled') {
      throw new BadRequestException('Session is already cancelled.');
    }

    if (session.status === 'ended') {
      throw new BadRequestException('Cannot cancel an ended session.');
    }

    const cancelled = await this.sessionsRepo.cancel(sessionId);
    if (!cancelled) {
      throw new NotFoundException('Session not found after cancel.');
    }

    this.logger.log(`Session cancelled: ${sessionId}`);
    // TODO: Trigger student notifications
    // TODO: Handle refund logic for paid course sessions
    return cancelled;
  }

  private async assertCourseExists(courseId: number) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found.');
    }
    return course;
  }
}
