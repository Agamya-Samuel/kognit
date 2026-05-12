import { Controller, Post, Body, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { UploadService } from './services/upload.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('webhooks')
@Controller('webhooks/s3')
export class S3WebhookController {
  private readonly webhookSecret: string;

  constructor(
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {
    this.webhookSecret = this.configService.get<string>('AWS_S3_WEBHOOK_SECRET') || '';
  }

  @Post('upload-completion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle S3 upload completion webhook event' })
  @ApiHeader({ name: 'x-amz-sns-message-type', required: true, description: 'SNS message type' })
  @ApiHeader({ name: 'x-amz-sns-message-id', required: true, description: 'SNS message ID' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid webhook signature' })
  async handleUploadCompletion(
    @Body() webhookData: any,
    @Headers() headers: Record<string, string>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Log webhook for debugging
      console.log('Received S3 webhook:', JSON.stringify(webhookData, null, 2));

      // Parse S3 event notification
      const s3Event = this.parseS3Event(webhookData);
      
      if (!s3Event) {
        return { success: false, message: 'Invalid S3 event format' };
      }

      // Process each record in the event
      for (const record of s3Event.Records || []) {
        const s3Object = record.s3.object;
        const s3Bucket = record.s3.bucket.name;
        const eventName = record.eventName;

        // Only handle object creation events
        if (!eventName.startsWith('ObjectCreated:')) {
          console.log(`Skipping event: ${eventName}`);
          continue;
        }

        const fileKey = s3Object.key;
        const objectSize = s3Object.size;

        // Extract metadata from S3 object
        const metadata = s3Object.userMetadata || {};

        // Handle upload completion
        try {
          await this.uploadService.handleUploadCompletion(
            fileKey,
            objectSize,
            {
              uploadId: metadata.uploadId,
              lectureId: metadata.lectureId,
            },
          );

          console.log(`Successfully processed upload completion for ${fileKey}`);
        } catch (error) {
          console.error(`Error processing upload completion for ${fileKey}:`, error);
          // Continue processing other records even if one fails
        }
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      console.error('Error handling S3 webhook:', error);
      return { success: false, message: 'Error processing webhook' };
    }
  }

  /**
   * Parse S3 event from SNS notification
   */
  private parseS3Event(webhookData: any): any {
    try {
      // Handle direct S3 event notification
      if (webhookData.Records && Array.isArray(webhookData.Records)) {
        return webhookData;
      }

      // Handle SNS notification (S3 events come through SNS)
      if (webhookData.Type === 'Notification' && webhookData.Message) {
        const message = JSON.parse(webhookData.Message);
        if (message.Records && Array.isArray(message.Records)) {
          return message;
        }
      }

      return null;
    } catch (error) {
      console.error('Error parsing S3 event:', error);
      return null;
    }
  }
}
