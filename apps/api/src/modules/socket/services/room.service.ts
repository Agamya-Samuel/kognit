import { Injectable, Logger } from '@nestjs/common';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import { LiveClassesRepository } from '../../../db/repositories/live-classes.repository';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../../db/repositories/sections.repository';

/**
 * Room naming conventions:
 *   course:{courseId}       — per-course channel
 *   live:{liveClassId}      — per-live-class room
 *   general:{channelId}     — general / announcement channels
 */

export type RoomType = 'course' | 'live' | 'general';

export interface RoomInfo {
  type: RoomType;
  id: string;
  fullName: string;
}

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly liveClassesRepo: LiveClassesRepository,
    private readonly lecturesRepo: LecturesRepository,
    private readonly sectionsRepo: SectionsRepository,
  ) {}

  /**
   * Build a room name from type and identifier.
   */
  buildRoomName(type: RoomType, id: string): string {
    return `${type}:${id}`;
  }

  /**
   * Parse a room name back into its typed components.
   * Returns null if the room name is invalid.
   */
  parseRoomName(roomName: string): RoomInfo | null {
    const parts = roomName.split(':');
    if (parts.length !== 2) return null;

    const [type, id] = parts as [RoomType, string];

    if (!['course', 'live', 'general'].includes(type)) {
      return null;
    }

    if (!id || id.trim().length === 0) {
      return null;
    }

    return { type, id, fullName: roomName };
  }

  /**
   * Validate that a room name follows our convention.
   */
  isValidRoom(roomName: string): boolean {
    return this.parseRoomName(roomName) !== null;
  }

  /**
   * Validate that a user is allowed to join a specific room type.
   * Business rules:
   *   - Anyone authenticated can join 'course' rooms
   *   - Anyone authenticated can join 'general' rooms
   *   - Only instructors/admins or enrolled students can join 'live' rooms
   */
  async canJoinRoom(roomName: string, userId: number, userRole: string): Promise<{ allowed: boolean; reason?: string }> {
    const info = this.parseRoomName(roomName);
    if (!info) {
      return { allowed: false, reason: 'Invalid room name format' };
    }

    switch (info.type) {
      case 'course':
        return { allowed: true };
      case 'live':
        return this.canJoinLiveRoom(info.id, userId, userRole);
      case 'general':
        return { allowed: true };
      default:
        return { allowed: false, reason: 'Unknown room type' };
    }
  }

  /**
   * Check if a user can join a live class room.
   * Instructors and admins always have access.
   * Students must be enrolled in the course that the live class belongs to.
   */
  private async canJoinLiveRoom(
    liveClassIdStr: string,
    userId: number,
    userRole: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Instructors and admins can always join live rooms
    if (userRole === 'instructor' || userRole === 'admin') {
      return { allowed: true };
    }

    // Parse live class ID
    const liveClassId = parseInt(liveClassIdStr, 10);
    if (isNaN(liveClassId)) {
      return { allowed: false, reason: 'Invalid live class ID' };
    }

    // Look up the live class to find its course
    const liveClass = await this.liveClassesRepo.findById(liveClassId);
    if (!liveClass) {
      return { allowed: false, reason: 'Live class not found' };
    }

    // Find the course via lecture → section → course
    const lecture = await this.lecturesRepo.findById(liveClass.lectureId);
    if (!lecture) {
      return { allowed: false, reason: 'Associated lecture not found' };
    }

    const section = await this.sectionsRepo.findById(lecture.sectionId);
    if (!section) {
      return { allowed: false, reason: 'Associated section not found' };
    }

    const courseId = section.courseId;

    // Check if student is enrolled in the course
    const enrollment = await this.enrollmentsRepo.findByStudentAndCourse(userId, courseId);
    if (!enrollment) {
      return {
        allowed: false,
        reason: 'You must be enrolled in this course to join the live class',
      };
    }

    return { allowed: true };
  }
}
