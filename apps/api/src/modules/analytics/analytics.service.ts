import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';

export interface AnalyticsEvent {
  distinctId: string;
  event: string;
  properties?: Record<string, any>;
}

@Injectable()
export class AnalyticsService implements OnModuleDestroy {
  private readonly logger = new Logger(AnalyticsService.name);
  private client: PostHog | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('app.POSTHOG_API_KEY');
    const host = this.configService.get<string>('app.POSTHOG_HOST');

    if (apiKey) {
      this.client = new PostHog(apiKey, { host: host || 'https://app.posthog.com' });
      this.logger.log('PostHog analytics initialized');
    } else {
      this.logger.warn('PostHog API key not set — analytics disabled');
    }
  }

  /**
   * Track an event
   */
  async capture(event: AnalyticsEvent): Promise<void> {
    if (!this.client) return;

    try {
      this.client.capture({
        distinctId: event.distinctId,
        event: event.event,
        properties: event.properties,
      });
    } catch (error) {
      this.logger.error('Failed to capture analytics event', error);
    }
  }

  /**
   * Identify a user with traits
   */
  async identify(distinctId: string, traits: Record<string, any>): Promise<void> {
    if (!this.client) return;

    try {
      this.client.identify({ distinctId, properties: traits });
    } catch (error) {
      this.logger.error('Failed to identify user', error);
    }
  }

  /**
   * Track a page view
   */
  async pageView(distinctId: string, pageName: string, properties?: Record<string, any>): Promise<void> {
    await this.capture({
      distinctId,
      event: '$pageview',
      properties: { $current_url: pageName, ...properties },
    });
  }

  /**
   * Track video events
   */
  async trackVideoEvent(
    distinctId: string,
    action: 'started' | 'completed' | 'paused',
    lectureId: number,
    courseId: number,
    properties?: Record<string, any>,
  ): Promise<void> {
    await this.capture({
      distinctId,
      event: `video_${action}`,
      properties: { lectureId, courseId, ...properties },
    });
  }

  /**
   * Track enrollment event
   */
  async trackEnrollment(
    distinctId: string,
    courseId: number,
    accessType: string,
  ): Promise<void> {
    await this.capture({
      distinctId,
      event: 'enrollment_created',
      properties: { courseId, accessType },
    });
  }

  /**
   * Track purchase event
   */
  async trackPurchase(
    distinctId: string,
    courseId: number,
    amount: number,
    currency: string,
  ): Promise<void> {
    await this.capture({
      distinctId,
      event: 'purchase_completed',
      properties: { courseId, amount, currency },
    });
  }

  /**
   * Track assignment submission
   */
  async trackAssignmentSubmission(
    distinctId: string,
    assignmentId: number,
    courseId: number,
  ): Promise<void> {
    await this.capture({
      distinctId,
      event: 'assignment_submitted',
      properties: { assignmentId, courseId },
    });
  }

  /**
   * Track live class attendance
   */
  async trackLiveAttendance(
    distinctId: string,
    liveClassId: number,
    courseId: number,
  ): Promise<void> {
    await this.capture({
      distinctId,
      event: 'live_class_attended',
      properties: { liveClassId, courseId },
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.shutdown();
    }
  }
}
