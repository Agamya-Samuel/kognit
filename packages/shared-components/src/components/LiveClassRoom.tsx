'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
  useRoomContext,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ConnectionQualityIndicator } from './ConnectionQualityIndicator';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LiveClassRoomProps {
  /** LiveKit server URL */
  livekitUrl: string;
  /** LiveKit access token */
  token: string;
  /** Whether the current user is an instructor (gets publisher controls) */
  isInstructor: boolean;
  /** Callback when the room disconnects */
  onDisconnected?: () => void;
  /** Callback when connection error occurs */
  onError?: (error: Error) => void;
  /** Callback when instructor wants to end class */
  onEndClass?: () => void;
  /** Whether to show the embedded control bar */
  showControls?: boolean;
  /** Additional CSS class */
  className?: string;
}

// ─── Inner Component (needs Room context) ───────────────────────────────────

function LiveClassRoomInner({
  isInstructor,
  onEndClass,
}: {
  isInstructor: boolean;
  onEndClass?: () => void;
}) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const room = useRoomContext();
  const [participantCount, setParticipantCount] = useState(1);

  useEffect(() => {
    const updateCount = () => {
      setParticipantCount(room.remoteParticipants.size + 1);
    };

    room.on('participantConnected', updateCount);
    room.on('participantDisconnected', updateCount);

    return () => {
      room.off('participantConnected', updateCount);
      room.off('participantDisconnected', updateCount);
    };
  }, [room]);

  return (
    <div className="flex flex-col h-full bg-gray-950 rounded-lg overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-white text-sm font-medium">LIVE</span>
          </div>
          <span className="text-gray-400 text-sm">
            {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ConnectionQualityIndicator
            quality={room.localParticipant.connectionQuality}
            showLabel
            className="text-white/70"
          />

          {isInstructor && onEndClass && (
            <button
              onClick={onEndClass}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              End Class
            </button>
          )}
        </div>
      </div>

      {/* Video area */}
      <div className="flex-1 relative">
        {tracks.length > 0 ? (
          <GridLayout tracks={tracks} style={{ height: '100%' }}>
            <ParticipantTile />
          </GridLayout>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Waiting for participants</p>
              <p className="text-sm">The instructor has not started sharing yet</p>
            </div>
          </div>
        )}
      </div>

      {/* Audio renderer for remote participants */}
      <RoomAudioRenderer />

      {/* Control bar */}
      <ControlBar
        variation={isInstructor ? 'verbose' : 'minimal'}
        controls={{
          microphone: isInstructor,
          camera: isInstructor,
          screenShare: isInstructor,
          leave: true,
        }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function LiveClassRoom({
  livekitUrl,
  token,
  isInstructor,
  onDisconnected,
  onError,
  onEndClass,
  className = '',
}: LiveClassRoomProps) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleConnected = useCallback(() => {
    setIsConnecting(false);
    setConnectionError(null);
  }, []);

  const handleDisconnected = useCallback(() => {
    setIsConnecting(false);
    onDisconnected?.();
  }, [onDisconnected]);

  const handleError = useCallback(
    (error: Error) => {
      setIsConnecting(false);
      setConnectionError(error.message);
      onError?.(error);
    },
    [onError],
  );

  // Loading state while connecting
  if (!token || !livekitUrl) {
    return (
      <div
        className={`flex items-center justify-center aspect-video bg-gray-900 rounded-lg ${className}`}
      >
        <div className="text-center text-white">
          <div className="relative w-16 h-16 mb-4 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-semibold mb-1">Preparing Live Session</p>
          <p className="text-sm text-gray-400">Setting up your live classroom...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (connectionError) {
    return (
      <div
        className={`flex items-center justify-center aspect-video bg-gray-900 rounded-lg ${className}`}
      >
        <div className="text-center text-white p-6">
          <div className="w-16 h-16 mb-4 mx-auto text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold mb-2">Connection Error</p>
          <p className="text-sm text-gray-400 mb-4">{connectionError}</p>
          <button
            onClick={() => {
              setConnectionError(null);
              setIsConnecting(true);
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`aspect-video ${className}`}>
      <LiveKitRoom
        serverUrl={livekitUrl}
        token={token}
        connect={true}
        audio={isInstructor}
        video={isInstructor}
        onConnected={handleConnected}
        onDisconnected={handleDisconnected}
        onError={handleError}
        data-lk-theme="default"
        style={{ height: '100%' }}
      >
        {isConnecting ? (
          <div className="flex items-center justify-center h-full bg-gray-950 rounded-lg">
            <div className="text-center text-white">
              <div className="relative w-12 h-12 mb-4 mx-auto">
                <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-sm text-gray-400">Connecting to live session...</p>
            </div>
          </div>
        ) : (
          <LiveClassRoomInner
            isInstructor={isInstructor}
            onEndClass={onEndClass}
          />
        )}
      </LiveKitRoom>
    </div>
  );
}
