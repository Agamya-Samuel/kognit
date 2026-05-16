'use client';

import React, { useEffect } from 'react';
import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

let initialized = false;

function initPostHog() {
  if (initialized || typeof window === 'undefined') return;
  if (!POSTHOG_KEY) {
    console.warn('PostHog: NEXT_PUBLIC_POSTHOG_KEY not set — analytics disabled');
    return;
  }
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    loaded: () => {
      initialized = true;
    },
  });
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <>{children}</>;
}

export function usePostHog() {
  useEffect(() => {
    initPostHog();
  }, []);

  return {
    capture: (event: string, properties?: Record<string, unknown>) => {
      if (initialized) posthog.capture(event, properties);
    },
    identify: (id: string, traits?: Record<string, unknown>) => {
      if (initialized) posthog.identify(id, traits);
    },
    pageView: (url?: string) => {
      if (initialized) posthog.capture('$pageview', { $current_url: url ?? window.location.pathname });
    },
    reset: () => {
      if (initialized) posthog.reset();
    },
  };
}
