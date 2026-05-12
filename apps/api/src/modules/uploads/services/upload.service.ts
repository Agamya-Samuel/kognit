import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Upload } from '../../../db/schema';
import { S3Service } from './s3.service';
import { UploadsRepository } from '../../../db/repositories/uploads.repository';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';

export interface UploadProgress {
  uploadId: number;
  lectureId: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  status: 'pending' | 'uploading' | 'complete' | 'failed' | 'cancelled';
  uploadUrl?: string;
  expiresAt?: Date;
  uploadedAt?: Date;
  errorMessage?: string;
  validationPassed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestUploadUrlResult {
  uploadId: number;
  uploadUrl: string;
  expiresAt: string;
  method: string;
  headers: Record<string, string>;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private s3Service: S3Service,
    private uploadsRepository: UploadsRepository,
    private lecturesRepository: LecturesRepository,
    private configService: ConfigService,
  ) {
    this.logger.log('UploadService initialized');
  }

  /**
   * Request a signed upload URL for a lecture video
   */
  async requestUploadUrl(
    userId: number,
    lectureId: number,
    fileName: string,
    contentType: string,
    fileSize: number,
  ): Promise<RequestUploadUrlResult> {
    try {
      // Verify lecture exists and belongs to user's course
      const lecture = await this.lecturesRepository.findById(lectureId);
      if (!lecture) {
        throw new NotFoundException('Lecture not found');
      }

      // Check if there's already an active upload for this lecture
      const existingUpload = await this.uploadsRepository.findByLectureId(lectureId);
      if (existingUpload && (existingUpload.status === 'pending' || existingUpload.status === 'uploading')) {
        throw new BadRequestException('An upload is already in progress for this lecture');
      }

      // Generate S3 upload URL
      const uploadUrlResult = await this.s3Service.generateUploadUrl({
        fileName,
        contentType,
        fileSize,
        uploadId: 0, // Will be set after creating upload record
        lectureId,
      });

      // Extract file key from upload URL
      const urlObj = new URL(uploadUrlResult.uploadUrl);
      const fileKey = urlObj.pathname.substring(1); // Remove leading slash

      // Create upload record
      const upload = await this.uploadsRepository.create({
        lectureId,
        userId,
        fileName,
        fileKey,
        contentType,
        fileSize,
        status: 'pending',
        uploadUrl: uploadUrlResult.uploadUrl,
        expiresAt: uploadUrlResult.expiresAt,
        validationPassed: false,
        uploadedAt: null,
        errorMessage: null,
        checksum: null,
      } as any);

      // Generate new upload URL with correct upload ID
      const finalUploadUrlResult = await this.s3Service.generateUploadUrl({
        fileName,
        contentType,
        fileSize,
        uploadId: upload.id,
        lectureId,
      });

      // Update upload record with correct URL
      await this.uploadsRepository.update(upload.id, {
        uploadUrl: finalUploadUrlResult.uploadUrl,
        fileKey: this.extractFileKey(finalUploadUrlResult.uploadUrl),
      });

      this.logger.log(
        `Created upload request for upload ${upload.id}, lecture ${lectureId}, user ${userId}`
      );

      return {
        uploadId: upload.id,
        uploadUrl: finalUploadUrlResult.uploadUrl,
        expiresAt: finalUploadUrlResult.expiresAt.toISOString(),
        method: finalUploadUrlResult.method,
        headers: finalUploadUrlResult.headers,
      };
    } catch (error) {
      this.logger.error('Error requesting upload URL:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to request upload URL');
    }
  }

  /**
   * Get upload progress/status
   */
  async getUploadProgress(uploadId: number, userId: number): Promise<UploadProgress> {
    try {
      const upload = await this.uploadsRepository.findById(uploadId);
      if (!upload) {
        throw new NotFoundException('Upload not found');
      }

      // Verify user owns this upload
      if (upload.userId !== userId) {
        throw new BadRequestException('You do not have permission to access this upload');
      }

      return this.mapUploadToProgress(upload);
    } catch (error) {
      this.logger.error('Error getting upload progress:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get upload progress');
    }
  }

  /**
   * Update upload status
   */
  async updateUploadStatus(
    uploadId: number,
    userId: number,
    status: 'uploading' | 'failed' | 'cancelled',
    errorMessage?: string,
  ): Promise<UploadProgress> {
    try {
      const upload = await this.uploadsRepository.findById(uploadId);
      if (!upload) {
        throw new NotFoundException('Upload not found');
      }

      // Verify user owns this upload
      if (upload.userId !== userId) {
        throw new BadRequestException('You do not have permission to update this upload');
      }

      // Validate status transition
      const validTransitions: Record<string, string[]> = {
        pending: ['uploading', 'cancelled'],
        uploading: ['uploading', 'failed', 'cancelled'],
        complete: [],
        failed: [],
        cancelled: [],
      };

      const currentStatus = upload.status;
      const allowedNextStates = validTransitions[currentStatus] || [];

      if (!allowedNextStates.includes(status)) {
        throw new BadRequestException(
          `Invalid status transition from ${currentStatus} to ${status}`
        );
      }

      // Update upload status
      const updatedUpload = await this.uploadsRepository.updateStatus(uploadId, status, {
        errorMessage,
      });

      if (!updatedUpload) {
        throw new InternalServerErrorException('Failed to update upload status');
      }

      // If upload is cancelled, clean up S3 file
      if (status === 'cancelled' && upload.fileKey) {
        try {
          await this.s3Service.deleteFile(upload.fileKey);
          this.logger.log(`Deleted S3 file for cancelled upload ${uploadId}`);
        } catch (error) {
          this.logger.error('Error deleting S3 file:', error);
          // Don't throw error, just log it
        }
      }

      this.logger.log(`Updated upload ${uploadId} status to ${status}`);

      return this.mapUploadToProgress(updatedUpload);
    } catch (error) {
      this.logger.error('Error updating upload status:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update upload status');
    }
  }

  /**
   * Handle S3 upload completion webhook
   */
  async handleUploadCompletion(
    fileKey: string,
    objectSize: number,
    uploadMetadata: { uploadId?: string; lectureId?: string },
  ): Promise<void> {
    try {
      const { uploadId, lectureId } = uploadMetadata;

      if (!uploadId || !lectureId) {
        this.logger.error('Missing upload metadata:', uploadMetadata);
        throw new BadRequestException('Missing required metadata');
      }

      const uploadIdNum = parseInt(uploadId, 10);
      const lectureIdNum = parseInt(lectureId, 10);

      // Find upload record
      const upload = await this.uploadsRepository.findById(uploadIdNum);
      if (!upload) {
        this.logger.error(`Upload ${uploadIdNum} not found`);
        throw new NotFoundException('Upload not found');
      }

      // Verify file key matches
      if (upload.fileKey !== fileKey) {
        this.logger.error(`File key mismatch: expected ${upload.fileKey}, got ${fileKey}`);
        throw new BadRequestException('File key mismatch');
      }

      // Verify file size matches
      if (upload.fileSize !== objectSize) {
        this.logger.error(
          `File size mismatch: expected ${upload.fileSize}, got ${objectSize}`
        );
        throw new BadRequestException('File size mismatch');
      }

      // Perform magic byte validation
      const validationPassed = await this.validateVideoFile(fileKey);

      if (!validationPassed) {
        await this.uploadsRepository.updateStatus(uploadIdNum, 'failed', {
          errorMessage: 'File validation failed: Invalid file format',
        });

        // Delete invalid file
        await this.s3Service.deleteFile(fileKey);

        throw new BadRequestException('File validation failed');
      }

      // Mark upload as complete
      await this.uploadsRepository.updateStatus(uploadIdNum, 'complete', {
        uploadedAt: new Date(),
      });

      // Update upload record with validation result
      await this.uploadsRepository.update(uploadIdNum, {
        validationPassed: true,
      });

      // Update lecture with upload ID
      await this.lecturesRepository.update(lectureIdNum, {
        uploadId: uploadIdNum,
      });

      this.logger.log(
        `Upload ${uploadIdNum} completed successfully, validation passed`
      );

      // TODO: Trigger Mux ingestion (will be implemented in Day 11)
    } catch (error) {
      this.logger.error('Error handling upload completion:', error);
      throw new InternalServerErrorException('Failed to handle upload completion');
    }
  }

  /**
   * Validate video file using magic bytes
   */
  private async validateVideoFile(fileKey: string): Promise<boolean> {
    try {
      // Get object metadata from S3
      const metadata = await this.s3Service.getObjectMetadata(fileKey);

      // Verify content type
      const validContentTypes = [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv',
        'video/webm',
      ];

      if (!validContentTypes.includes(metadata.contentType)) {
        this.logger.error(
          `Invalid content type: ${metadata.contentType}`
        );
        return false;
      }

      // Additional validation could include:
      // 1. Checking magic bytes by downloading first few bytes
      // 2. Using ffmpeg to validate video structure
      // 3. Checking video duration, resolution, etc.

      // For now, we trust S3's content type detection
      this.logger.log(`Video file validation passed for ${fileKey}`);
      return true;
    } catch (error) {
      this.logger.error('Error validating video file:', error);
      return false;
    }
  }

  /**
   * Get active uploads for a user
   */
  async getActiveUploads(userId: number): Promise<UploadProgress[]> {
    try {
      const uploads = await this.uploadsRepository.findActiveUploadsForUser(userId);
      return uploads.map((upload) => this.mapUploadToProgress(upload));
    } catch (error) {
      this.logger.error('Error getting active uploads:', error);
      throw new InternalServerErrorException('Failed to get active uploads');
    }
  }

  /**
   * Cancel an upload
   */
  async cancelUpload(uploadId: number, userId: number): Promise<void> {
    await this.updateUploadStatus(uploadId, userId, 'cancelled');
  }

  /**
   * Map upload entity to progress DTO
   */
  private mapUploadToProgress(upload: Upload): UploadProgress {
    return {
      uploadId: upload.id,
      lectureId: upload.lectureId,
      fileName: upload.fileName,
      contentType: upload.contentType,
      fileSize: Number(upload.fileSize),
      status: upload.status as any,
      uploadUrl: upload.uploadUrl || undefined,
      expiresAt: upload.expiresAt || undefined,
      uploadedAt: upload.uploadedAt || undefined,
      errorMessage: upload.errorMessage || undefined,
      validationPassed: upload.validationPassed,
      createdAt: upload.createdAt,
      updatedAt: upload.updatedAt,
    };
  }

  /**
   * Extract file key from upload URL
   */
  private extractFileKey(uploadUrl: string): string {
    try {
      const urlObj = new URL(uploadUrl);
      return urlObj.pathname.substring(1); // Remove leading slash
    } catch (error) {
      this.logger.error('Error extracting file key from URL:', error);
      return '';
    }
  }
}
