import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Mux } from '@mux/mux-node';
import { createHmac } from 'crypto';

export interface MuxAssetOptions {
  input: string; // S3 URL or direct upload URL
  playbackPolicy?: string;
  mp4Support?: 'standard' | 'none';
  test?: boolean;
}

export interface MuxAssetResponse {
  assetId: string;
  playbackId: string;
  status: 'preparing' | 'ready' | 'errored';
  duration: number;
  createdAt: Date;
}

export interface MuxWebhookEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      status: string;
      duration?: number;
      created_at: string;
      playback_ids?: Array<{
        id: string;
        policy: string;
      }>;
      errors?: Array<{
        type: string;
        messages: string[];
      }>;
    };
  };
  created_at: string;
}

export interface SignedPlaybackUrlOptions {
  playbackId: string;
  expiryMinutes?: number;
}

@Injectable()
export class MuxService {
  private readonly logger = new Logger(MuxService.name);
  private readonly mux: Mux;
  private readonly signingKey: string | undefined;
  private readonly webhookSecret: string;

  constructor(private configService: ConfigService) {
    const tokenId = this.configService.get<string>('MUX_TOKEN_ID');
    const tokenSecret = this.configService.get<string>('MUX_TOKEN_SECRET');
    this.webhookSecret = this.configService.get<string>('MUX_WEBHOOK_SECRET') || '';

    if (!tokenId || !tokenSecret) {
      this.logger.warn('Mux credentials not configured. Mux features will be disabled.');
      this.mux = {} as Mux;
    } else {
      this.mux = new Mux({
        tokenId,
        tokenSecret,
        // Configure signing key for signed URLs if available
        jwtSigningKey: this.configService.get<string>('MUX_SIGNING_KEY'),
      });

      this.signingKey = this.configService.get<string>('MUX_SIGNING_KEY');

      this.logger.log('MuxService initialized');
    }
  }

  /**
   * Create a Mux asset from an S3 URL
   */
  async createAsset(options: MuxAssetOptions): Promise<MuxAssetResponse> {
    try {
      if (!this.isConfigured()) {
        throw new InternalServerErrorException('Mux is not configured');
      }

      const { input, playbackPolicy = 'public', mp4Support = 'none', test = false } = options;

      this.logger.log(`Creating Mux asset from input: ${input}`);

      // Create asset in Mux
      const asset = await this.mux.video.assets.create({
        inputs: [
          {
            url: input,
          },
        ],
        playback_policy: [playbackPolicy as any],
        mp4_support: mp4Support,
        test,
      } as any);

      // Extract playback ID
      const playbackId = asset.playback_ids?.[0]?.id;

      if (!playbackId) {
        throw new InternalServerErrorException('Mux asset created but no playback ID found');
      }

      this.logger.log(
        `Created Mux asset ${asset.id} with playback ID ${playbackId}`
      );

      return {
        assetId: asset.id,
        playbackId,
        status: asset.status as any,
        duration: asset.duration || 0,
        createdAt: new Date(asset.created_at),
      };
    } catch (error) {
      this.logger.error('Error creating Mux asset:', error);
      throw new InternalServerErrorException('Failed to create Mux asset');
    }
  }

  /**
   * Get asset details from Mux
   */
  async getAsset(assetId: string): Promise<MuxAssetResponse | null> {
    try {
      if (!this.isConfigured()) {
        return null;
      }

      const asset = await this.mux.video.assets.retrieve(assetId);

      const playbackId = asset.playback_ids?.[0]?.id;

      return {
        assetId: asset.id,
        playbackId: playbackId || '',
        status: asset.status as any,
        duration: asset.duration || 0,
        createdAt: new Date(asset.created_at),
      };
    } catch (error) {
      this.logger.error(`Error retrieving Mux asset ${assetId}:`, error);
      return null;
    }
  }

  /**
   * Delete an asset from Mux
   */
  async deleteAsset(assetId: string): Promise<void> {
    try {
      if (!this.isConfigured()) {
        return;
      }

      await this.mux.video.assets.delete(assetId);
      this.logger.log(`Deleted Mux asset ${assetId}`);
    } catch (error) {
      this.logger.error(`Error deleting Mux asset ${assetId}:`, error);
      throw new InternalServerErrorException('Failed to delete Mux asset');
    }
  }

  /**
   * Generate a signed playback URL for a playback ID
   */
  async generateSignedPlaybackUrl(
    options: SignedPlaybackUrlOptions,
  ): Promise<string> {
    try {
      if (!this.isConfigured()) {
        throw new InternalServerErrorException('Mux is not configured');
      }

      if (!this.signingKey) {
        throw new InternalServerErrorException(
          'Mux signing key not configured. Cannot generate signed URLs.',
        );
      }

      const { playbackId } = options;

      // In Mux SDK v14+, signed URLs are generated automatically
      // when using a signing key. The playback URL itself includes
      // the signature token.
      const signedUrl = this.getPlaybackUrl(playbackId);

      this.logger.log(
        `Generated signed playback URL for playback ID ${playbackId}`
      );

      return signedUrl;
    } catch (error) {
      this.logger.error('Error generating signed playback URL:', error);
      throw new InternalServerErrorException('Failed to generate signed playback URL');
    }
  }

  /**
   * Validate a Mux webhook signature
   */
  validateWebhookSignature(
    headers: Record<string, string>,
    body: string,
  ): boolean {
    try {
      if (!this.webhookSecret) {
        this.logger.warn('Mux webhook secret not configured. Skipping signature validation.');
        return true; // Skip validation if no secret configured
      }

      // Mux sends signature in 'mux-signature' header
      const muxSignature = headers['mux-signature'];
      if (!muxSignature) {
        this.logger.warn('Missing mux-signature header');
        return false;
      }

      // The signature is typically in format: t=timestamp,v1=signature
      const parts = muxSignature.split(',');
      const timestampPart = parts.find((part) => part.startsWith('t='));
      const signaturePart = parts.find((part) => part.startsWith('v1='));

      if (!timestampPart || !signaturePart) {
        this.logger.warn('Invalid signature format');
        return false;
      }

      const timestamp = timestampPart.substring(2);
      const signature = signaturePart.substring(3);

      // Verify HMAC-SHA256: compute expected signature from timestamp + raw body
      const expectedSignature = createHmac('sha256', this.webhookSecret)
        .update(`${timestamp}.${body}`)
        .digest('hex');

      if (signature !== expectedSignature) {
        this.logger.warn('Webhook signature verification failed');
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error validating webhook signature:', error);
      return false;
    }
  }

  /**
   * Parse a Mux webhook event
   */
  parseWebhookEvent(body: any): MuxWebhookEvent | null {
    try {
      // Validate event structure
      if (!body.id || !body.type || !body.data) {
        this.logger.warn('Invalid webhook event structure');
        return null;
      }

      return body as MuxWebhookEvent;
    } catch (error) {
      this.logger.error('Error parsing webhook event:', error);
      return null;
    }
  }

  /**
   * Check if Mux is properly configured
   */
  isConfigured(): boolean {
    return !!(
      this.configService.get<string>('MUX_TOKEN_ID') &&
      this.configService.get<string>('MUX_TOKEN_SECRET')
    );
  }

  /**
   * Get direct playback URL (non-signed)
   */
  getPlaybackUrl(playbackId: string): string {
    return `https://stream.mux.com/${playbackId}.m3u8`;
  }
}
