'use client';

import { useEffect } from 'react';
import { onCLS, onLCP, onFCP, onINP, onTTFB, type Metric } from 'web-vitals';

export interface WebVitalsOptions {
  /** Optional callback to send metrics to an analytics endpoint */
  onReport?: (metric: Metric) => void;
  /** Log metrics to console in development (default: true) */
  debug?: boolean;
}

const DEFAULT_THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  LCP: { good: 2500, needsImprovement: 4000 },
  FCP: { good: 1800, needsImprovement: 3000 },
  INP: { good: 200, needsImprovement: 500 },
  TTFB: { good: 800, needsImprovement: 1800 },
} as const;

function getRating(value: number, thresholds: { good: number; needsImprovement: number }): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

function logMetric(metric: Metric) {
  const thresholds = DEFAULT_THRESHOLDS[metric.name as keyof typeof DEFAULT_THRESHOLDS];
  const rating = thresholds ? getRating(metric.value, thresholds) : 'unknown';
  const style = rating === 'good' ? 'color: #0cce6b' : rating === 'needs-improvement' ? 'color: #ffa400' : 'color: #ff4e42';

  // eslint-disable-next-line no-console
  console.log(
    `%c[CWV] ${metric.name}: ${metric.value.toFixed(2)} (${rating})`,
    style,
  );
}

/**
 * Client component that reports Core Web Vitals metrics.
 * Place inside the root layout to monitor CWV across all pages.
 */
export function WebVitalsReporter({ onReport, debug = process.env.NODE_ENV === 'development' }: WebVitalsOptions = {}) {
  useEffect(() => {
    const report = (metric: Metric) => {
      if (debug) logMetric(metric);
      onReport?.(metric);
    };

    onCLS(report);
    onLCP(report);
    onFCP(report);
    onINP(report);
    onTTFB(report);
  }, [onReport, debug]);

  return null;
}
