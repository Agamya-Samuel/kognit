import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import type { VideoGrant } from 'livekit-server-sdk';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CreateRoomOptions {
  roomName: string;
  maxParticipants?: number;
  metadata?: string;
  emptyTimeout?: number;
}

export interface RoomInfo {
  roomName: string;
  sid: string;
  participants: number;
  maxParticipants: number;
  createdAt: string | undefined;
  active: boolean;
}

export interface GeneratedToken {
  token: string;
  identity: string;
  roomName: string;
  expiresIn: number;
}

export type ParticipantRole = 'instructor' | 'student';

// ─── LiveKit Service ────────────────────────────────────────────────────────

@Injectable()
export class LiveKitService {
  private readonly logger = new Logger(LiveKitService.name);
  private readonly roomService: RoomServiceClient;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly livekitUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || '';
    this.livekitUrl = this.configService.get<string>('LIVEKIT_URL') || '';

    if (!this.apiKey || !this.apiSecret || !this.livekitUrl) {
      this.logger.warn('LiveKit credentials not configured. Live features will be disabled.');
      this.roomService = {} as RoomServiceClient;
    } else {
      this.roomService = new RoomServiceClient(
        this.livekitUrl,
        this.apiKey,
        this.apiSecret,
      );
      this.logger.log('LiveKitService initialized');
    }
  }

  /**
   * Check if LiveKit is properly configured.
   */
  isConfigured(): boolean {
    return !!(
      this.configService.get<string>('LIVEKIT_API_KEY') &&
      this.configService.get<string>('LIVEKIT_API_SECRET') &&
      this.configService.get<string>('LIVEKIT_URL')
    );
  }

  // ─── Room Management ────────────────────────────────────────────────────

  /**
   * Create a LiveKit room for a live class.
   */
  async createRoom(options: CreateRoomOptions): Promise<RoomInfo> {
    if (!this.isConfigured()) {
      throw new InternalServerErrorException('LiveKit is not configured');
    }

    try {
      const room = await this.roomService.createRoom({
        name: options.roomName,
        maxParticipants: options.maxParticipants ?? 100,
        emptyTimeout: options.emptyTimeout ?? 600, // 10 minutes
        metadata: options.metadata ?? '{}',
      });

      this.logger.log(`Created LiveKit room: ${room.name} (sid: ${room.sid})`);

      return {
        roomName: room.name,
        sid: room.sid,
        participants: room.numParticipants ?? 0,
        maxParticipants: options.maxParticipants ?? 100,
        createdAt: room.creationTimeMs?.toString() ?? room.creationTime?.toString(),
        active: true,
      };
    } catch (error) {
      this.logger.error('Error creating LiveKit room:', error);
      throw new InternalServerErrorException('Failed to create LiveKit room');
    }
  }

  /**
   * Get information about an active room.
   */
  async getRoomInfo(roomName: string): Promise<RoomInfo | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const rooms = await this.roomService.listRooms([roomName]);
      if (!rooms || rooms.length === 0) {
        return null;
      }

      const room = rooms[0];
      return {
        roomName: room.name,
        sid: room.sid,
        participants: room.numParticipants ?? 0,
        maxParticipants: room.maxParticipants ?? 100,
        createdAt: room.creationTimeMs?.toString() ?? room.creationTime?.toString(),
        active: true,
      };
    } catch (error) {
      this.logger.error(`Error getting room info for ${roomName}:`, error);
      return null;
    }
  }

  /**
   * Delete a LiveKit room, kicking all participants.
   */
  async deleteRoom(roomName: string): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    try {
      await this.roomService.deleteRoom(roomName);
      this.logger.log(`Deleted LiveKit room: ${roomName}`);
    } catch (error) {
      this.logger.error(`Error deleting LiveKit room ${roomName}:`, error);
      throw new InternalServerErrorException('Failed to delete LiveKit room');
    }
  }

  /**
   * List participants in a room.
   */
  async listParticipants(roomName: string): Promise<Array<{ identity: string; name?: string; state: string }>> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const participants = await this.roomService.listParticipants(roomName);
      return participants.map((p) => ({
        identity: p.identity,
        name: p.name,
        state: String(p.state),
      }));
    } catch (error) {
      this.logger.error(`Error listing participants for ${roomName}:`, error);
      return [];
    }
  }

  /**
   * Remove a participant from a room.
   */
  async removeParticipant(roomName: string, identity: string): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    try {
      await this.roomService.removeParticipant(roomName, identity);
      this.logger.log(`Removed participant ${identity} from room ${roomName}`);
    } catch (error) {
      this.logger.error(`Error removing participant ${identity} from ${roomName}:`, error);
      throw new InternalServerErrorException('Failed to remove participant');
    }
  }

  // ─── Token Generation ───────────────────────────────────────────────────

  /**
   * Generate a join token for an instructor (publisher permissions).
   */
  async generateInstructorToken(options: {
    roomName: string;
    userId: number;
    userName: string;
    expiresIn?: number;
  }): Promise<GeneratedToken> {
    const expiresIn = options.expiresIn ?? 3600; // 1 hour default

    const grant: VideoGrant = {
      roomCreate: true,
      roomJoin: true,
      roomAdmin: true,
      roomRecord: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
      room: options.roomName,
    };

    return this.generateToken({
      identity: `instructor-${options.userId}`,
      name: options.userName,
      roomName: options.roomName,
      grant,
      expiresIn,
    });
  }

  /**
   * Generate a join token for a student (subscriber permissions).
   */
  async generateStudentToken(options: {
    roomName: string;
    userId: number;
    userName: string;
    expiresIn?: number;
  }): Promise<GeneratedToken> {
    const expiresIn = options.expiresIn ?? 3600;

    const grant: VideoGrant = {
      roomJoin: true,
      canPublish: false,
      canSubscribe: true,
      canPublishData: false,
      room: options.roomName,
    };

    return this.generateToken({
      identity: `student-${options.userId}`,
      name: options.userName,
      roomName: options.roomName,
      grant,
      expiresIn,
    });
  }

  /**
   * Generate a generic LiveKit access token.
   */
  private async generateToken(params: {
    identity: string;
    name: string;
    roomName: string;
    grant: VideoGrant;
    expiresIn: number;
  }): Promise<GeneratedToken> {
    if (!this.isConfigured()) {
      throw new InternalServerErrorException('LiveKit is not configured');
    }

    try {
      const token = new AccessToken(this.apiKey, this.apiSecret, {
        identity: params.identity,
        name: params.name,
        ttl: params.expiresIn,
      });

      token.addGrant(params.grant);

      const jwt = await token.toJwt();

      this.logger.log(
        `Generated ${params.grant.canPublish ? 'publisher' : 'subscriber'} token for ${params.identity} in room ${params.roomName}`,
      );

      return {
        token: jwt,
        identity: params.identity,
        roomName: params.roomName,
        expiresIn: params.expiresIn,
      };
    } catch (error) {
      this.logger.error('Error generating LiveKit token:', error);
      throw new InternalServerErrorException('Failed to generate LiveKit token');
    }
  }
}
