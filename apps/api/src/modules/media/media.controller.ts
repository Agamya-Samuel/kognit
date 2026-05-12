import { Controller, Get, Post, UseGuards, HttpCode, HttpStatus, Logger, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { MuxService } from './services/mux.service';
import { LecturesRepository } from '../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../db/repositories/sections.repository';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { DRIZZLE_DB } from '../../db/database.module';
import {
  RequestPlaybackUrlDto,
  PlaybackUrlResponseDto,
  VideoStatusResponseDto,
  VideoPlayerConfigDto,
} from './dto/media.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@ApiTags('media')
@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(
    private readonly muxService: MuxService,
    private readonly lecturesRepository: LecturesRepository,
    private readonly sectionsRepository: SectionsRepository,
    private readonly enrollmentsRepository: EnrollmentsRepository,
  ) {
    this.logger.log('MediaController initialized');
  }

  @Post('playback-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get signed playback URL for a lecture' })
  @ApiResponse({ status: 200, description: 'Playback URL generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not enrolled in course' })
  @ApiResponse({ status: 404, description: 'Lecture not found or video not ready' })
  async getPlaybackUrl(
    @CurrentUser() user: { sub: number; role: string },
    @Body() request: RequestPlaybackUrlDto,
  ): Promise<PlaybackUrlResponseDto> {
    try {
      const { lectureId, expiryMinutes = 60 } = request;

      // Get lecture details
      const lecture = await this.lecturesRepository.findById(lectureId);
      if (!lecture) {
        throw new NotFoundException('Lecture not found');
      }

      // Check if lecture is published
      if (!lecture.isPublished) {
        throw new NotFoundException('Lecture is not published');
      }

      // Get section to get courseId
      const section = await this.sectionsRepository.findById(lecture.sectionId);
      if (!section) {
        throw new NotFoundException('Section not found');
      }

      // Check enrollment or free preview
      const isEnrolled = await this.enrollmentsRepository.checkEnrollmentExists(
        user.sub,
        section.courseId,
      );

      if (!isEnrolled && !lecture.isFreePreview) {
        throw new BadRequestException('You are not enrolled in this course');
      }

      // Check if video is ready
      if (!lecture.muxPlaybackId) {
        throw new BadRequestException('Video is not ready for playback yet');
      }

      // Generate signed playback URL
      const signedUrl = await this.muxService.generateSignedPlaybackUrl({
        playbackId: lecture.muxPlaybackId,
        expiryMinutes,
      });

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

      this.logger.log(
        `Generated playback URL for lecture ${lectureId}, user ${user.sub}`
      );

      return {
        playbackUrl: signedUrl,
        expiresAt: expiresAt.toISOString(),
        type: 'signed',
      };
    } catch (error) {
      this.logger.error('Error generating playback URL:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to generate playback URL');
    }
  }

  @Get('public-playback-url/:lectureId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get public playback URL for free preview lectures (no auth required)' })
  @ApiResponse({ status: 200, description: 'Playback URL generated successfully' })
  @ApiResponse({ status: 404, description: 'Lecture not found or not a free preview' })
  async getPublicPlaybackUrl(
    @Param('lectureId') lectureId: string,
  ): Promise<PlaybackUrlResponseDto> {
    try {
      const lectureIdNum = parseInt(lectureId, 10);

      // Get lecture details
      const lecture = await this.lecturesRepository.findById(lectureIdNum);
      if (!lecture) {
        throw new NotFoundException('Lecture not found');
      }

      // Check if lecture is published
      if (!lecture.isPublished) {
        throw new NotFoundException('Lecture is not published');
      }

      // Check if it's a free preview
      if (!lecture.isFreePreview) {
        throw new BadRequestException(
          'This lecture is not a free preview. Please enroll in the course to watch.',
        );
      }

      // Check if video is ready
      if (!lecture.muxPlaybackId) {
        throw new BadRequestException('Video is not ready for playback yet');
      }

      // Get public playback URL (no signature)
      const playbackUrl = this.muxService.getPlaybackUrl(lecture.muxPlaybackId);

      this.logger.log(`Generated public playback URL for lecture ${lectureId}`);

      return {
        playbackUrl,
        expiresAt: '', // Public URLs don't expire
        type: 'public',
      };
    } catch (error) {
      this.logger.error('Error generating public playback URL:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to generate playback URL');
    }
  }

  @Get('video-status/:lectureId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get video processing status for a lecture' })
  @ApiResponse({ status: 200, description: 'Video status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lecture not found' })
  async getVideoStatus(
    @CurrentUser() user: { sub: number; role: string },
    @Param('lectureId') lectureId: string,
  ): Promise<VideoStatusResponseDto> {
    try {
      const lectureIdNum = parseInt(lectureId, 10);

      // Get lecture details
      const lecture = await this.lecturesRepository.findById(lectureIdNum);
      if (!lecture) {
        throw new NotFoundException('Lecture not found');
      }

      // Get section to get courseId
      const section = await this.sectionsRepository.findById(lecture.sectionId);
      if (!section) {
        throw new NotFoundException('Section not found');
      }

      // Check enrollment or free preview
      const isEnrolled = await this.enrollmentsRepository.checkEnrollmentExists(
        user.sub,
        section.courseId,
      );

      if (!isEnrolled && !lecture.isFreePreview) {
        throw new BadRequestException('You are not enrolled in this course');
      }

      let status: 'preparing' | 'ready' | 'errored' | 'none';
      let errorMessage: string | undefined;
      let thumbnailUrl: string | undefined;

      if (!lecture.muxAssetId) {
        status = 'none';
      } else if (!lecture.muxPlaybackId) {
        status = 'preparing';
        
        // Try to get fresh status from Mux
        const muxAsset = await this.muxService.getAsset(lecture.muxAssetId);
        if (muxAsset) {
          status = muxAsset.status;
          if (muxAsset.status === 'errored') {
            errorMessage = 'Video transcoding failed';
          }
        }
      } else {
        status = 'ready';
        // Generate thumbnail URL
        thumbnailUrl = `https://image.mux.com/${lecture.muxPlaybackId}/thumbnail.jpg?time=0`;
      }

      return {
        lectureId: lecture.id,
        muxAssetId: lecture.muxAssetId || undefined,
        muxPlaybackId: lecture.muxPlaybackId || undefined,
        status,
        duration: lecture.durationSeconds,
        errorMessage,
        thumbnailUrl,
      };
    } catch (error) {
      this.logger.error('Error getting video status:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to get video status');
    }
  }
}
