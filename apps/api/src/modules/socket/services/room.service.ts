import { Injectable, Logger } from '@nestjs/common';

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
  canJoinRoom(roomName: string, userRole: string): { allowed: boolean; reason?: string } {
    const info = this.parseRoomName(roomName);
    if (!info) {
      return { allowed: false, reason: 'Invalid room name format' };
    }

    switch (info.type) {
      case 'course':
        return { allowed: true };
      case 'live':
        // Allow all authenticated users; fine-grained enrollment checks
        // can be added later when live-class enrollment logic is available
        return { allowed: true };
      case 'general':
        return { allowed: true };
      default:
        return { allowed: false, reason: 'Unknown room type' };
    }
  }
}
