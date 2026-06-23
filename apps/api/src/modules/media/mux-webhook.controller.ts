import { Controller, Post, Body, HttpCode, HttpStatus, Headers, Logger, Req, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { MuxService, MuxWebhookEvent } from './services/mux.service';
import { LecturesRepository } from '../../db/repositories/lectures.repository';
import { DRIZZLE_DB } from '../../db/database.module';
import { Public } from '../auth/decorators/auth.decorators';

@ApiTags('webhooks')
@Controller('webhooks/mux')
export class MuxWebhookController {
  private readonly logger = new Logger(MuxWebhookController.name);

  constructor(
    private readonly muxService: MuxService,
    private readonly lecturesRepository: LecturesRepository,
  ) {
    this.logger.log('MuxWebhookController initialized');
  }

  @Public()
  @Post('asset-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Mux asset status webhook events' })
  @ApiHeader({ name: 'mux-signature', required: true, description: 'Mux webhook signature' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid webhook signature' })
  async handleAssetStatus(
    @Body() webhookData: any,
    @Headers() headers: Record<string, string>,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate webhook signature using the raw (un-parsed) body.
      // JSON.stringify(webhookData) would re-serialize the parsed object and
      // break the HMAC because key ordering / whitespace would differ from
      // the original byte stream Mux signed.
      const rawBody = req.rawBody?.toString('utf8') ?? '';
      const isValid = this.muxService.validateWebhookSignature(
        headers,
        rawBody,
      );

      if (!isValid) {
        this.logger.warn('Invalid webhook signature received');
        return { success: false, message: 'Invalid webhook signature' };
      }

      // Parse webhook event
      const event = this.muxService.parseWebhookEvent(webhookData);
      
      if (!event) {
        this.logger.error('Failed to parse webhook event');
        return { success: false, message: 'Invalid webhook event' };
      }

      this.logger.log(
        `Received Mux webhook event: ${event.type} for asset ${event.data.object.id}`
      );

      // Handle different event types
      switch (event.type) {
        case 'video.asset.ready':
          await this.handleAssetReady(event);
          break;

        case 'video.asset.errored':
          await this.handleAssetError(event);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
          return { success: true, message: 'Event type not handled' };
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error('Error handling Mux webhook:', error);
      return { success: false, message: 'Error processing webhook' };
    }
  }

  /**
   * Handle asset ready event
   */
  private async handleAssetReady(event: MuxWebhookEvent): Promise<void> {
    try {
      const asset = event.data.object;
      
      // Find lecture by Mux asset ID
      const lecture = await this.lecturesRepository.findByMuxAssetId(asset.id);

      if (!lecture) {
        this.logger.warn(`No lecture found for Mux asset ${asset.id}`);
        return;
      }

      // Update lecture with Mux playback ID and duration
      const playbackId = asset.playback_ids?.[0]?.id;
      const duration = Math.round(asset.duration || 0);

      await this.lecturesRepository.update(lecture.id, {
        muxPlaybackId: playbackId || null,
        durationSeconds: duration,
      });

      this.logger.log(
        `Updated lecture ${lecture.id} with playback ID ${playbackId} and duration ${duration}s`
      );
    } catch (error) {
      this.logger.error('Error handling asset ready event:', error);
      throw error;
    }
  }

  /**
   * Handle asset error event
   */
  private async handleAssetError(event: MuxWebhookEvent): Promise<void> {
    try {
      const asset = event.data.object;
      
      // Find lecture by Mux asset ID
      const lecture = await this.lecturesRepository.findByMuxAssetId(asset.id);

      if (!lecture) {
        this.logger.warn(`No lecture found for Mux asset ${asset.id}`);
        return;
      }

      // Extract error messages
      const errorMessages = asset.errors?.map(e => e.messages.join(', ')).join('; ') || 'Unknown error';

      this.logger.error(
        `Mux asset ${asset.id} transcoding failed: ${errorMessages}`
      );

      // In a production system, you would:
      // 1. Mark the lecture as having an error
      // 2. Notify the instructor via email/notification
      // 3. Create a support ticket or alert
      // For now, we just log the error

    } catch (error) {
      this.logger.error('Error handling asset error event:', error);
      throw error;
    }
  }
}
