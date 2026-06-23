'use client';

import { useEffect } from 'react';
import { onCLS, onLCP, onFCP, onINP, onTTFB, type Metric } from 'web-vitals';

export function WebVitalsReporter() {
  useEffect(() => {
    const report = (metric: Metric) => {
      // eslint-disable-next-line no-console
      console.log(`[CWV] ${metric.name}: ${metric.value.toFixed(2)}`);
    };

    onCLS(report);
    onLCP(report);
    onFCP(report);
    onINP(report);
    onTTFB(report);
  }, []);

  return null;
}
