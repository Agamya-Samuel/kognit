'use client';

import { ConnectionQuality as LkConnectionQuality } from 'livekit-client';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ConnectionQualityIndicatorProps {
  /** Connection quality value from LiveKit */
  quality: LkConnectionQuality;
  /** Whether to show a text label alongside the indicator */
  showLabel?: boolean;
  /** Additional CSS class */
  className?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getQualityConfig(quality: LkConnectionQuality) {
  switch (quality) {
    case LkConnectionQuality.Excellent:
      return {
        label: 'Excellent',
        color: 'bg-green-500',
        textColor: 'text-green-500',
        bars: 4,
      };
    case LkConnectionQuality.Good:
      return {
        label: 'Good',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-500',
        bars: 3,
      };
    case LkConnectionQuality.Poor:
      return {
        label: 'Poor',
        color: 'bg-red-500',
        textColor: 'text-red-500',
        bars: 1,
      };
    case LkConnectionQuality.Lost:
      return {
        label: 'Lost',
        color: 'bg-gray-400',
        textColor: 'text-gray-400',
        bars: 0,
      };
    default:
      return {
        label: 'Unknown',
        color: 'bg-gray-400',
        textColor: 'text-gray-400',
        bars: 0,
      };
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ConnectionQualityIndicator({
  quality,
  showLabel = false,
  className = '',
}: ConnectionQualityIndicatorProps) {
  const config = getQualityConfig(quality);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Signal bars */}
      <div className="flex items-end gap-0.5 h-4">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-1 rounded-sm transition-colors ${
              bar <= config.bars ? config.color : 'bg-gray-600'
            }`}
            style={{ height: `${bar * 25}%` }}
          />
        ))}
      </div>

      {/* Label */}
      {showLabel && (
        <span className={`text-xs font-medium ${config.textColor}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

export type { ConnectionQualityIndicatorProps as ConnectionQualityIndicatorPropsType };
