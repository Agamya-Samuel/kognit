import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { Roles } from '../../modules/auth/decorators/auth.decorators';
import { LiveKitService } from './services/livekit.service';
import { LiveClassesRepository } from '../../db/repositories/live-classes.repository';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { LecturesRepository } from '../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../db/repositories/sections.repository';
import { ConfigService } from '@nestjs/config';
import {
  StartLiveClassDto,
  JoinLiveClassDto,
  EndLiveClassDto,
  LiveKitTokenResponseDto,
  LiveClassStatusResponseDto,
  RoomInfoResponseDto,
} from './dto/live.dto';

@ApiTags('live')
@Controller('api/v1/live')
export class LiveController {
  private readonly logger = new Logger(LiveController.name);

  constructor(
    private readonly livekitService: LiveKitService,
    private readonly liveClassesRepo: LiveClassesRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly lecturesRepo: LecturesRepository,
    private readonly sectionsRepo: SectionsRepository,
    private readonly configService: ConfigService,
  ) {
    this.logger.log('LiveController initialized');
  }

  // ─── Start Live Class (Instructor only) ──────────────────────────────────

  @Post('start')
  @UseGuards(JwtAuthGuard)
  @Roles('instructor')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start a live class (instructor only)' })
  @ApiResponse({ status: 200, description: 'Live class started, token returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the class instructor' })
  @ApiResponse({ status: 404, description: 'Live class not found' })
  async startLiveClass(
    @CurrentUser() user: { sub: number; role: string; email: string },
    @Body() dto: StartLiveClassDto,
  ): Promise<LiveKitTokenResponseDto> {
    // Find live class
    const liveClass = await this.liveClassesRepo.findById(dto.liveClassId);
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    // Only the assigned instructor can start
    if (liveClass.instructorId !== user.sub) {
      throw new ForbiddenException('Only the assigned instructor can start this class');
    }

    // Validate status transition
    if (liveClass.status !== 'scheduled') {
      throw new BadRequestException(
        `Cannot start class with status "${liveClass.status}". Expected "scheduled".`,
      );
    }

    // Create LiveKit room
    const room = await this.livekitService.createRoom({
      roomName: liveClass.livekitRoomName,
      maxParticipants: 100,
      metadata: JSON.stringify({
        liveClassId: liveClass.id,
        lectureId: liveClass.lectureId,
        instructorId: liveClass.instructorId,
      }),
    });

    // Update status to "live"
    await this.liveClassesRepo.update(liveClass.id, { status: 'live' });

    // Generate instructor token
    const tokenResult = await this.livekitService.generateInstructorToken({
      roomName: liveClass.livekitRoomName,
      userId: user.sub,
      userName: user.email,
    });

    this.logger.log(`Instructor ${user.sub} started live class ${liveClass.id}`);

    return {
      token: tokenResult.token,
      identity: tokenResult.identity,
      roomName: tokenResult.roomName,
      expiresIn: tokenResult.expiresIn,
      livekitUrl: this.configService.get<string>('LIVEKIT_URL') || '',
    };
  }

  // ─── Join Live Class (Student) ──────────────────────────────────────────

  @Post('join')
  @UseGuards(JwtAuthGuard)
  @Roles('student')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join a live class as a student' })
  @ApiResponse({ status: 200, description: 'Join token returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not enrolled in the course' })
  @ApiResponse({ status: 404, description: 'Live class not found' })
  async joinLiveClass(
    @CurrentUser() user: { sub: number; role: string; email: string },
    @Body() dto: JoinLiveClassDto,
  ): Promise<LiveKitTokenResponseDto> {
    // Find live class
    const liveClass = await this.liveClassesRepo.findById(dto.liveClassId);
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    // Class must be live
    if (liveClass.status !== 'live') {
      throw new BadRequestException(
        `Cannot join class with status "${liveClass.status}". Class is not live yet.`,
      );
    }

    // Verify enrollment: find lecture → section → course → enrollment
    const lecture = await this.lecturesRepo.findById(liveClass.lectureId);
    if (!lecture) {
      throw new NotFoundException('Associated lecture not found');
    }

    const section = await this.sectionsRepo.findById(lecture.sectionId);
    if (!section) {
      throw new NotFoundException('Associated section not found');
    }

    const isEnrolled = await this.enrollmentsRepo.checkEnrollmentExists(
      user.sub,
      section.courseId,
    );

    if (!isEnrolled) {
      throw new ForbiddenException('You are not enrolled in this course');
    }

    // Check room still exists
    const roomInfo = await this.livekitService.getRoomInfo(liveClass.livekitRoomName);
    if (!roomInfo) {
      throw new BadRequestException('Live room is no longer active');
    }

    // Generate student token (subscriber)
    const tokenResult = await this.livekitService.generateStudentToken({
      roomName: liveClass.livekitRoomName,
      userId: user.sub,
      userName: user.email,
      expiresIn: dto.expiresIn,
    });

    this.logger.log(`Student ${user.sub} joined live class ${liveClass.id}`);

    return {
      token: tokenResult.token,
      identity: tokenResult.identity,
      roomName: tokenResult.roomName,
      expiresIn: tokenResult.expiresIn,
      livekitUrl: this.configService.get<string>('LIVEKIT_URL') || '',
    };
  }

  // ─── End Live Class (Instructor only) ────────────────────────────────────

  @Post('end')
  @UseGuards(JwtAuthGuard)
  @Roles('instructor')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End a live class (instructor only)' })
  @ApiResponse({ status: 200, description: 'Live class ended successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Live class not found' })
  async endLiveClass(
    @CurrentUser() user: { sub: number; role: string },
    @Body() dto: EndLiveClassDto,
  ): Promise<{ message: string }> {
    const liveClass = await this.liveClassesRepo.findById(dto.liveClassId);
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    if (liveClass.instructorId !== user.sub) {
      throw new ForbiddenException('Only the assigned instructor can end this class');
    }

    if (liveClass.status !== 'live') {
      throw new BadRequestException('Class is not currently live');
    }

    // Delete LiveKit room (kicks all participants)
    await this.livekitService.deleteRoom(liveClass.livekitRoomName);

    // Update status to "ended" and optionally save recording URL
    await this.liveClassesRepo.update(liveClass.id, {
      status: 'ended',
      ...(dto.recordingUrl ? { recordingUrl: dto.recordingUrl } : {}),
    });

    this.logger.log(`Instructor ${user.sub} ended live class ${liveClass.id}`);

    return { message: 'Live class ended successfully' };
  }

  // ─── Get Live Class Status ────────────────────────────────────────────────

  @Get('status/:liveClassId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get live class status' })
  @ApiResponse({ status: 200, description: 'Status retrieved' })
  @ApiResponse({ status: 404, description: 'Live class not found' })
  async getStatus(
    @Param('liveClassId') liveClassId: string,
  ): Promise<LiveClassStatusResponseDto> {
    const id = parseInt(liveClassId, 10);
    const liveClass = await this.liveClassesRepo.findById(id);
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    // Get room info if class is live
    let participantCount: number | undefined;
    let maxParticipants: number | undefined;
    if (liveClass.status === 'live') {
      const roomInfo = await this.livekitService.getRoomInfo(liveClass.livekitRoomName);
      if (roomInfo) {
        participantCount = roomInfo.participants;
        maxParticipants = roomInfo.maxParticipants;
      }
    }

    return {
      liveClassId: liveClass.id,
      status: liveClass.status,
      roomName: liveClass.livekitRoomName,
      participantCount,
      maxParticipants,
      recordingUrl: liveClass.recordingUrl ?? undefined,
    };
  }

  // ─── Get Room Info ────────────────────────────────────────────────────────

  @Get('room/:roomName')
  @UseGuards(JwtAuthGuard)
  @Roles('instructor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get LiveKit room details (instructor/admin)' })
  @ApiResponse({ status: 200, description: 'Room info retrieved' })
  async getRoomInfo(
    @Param('roomName') roomName: string,
  ): Promise<RoomInfoResponseDto | null> {
    const roomInfo = await this.livekitService.getRoomInfo(roomName);
    if (!roomInfo) {
      throw new NotFoundException('Room not found or not active');
    }
    return roomInfo;
  }
}
