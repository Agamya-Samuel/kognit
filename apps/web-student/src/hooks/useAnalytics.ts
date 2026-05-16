'use client';

import { useCallback } from 'react';
import { usePostHog } from '@/lib/posthog';

export function useAnalytics() {
  const ph = usePostHog();

  const trackPageView = useCallback((url: string) => {
    ph.pageView(url);
  }, [ph]);

  const trackVideoStart = useCallback((lectureId: number, courseId: number) => {
    ph.capture('video_started', { lectureId, courseId });
  }, [ph]);

  const trackVideoComplete = useCallback((lectureId: number, courseId: number) => {
    ph.capture('video_completed', { lectureId, courseId });
  }, [ph]);

  const trackEnrollment = useCallback((courseId: number, accessType: string) => {
    ph.capture('enrollment_created', { courseId, accessType });
  }, [ph]);

  const trackPurchase = useCallback((courseId: number, amount: number, currency: string) => {
    ph.capture('purchase_completed', { courseId, amount, currency });
  }, [ph]);

  const trackAssignmentSubmit = useCallback((assignmentId: number, courseId: number) => {
    ph.capture('assignment_submitted', { assignmentId, courseId });
  }, [ph]);

  const trackLiveAttendance = useCallback((liveClassId: number, courseId: number) => {
    ph.capture('live_class_attended', { liveClassId, courseId });
  }, [ph]);

  const identifyUser = useCallback((userId: string, traits?: Record<string, unknown>) => {
    ph.identify(userId, traits);
  }, [ph]);

  return {
    trackPageView,
    trackVideoStart,
    trackVideoComplete,
    trackEnrollment,
    trackPurchase,
    trackAssignmentSubmit,
    trackLiveAttendance,
    identifyUser,
  };
}
