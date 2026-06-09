import { Injectable, Logger, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LiveClassesRepository } from '../../../db/repositories/live-classes.repository';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';
import { MuxService } from '../../media/services/mux.service';
import { LiveKitService } from './livekit.service';
import type { LiveClass } from '../../../db/schema';

// ─── Types ──────────────────────────────────────────────────────────────────

export type RecordingStatus = 'none' | 'recording' | 'processing' | 'ready' | 'failed';

export interface RecordingInfo {
  liveClassId: number;
  status: RecordingStatus;
  s3Key: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  playbackUrl: string | null;
  error: string | null;
}

export interface StartRecordingResult {
  liveClassId: number;
  status: 'recording';
  s3Key: string;
  message: string;
}

export interface PostSessionWorkflowResult {
  liveClassId: number;
  lectureId: number;
  recordingStatus: RecordingStatus;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  lectureUpdated: boolean;
}

// ─── Recording Service ───────────────────────────────────────────────────────

@Injectable()
export class RecordingService {
  private readonly logger = new Logger(RecordingService.name);
  private readonly s3Bucket: string;
  private readonly s3Region: string;
  private readonly s3Endpoint: string;
  private readonly egressClient: any; // LiveKit EgressClient (typed as any to handle optional SDK)

  constructor(
    private readonly configService: ConfigService,
    private readonly liveClassesRepo: LiveClassesRepository,
    private readonly lecturesRepo: LecturesRepository,
    private readonly muxService: MuxService,
    private readonly liveKitService: LiveKitService,
  ) {
    this.s3Bucket = this.configService.get<string>('AWS_S3_BUCKET') || 'edutech-recordings';
    this.s3Region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';
    this.s3Endpoint = this.configService.get<string>('AWS_S3_ENDPOINT') || `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com`;

    // Initialize LiveKit EgressClient if LiveKit is configured
    if (this.liveKitService.isConfigured()) {
      try {
        const { EgressClient } = require('livekit-server-sdk');
        const livekitUrl = this.configService.get<string>('LIVEKIT_URL') || '';
        const apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || '';
        const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || '';
        this.egressClient = new EgressClient(livekitUrl, apiKey, apiSecret);
        this.logger.log('LiveKit EgressClient initialized');
      } catch (error) {
        this.logger.warn('Failed to initialize LiveKit EgressClient: ' + error);
        this.egressClient = null;
      }
    } else {
      this.egressClient = null;
    }
  }

  /**
   * Start recording for a live class.
   * Triggers LiveKit's Egress API to start recording to S3.
   */
  async startRecording(liveClassId: number): Promise<StartRecordingResult> {
    const liveClass = await this.liveClassesRepo.findById(liveClassId);
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    if (liveClass.status !== 'live') {
      throw new InternalServerErrorException('Cannot start recording: class is not live');
    }

    if (liveClass.recordingStatus !== 'none') {
      throw new InternalServerErrorException(`Recording already in progress or completed: ${liveClass.recordingStatus}`);
    }

    // Generate S3 key for the recording
    const s3Key = `recordings/${liveClass.lectureId}/${liveClassId}-${Date.now()}.mp4`;

    // Update status to recording
    await this.liveClassesRepo.update(liveClassId, {
      recordingStatus: 'recording',
      recordingS3Key: s3Key,
    });

    this.logger.log(`Started recording for live class ${liveClassId}, S3 key: ${s3Key}`);

    // Trigger LiveKit Egress if configured
    if (this.egressClient) {
      try {
        await this.egressClient.startRoomCompositeEgress(
          liveClass.livekitRoomName,
          {
            file: {
              fileType: 1, // MP4
              filepath: s3Key,
            },
          },
          {
            s3: {
              accessKey: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
              secret: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
              region: this.s3Region,
              bucket: this.s3Bucket,
              endpoint: this.s3Endpoint,
            },
          },
        );
        this.logger.log(`LiveKit Egress started for room ${liveClass.livekitRoomName}`);
      } catch (error) {
        this.logger.error(`Failed to start LiveKit Egress for live class ${liveClassId}:`, error);
        // Continue — recording status is updated; post-session workflow will handle fallback
      }
    } else {
      this.logger.warn(`LiveKit Egress not configured; recording for live class ${liveClassId} will rely on external trigger`);
    }

    return {
      liveClassId,
      status: 'recording',
      s3Key,
      message: 'Recording started. File will be saved to S3 upon completion.',
    };
  }

  /**
   * Handle recording completion: S3 upload confirmed.
   * This would be called by a webhook from LiveKit/S3 event.
   */
  async handleRecordingComplete(liveClassId: number, s3Url: string): Promise<PostSessionWorkflowResult> {
    const liveClass = await this.liveClassesRepo.findById(liveClassId);
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    this.logger.log(`Recording complete for live class ${liveClassId}, triggering Mux ingestion`);

    // Update status to processing
    await this.liveClassesRepo.update(liveClassId, {
      recordingStatus: 'processing',
      recordingUrl: s3Url,
    });

    // Trigger Mux ingestion
    try {
      const muxResult = await this.muxService.createAsset({
        input: s3Url,
        playbackPolicy: 'public',
        mp4Support: 'standard',
      });

      // Save Mux asset info
      await this.liveClassesRepo.update(liveClassId, {
        recordingMuxAssetId: muxResult.assetId,
        recordingMuxPlaybackId: muxResult.playbackId,
      });

      this.logger.log(
        `Mux asset created for recording: ${muxResult.assetId}, playback: ${muxResult.playbackId}`,
      );

      return {
        liveClassId,
        lectureId: liveClass.lectureId,
        recordingStatus: 'processing',
        muxAssetId: muxResult.assetId,
        muxPlaybackId: muxResult.playbackId,
        lectureUpdated: false, // Will be updated when Mux webhook fires
      };
    } catch (error) {
      this.logger.error(`Mux ingestion failed for live class ${liveClassId}:`, error);

      await this.liveClassesRepo.update(liveClassId, {
        recordingStatus: 'failed',
        recordingError: `Mux ingestion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });

      return {
        liveClassId,
        lectureId: liveClass.lectureId,
        recordingStatus: 'failed',
        muxAssetId: null,
        muxPlaybackId: null,
        lectureUpdated: false,
      };
    }
  }

  /**
   * Handle Mux asset ready webhook.
   * Update the recording status and attach to the lecture.
   */
  async handleMuxAssetReady(muxAssetId: string, playbackId: string, duration: number): Promise<PostSessionWorkflowResult> {
    // Find the live class by Mux asset ID
    const allClasses = await this.liveClassesRepo.findByRecordingStatus('processing');
    const liveClass = allClasses.find(c => c.recordingMuxAssetId === muxAssetId);

    if (!liveClass) {
      this.logger.warn(`No live class found for Mux asset ${muxAssetId}`);
      throw new NotFoundException('No live class found for this Mux asset');
    }

    // Update recording status to ready
    await this.liveClassesRepo.update(liveClass.id, {
      recordingStatus: 'ready',
      recordingMuxPlaybackId: playbackId,
      recordingError: null,
    });

    // Update the associated lecture with playback info
    let lectureUpdated = false;
    try {
      const playbackUrl = this.muxService.getPlaybackUrl(playbackId);
      await this.lecturesRepo.update(liveClass.lectureId, {
        muxAssetId,
        muxPlaybackId: playbackId,
        durationSeconds: Math.round(duration),
        isPublished: true,
      });
      lectureUpdated = true;

      this.logger.log(
        `Lecture ${liveClass.lectureId} updated with recording: ${playbackUrl}`,
      );
    } catch (error) {
      this.logger.error(`Failed to update lecture ${liveClass.lectureId}:`, error);
    }

    return {
      liveClassId: liveClass.id,
      lectureId: liveClass.lectureId,
      recordingStatus: 'ready',
      muxAssetId,
      muxPlaybackId: playbackId,
      lectureUpdated,
    };
  }

  /**
   * Handle Mux asset error.
   */
  async handleMuxAssetError(muxAssetId: string, errorMessage: string): Promise<void> {
    const allClasses = await this.liveClassesRepo.findByRecordingStatus('processing');
    const liveClass = allClasses.find(c => c.recordingMuxAssetId === muxAssetId);

    if (!liveClass) {
      this.logger.warn(`No live class found for failed Mux asset ${muxAssetId}`);
      return;
    }

    await this.liveClassesRepo.update(liveClass.id, {
      recordingStatus: 'failed',
      recordingError: errorMessage,
    });

    this.logger.error(`Recording failed for live class ${liveClass.id}: ${errorMessage}`);
  }

  /**
   * Retry a failed recording pipeline.
   */
  async retryRecording(liveClassId: number): Promise<PostSessionWorkflowResult> {
    const liveClass = await this.liveClassesRepo.findById(liveClassId);
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    if (liveClass.recordingStatus !== 'failed') {
      throw new InternalServerErrorException('Can only retry failed recordings');
    }

    if (!liveClass.recordingUrl) {
      throw new InternalServerErrorException('No recording URL available for retry');
    }

    // Reset status and re-trigger
    await this.liveClassesRepo.update(liveClassId, {
      recordingStatus: 'none',
      recordingError: null,
    });

    return this.handleRecordingComplete(liveClassId, liveClass.recordingUrl);
  }

  /**
   * Get recording info for a live class.
   */
  async getRecordingInfo(liveClassId: number): Promise<RecordingInfo> {
    const liveClass = await this.liveClassesRepo.findById(liveClassId);
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    let playbackUrl: string | null = null;
    if (liveClass.recordingMuxPlaybackId) {
      playbackUrl = this.muxService.getPlaybackUrl(liveClass.recordingMuxPlaybackId);
    }

    return {
      liveClassId: liveClass.id,
      status: liveClass.recordingStatus as RecordingStatus,
      s3Key: liveClass.recordingS3Key,
      muxAssetId: liveClass.recordingMuxAssetId,
      muxPlaybackId: liveClass.recordingMuxPlaybackId,
      playbackUrl,
      error: liveClass.recordingError,
    };
  }

  /**
   * Run post-session workflow: called when a class ends.
   * If recording was active, triggers the S3 → Mux pipeline.
   */
  async runPostSessionWorkflow(liveClassId: number): Promise<PostSessionWorkflowResult | null> {
    const liveClass = await this.liveClassesRepo.findById(liveClassId);
    if (!liveClass) {
      throw new NotFoundException('Live class not found');
    }

    // Only process if recording was active
    if (liveClass.recordingStatus !== 'recording') {
      this.logger.log(`No recording to process for live class ${liveClassId}`);
      return null;
    }

    // Build S3 URL from the recording key (Egress uploads to this path)
    const s3Url = liveClass.recordingS3Key
      ? `${this.s3Endpoint}/${liveClass.recordingS3Key}`
      : liveClass.recordingUrl;

    if (!s3Url) {
      await this.liveClassesRepo.update(liveClassId, {
        recordingStatus: 'failed',
        recordingError: 'No S3 key or recording URL found',
      });
      throw new InternalServerErrorException('No recording source found');
    }

    return this.handleRecordingComplete(liveClassId, s3Url);
  }

  /**
   * Get all recordings that need processing (stuck in recording/processing state).
   */
  async getStaleRecordings(): Promise<LiveClass[]> {
    const recording = await this.liveClassesRepo.findByRecordingStatus('recording');
    const processing = await this.liveClassesRepo.findByRecordingStatus('processing');
    return [...recording, ...processing];
  }
}
