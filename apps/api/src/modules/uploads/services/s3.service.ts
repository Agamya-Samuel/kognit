import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadUrlOptions {
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadId: number;
  lectureId: number;
}

export interface UploadUrlResult {
  uploadId: number;
  uploadUrl: string;
  expiresAt: Date;
  method: string;
  headers: Record<string, string>;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly uploadExpiryMinutes = 30;
  private readonly maxFileSize = 524288000; // 500MB in bytes

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });

    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || 'edutech-uploads';

    this.logger.log(`S3Service initialized with bucket: ${this.bucketName}`);
  }

  /**
   * Generate a presigned PUT URL for S3 upload
   */
  async generateUploadUrl(options: UploadUrlOptions): Promise<UploadUrlResult> {
    try {
      const { fileName, contentType, fileSize, uploadId, lectureId } = options;

      // Validate file size
      if (fileSize > this.maxFileSize) {
        throw new InternalServerErrorException(
          `File size exceeds maximum allowed size of ${this.maxFileSize / 1024 / 1024}MB`
        );
      }

      // Validate content type for video files
      const validContentTypes = [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv',
        'video/webm',
      ];

      if (!validContentTypes.includes(contentType)) {
        throw new InternalServerErrorException(
          `Invalid content type. Allowed types: ${validContentTypes.join(', ')}`
        );
      }

      // Generate unique file key
      const fileKey = this.generateFileKey(uploadId, lectureId, fileName);

      // Create PutObject command with metadata
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        ContentType: contentType,
        Metadata: {
          uploadId: uploadId.toString(),
          lectureId: lectureId.toString(),
          originalFileName: fileName,
        },
      });

      // Generate presigned URL
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: this.uploadExpiryMinutes * 60,
      });

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.uploadExpiryMinutes);

      this.logger.log(
        `Generated upload URL for upload ${uploadId}, lecture ${lectureId}, file: ${fileName}`
      );

      return {
        uploadId,
        uploadUrl,
        expiresAt,
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
      };
    } catch (error) {
      this.logger.error('Error generating upload URL:', error);
      throw new InternalServerErrorException('Failed to generate upload URL');
    }
  }

  /**
   * Get a presigned URL for downloading/viewing a file
   */
  async getDownloadUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      this.logger.error('Error generating download URL:', error);
      throw new InternalServerErrorException('Failed to generate download URL');
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await this.s3Client.send(command);
      this.logger.log(`Deleted file from S3: ${fileKey}`);
    } catch (error) {
      this.logger.error('Error deleting file from S3:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  /**
   * Get object metadata from S3
   */
  async getObjectMetadata(fileKey: string): Promise<{
    contentType: string;
    contentLength: number;
    lastModified: Date;
    metadata: Record<string, string>;
  }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const response = await this.s3Client.send(command);

      return {
        contentType: response.ContentType || '',
        contentLength: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        metadata: response.Metadata || {},
      };
    } catch (error) {
      this.logger.error('Error getting object metadata:', error);
      throw new InternalServerErrorException('Failed to get object metadata');
    }
  }

  /**
   * Validate file key format and extract upload ID
   */
  parseFileKey(fileKey: string): { uploadId: number; lectureId: number } | null {
    try {
      // Expected format: uploads/{uploadId}/{lectureId}/{filename}
      const parts = fileKey.split('/');
      if (parts.length >= 3 && parts[0] === 'uploads') {
        const uploadId = parseInt(parts[1], 10);
        const lectureId = parseInt(parts[2], 10);

        if (!isNaN(uploadId) && !isNaN(lectureId)) {
          return { uploadId, lectureId };
        }
      }
      return null;
    } catch (error) {
      this.logger.error('Error parsing file key:', error);
      return null;
    }
  }

  /**
   * Generate a unique file key for S3
   */
  private generateFileKey(uploadId: number, lectureId: number, fileName: string): string {
    const timestamp = Date.now();
    const extension = fileName.split('.').pop();
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');

    return `uploads/${uploadId}/${lectureId}/${timestamp}-${sanitizedBaseName}.${extension}`;
  }

  /**
   * Check if S3 configuration is valid
   */
  isConfigured(): boolean {
    return !!(
      this.configService.get<string>('AWS_ACCESS_KEY_ID') &&
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY') &&
      this.configService.get<string>('AWS_S3_BUCKET')
    );
  }

  /**
   * Get CloudFront CDN URL for a file key
   */
  getCloudFrontUrl(fileKey: string): string {
    const cdnUrl = this.configService.get<string>('AWS_S3_CDN_URL');
    if (cdnUrl) {
      return `${cdnUrl}/${fileKey}`;
    }
    // Fallback to direct S3 URL
    return `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;
  }
}
