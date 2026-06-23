import { Controller, Post, Body, HttpCode, HttpStatus, Headers, Req, RawBodyRequest, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { Request } from 'express';
import { createVerify } from 'crypto';
import { UploadService } from './services/upload.service';
import { Public } from '../auth/decorators/auth.decorators';

// In-memory cache for SNS signing certificates, keyed by SigningCertURL.
// Certs are stable for long periods; we re-fetch after 1 hour to be safe.
const certCache = new Map<string, { cert: string; expires: number }>();
const CERT_CACHE_TTL_MS = 60 * 60 * 1000;

@ApiTags('webhooks')
@Controller('webhooks/s3')
export class S3WebhookController {
  private readonly logger = new Logger(S3WebhookController.name);

  constructor(
    private readonly uploadService: UploadService,
  ) {}

  @Public()
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
    @Req() req: RawBodyRequest<Request>,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Signature verification MUST run before any other work and MUST use
      // the un-parsed body — JSON.stringify(webhookData) would re-serialize
      // and break the HMAC. rawBody is populated by Express when
      // ExpressAdapter({ rawBody: true }) is set in main.ts.
      if (!req.rawBody) {
        throw new BadRequestException('Missing raw body');
      }
      await this.verifySnsSignature(webhookData, req.rawBody);

      const messageType = webhookData.Type as string;
      this.logger.log(`Received SNS message of type ${messageType}`);

      if (messageType === 'SubscriptionConfirmation') {
        // Confirm the subscription by GETting the SubscribeURL. SNS will
        // only retry sending Notifications until we confirm.
        const subscribeUrl = webhookData.SubscribeURL as string;
        if (subscribeUrl) {
          const res = await fetch(subscribeUrl);
          if (!res.ok) {
            throw new BadRequestException(`Failed to confirm subscription: ${res.status}`);
          }
          this.logger.log('SNS subscription confirmed');
        }
        return { success: true, message: 'Subscription confirmed' };
      }

      if (messageType !== 'Notification') {
        return { success: true, message: `Ignored message type ${messageType}` };
      }

      // Parse the inner S3 event from the SNS Message payload.
      const s3Event = this.parseS3Event(webhookData);
      if (!s3Event) {
        return { success: false, message: 'Invalid S3 event format' };
      }

      // Process each record in the event
      for (const record of s3Event.Records || []) {
        const s3Object = record.s3.object;
        const eventName = record.eventName;

        // Only handle object creation events
        if (!eventName.startsWith('ObjectCreated:')) {
          this.logger.log(`Skipping event: ${eventName}`);
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

          this.logger.log(`Successfully processed upload completion for ${fileKey}`);
        } catch (error) {
          this.logger.error(`Error processing upload completion for ${fileKey}:`, error);
          // Continue processing other records even if one fails
        }
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      // verification throws UnauthorizedException; anything else is a server error
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error handling S3 webhook:', error);
      return { success: false, message: 'Error processing webhook' };
    }
  }

  /**
   * Verify an SNS message signature per AWS spec.
   *   https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html
   * The signature is RSA-SHA1 over a canonical string of specific fields.
   */
  private async verifySnsSignature(envelope: any, rawBody: Buffer): Promise<void> {
    if (
      envelope.Type !== 'Notification' &&
      envelope.Type !== 'SubscriptionConfirmation'
    ) {
      throw new BadRequestException('Invalid SNS message type');
    }
    if (envelope.SignatureVersion !== '1') {
      throw new BadRequestException(`Unsupported SignatureVersion: ${envelope.SignatureVersion}`);
    }
    const certUrl = envelope.SigningCertURL as string;
    if (!this.isAllowedCertUrl(certUrl)) {
      throw new UnauthorizedException('Disallowed SigningCertURL');
    }

    // Canonical string: list required fields in alphabetical order, each
    // terminated with a newline. SubscribeURL is only present for
    // SubscriptionConfirmation messages.
    const fields = [
      'Message',
      'MessageId',
      'Subject',
      'Timestamp',
      'TopicArn',
      'Type',
    ];
    if (envelope.SubscribeURL) {
      fields.push('SubscribeURL');
    }
    const canonical = fields
      .filter((f) => envelope[f] !== undefined)
      .map((f) => `${f}\n${envelope[f]}\n`)
      .join('');

    const cert = await this.fetchAndCacheCert(certUrl);
    const verifier = createVerify('RSA-SHA1');
    verifier.update(canonical);
    verifier.end();
    const ok = verifier.verify(cert, envelope.Signature, 'base64');
    if (!ok) {
      throw new UnauthorizedException('Invalid SNS signature');
    }
  }

  /**
   * SigningCertURL must be HTTPS and the hostname must end in
   *   .amazonaws.com or .amazon.com
   * to prevent the cert-substitution attack. Reject IPs.
   */
  private isAllowedCertUrl(urlStr: string): boolean {
    try {
      const url = new URL(urlStr);
      if (url.protocol !== 'https:') return false;
      const host = url.hostname;
      if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return false; // reject IPs
      return host.endsWith('.amazonaws.com') || host.endsWith('.amazon.com');
    } catch {
      return false;
    }
  }

  /**
   * Fetch and cache the signing certificate, re-fetching after CERT_CACHE_TTL_MS.
   * In-memory cache is fine here — there is one endpoint with infrequent cert rotation.
   */
  private async fetchAndCacheCert(urlStr: string): Promise<string> {
    const cached = certCache.get(urlStr);
    if (cached && cached.expires > Date.now()) {
      return cached.cert;
    }
    const res = await fetch(urlStr);
    if (!res.ok) {
      throw new UnauthorizedException(`Failed to fetch signing cert: ${res.status}`);
    }
    const cert = await res.text();
    certCache.set(urlStr, { cert, expires: Date.now() + CERT_CACHE_TTL_MS });
    return cert;
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
      this.logger.error('Error parsing S3 event:', error);
      return null;
    }
  }
}
