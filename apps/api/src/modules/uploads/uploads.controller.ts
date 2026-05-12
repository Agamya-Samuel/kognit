import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './services/upload.service';
import {
  RequestUploadUrlDto,
  UpdateUploadStatusDto,
  UploadUrlResponseDto,
  UploadProgressResponseDto,
  WebhookEventDto,
} from './dto/upload.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('request-url/:lectureId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a signed S3 upload URL for a lecture video' })
  @ApiResponse({ status: 200, description: 'Upload URL generated successfully', type: UploadUrlResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - invalid parameters or active upload exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lecture not found' })
  async requestUploadUrl(
    @Param('lectureId') lectureId: string,
    @Body() requestUploadUrlDto: RequestUploadUrlDto,
    @Request() req: any,
  ): Promise<UploadUrlResponseDto> {
    const userId = req.user.id;
    const lectureIdNum = parseInt(lectureId, 10);

    const result = await this.uploadService.requestUploadUrl(
      userId,
      lectureIdNum,
      requestUploadUrlDto.fileName,
      requestUploadUrlDto.contentType,
      requestUploadUrlDto.fileSize,
    );

    return result;
  }

  @Get(':uploadId')
  @ApiOperation({ summary: 'Get upload progress and status' })
  @ApiResponse({ status: 200, description: 'Upload progress retrieved successfully', type: UploadProgressResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - you do not own this upload' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  async getUploadProgress(
    @Param('uploadId') uploadId: string,
    @Request() req: any,
  ): Promise<UploadProgressResponseDto> {
    const userId = req.user.id;
    const uploadIdNum = parseInt(uploadId, 10);

    const progress = await this.uploadService.getUploadProgress(uploadIdNum, userId);
    return this.mapProgressToDto(progress);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active uploads for the current user' })
  @ApiResponse({ status: 200, description: 'Active uploads retrieved successfully', type: [UploadProgressResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getActiveUploads(@Request() req: any): Promise<UploadProgressResponseDto[]> {
    const userId = req.user.id;

    const uploads = await this.uploadService.getActiveUploads(userId);
    return uploads.map((upload) => this.mapProgressToDto(upload));
  }

  @Put(':uploadId/status')
  @ApiOperation({ summary: 'Update upload status' })
  @ApiResponse({ status: 200, description: 'Upload status updated successfully', type: UploadProgressResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - invalid status transition' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - you do not own this upload' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  async updateUploadStatus(
    @Param('uploadId') uploadId: string,
    @Body() updateStatusDto: UpdateUploadStatusDto,
    @Request() req: any,
  ): Promise<UploadProgressResponseDto> {
    const userId = req.user.id;
    const uploadIdNum = parseInt(uploadId, 10);

    if (!updateStatusDto.status || updateStatusDto.status === 'pending' || updateStatusDto.status === 'complete') {
      throw new Error('Invalid status transition');
    }

    const progress = await this.uploadService.updateUploadStatus(
      uploadIdNum,
      userId,
      updateStatusDto.status as 'uploading' | 'failed' | 'cancelled',
      updateStatusDto.errorMessage,
    );

    return this.mapProgressToDto(progress);
  }

  @Delete(':uploadId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel an upload' })
  @ApiResponse({ status: 204, description: 'Upload cancelled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - you do not own this upload' })
  @ApiResponse({ status: 404, description: 'Upload not found' })
  async cancelUpload(@Param('uploadId') uploadId: string, @Request() req: any): Promise<void> {
    const userId = req.user.id;
    const uploadIdNum = parseInt(uploadId, 10);

    await this.uploadService.cancelUpload(uploadIdNum, userId);
  }

  /**
   * Map progress object to DTO
   */
  private mapProgressToDto(progress: any): UploadProgressResponseDto {
    return {
      id: progress.uploadId,
      lectureId: progress.lectureId,
      fileName: progress.fileName,
      contentType: progress.contentType,
      fileSize: progress.fileSize,
      status: progress.status,
      uploadUrl: progress.uploadUrl,
      expiresAt: progress.expiresAt?.toISOString(),
      uploadedAt: progress.uploadedAt?.toISOString(),
      errorMessage: progress.errorMessage,
      validationPassed: progress.validationPassed,
      createdAt: progress.createdAt.toISOString(),
      updatedAt: progress.updatedAt.toISOString(),
    };
  }
}
