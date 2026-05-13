'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, RotateCcw, AlertCircle, Settings } from 'lucide-react';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

const QUALITY_OPTIONS = [
  { label: 'Auto', value: 'auto' },
  { label: '1080p', value: '1080' },
  { label: '720p', value: '720' },
  { label: '480p', value: '480' },
  { label: '360p', value: '360' },
];

interface VideoPlayerProps {
  playbackUrl: string;
  posterUrl?: string;
  duration: number;
  status: 'preparing' | 'ready' | 'errored';
  errorMessage?: string;
  resumePosition?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onProgress?: (progress: number) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  className?: string;
  autoplay?: boolean;
}

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isBuffering: boolean;
  hasError: boolean;
  playbackSpeed: PlaybackSpeed;
  quality: string;
}

export default function VideoPlayer({
  playbackUrl,
  posterUrl,
  duration,
  status,
  errorMessage,
  resumePosition = 0,
  onPlay,
  onPause,
  onEnded,
  onProgress,
  onTimeUpdate,
  className = '',
  autoplay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showResumeOverlay, setShowResumeOverlay] = useState(resumePosition > 0);
  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    isBuffering: false,
    hasError: false,
    playbackSpeed: 1 as PlaybackSpeed,
    quality: 'auto',
  });

  const [error, setError] = useState<string | null>(null);

  // Resume from saved position
  useEffect(() => {
    if (resumePosition > 0 && videoRef.current && status === 'ready') {
      videoRef.current.currentTime = resumePosition;
    }
  }, [resumePosition, status]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSpeedMenu(false);
      setShowQualityMenu(false);
    };
    if (showSpeedMenu || showQualityMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSpeedMenu, showQualityMenu]);

  // Handle playback speed change
  const changePlaybackSpeed = useCallback((speed: PlaybackSpeed) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setVideoState(prev => ({ ...prev, playbackSpeed: speed }));
    setShowSpeedMenu(false);
  }, []);

  // Handle quality change (for native video, this is informational)
  const changeQuality = useCallback((quality: string) => {
    setVideoState(prev => ({ ...prev, quality }));
    setShowQualityMenu(false);
  }, []);

  // Handle resume from saved position
  const handleResume = useCallback(() => {
    if (!videoRef.current || !resumePosition) return;
    videoRef.current.currentTime = resumePosition;
    setShowResumeOverlay(false);
    videoRef.current.play();
  }, [resumePosition]);

  // Handle play from beginning
  const handlePlayFromStart = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    setShowResumeOverlay(false);
    videoRef.current.play();
  }, []);

  // Handle play/pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (videoState.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [videoState.isPlaying]);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVideoState(prev => ({ ...prev, volume: newVolume }));
  }, []);

  // Handle toggle mute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setVideoState(prev => ({ ...prev, isMuted: newMuted }));
  }, []);

  // Handle seek
  const handleSeek = useCallback((progress: number) => {
    if (!videoRef.current || !duration) return;
    const newTime = (progress / 100) * duration;
    videoRef.current.currentTime = newTime;
    setVideoState(prev => ({ ...prev, currentTime: newTime }));
  }, [duration]);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (!videoRef.current) return;
    setError(null);
    setVideoState(prev => ({ ...prev, hasError: false }));
    videoRef.current.load();
  }, []);

  // Event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setVideoState(prev => ({ ...prev, isPlaying: true, isBuffering: false }));
      onPlay?.();
    };

    const handlePause = () => {
      setVideoState(prev => ({ ...prev, isPlaying: false }));
      onPause?.();
    };

    const handleEnded = () => {
      setVideoState(prev => ({ ...prev, isPlaying: false }));
      onEnded?.();
    };

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
      setVideoState(prev => ({ ...prev, currentTime }));
      onProgress?.(progress);
      onTimeUpdate?.(currentTime, duration);
    };

    const handleVolumeChange = () => {
      setVideoState(prev => ({ ...prev, volume: video.volume }));
    };

    const handleBufferStart = () => {
      setVideoState(prev => ({ ...prev, isBuffering: true }));
    };

    const handleBufferEnd = () => {
      setVideoState(prev => ({ ...prev, isBuffering: false }));
    };

    const handleError = (e: Event) => {
      const error = (e.target as HTMLVideoElement).error;
      let errorMessage = 'An error occurred while playing the video.';

      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Video playback was aborted.';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'A network error occurred. Please check your connection.';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'The video format is not supported.';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'The video source is not supported.';
            break;
        }
      }

      setError(errorMessage);
      setVideoState(prev => ({ ...prev, hasError: true, isPlaying: false }));
    };

    const handleFullscreenChange = () => {
      setVideoState(prev => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }));
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('waiting', handleBufferStart);
    video.addEventListener('canplay', handleBufferEnd);
    video.addEventListener('error', handleError);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('waiting', handleBufferStart);
      video.removeEventListener('canplay', handleBufferEnd);
      video.removeEventListener('error', handleError);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [duration, onPlay, onPause, onEnded, onProgress, onTimeUpdate]);

  // Format time as H:MM:SS or M:SS
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = duration > 0 ? (videoState.currentTime / duration) * 100 : 0;
  // Resume position as percentage
  const resumeProgress = duration > 0 && resumePosition > 0 ? (resumePosition / duration) * 100 : 0;

  // Render preparing state
  if (status === 'preparing') {
    return (
      <div className={`relative aspect-video bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Video is being processed</p>
            <p className="text-sm text-gray-400">This may take a few minutes. Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (status === 'errored' || error || videoState.hasError) {
    return (
      <div className={`relative aspect-video bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
          <div className="w-16 h-16 mb-4 text-red-500">
            <AlertCircle size={64} />
          </div>
          <div className="text-center max-w-md">
            <p className="text-lg font-semibold mb-2">
              {errorMessage || error || 'Video playback error'}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              {errorMessage || error || 'An error occurred while loading the video.'}
            </p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw size={20} />
              <span>Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative aspect-video bg-black rounded-lg overflow-hidden group ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={status === 'ready' ? playbackUrl : undefined}
        poster={posterUrl}
        className="w-full h-full object-contain"
        playsInline
        autoPlay={autoplay}
        controls={false}
        aria-label="Video player"
      />

      {/* Resume Overlay */}
      {showResumeOverlay && resumePosition > 0 && !videoState.isPlaying && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
          <div className="text-center p-6 rounded-xl bg-gray-900/90 border border-gray-700">
            <p className="text-white text-lg font-semibold mb-1">Continue watching?</p>
            <p className="text-gray-400 text-sm mb-4">Resume from {formatTime(resumePosition)}</p>
            <div className="flex gap-3">
              <button
                onClick={handlePlayFromStart}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
              >
                Start over
              </button>
              <button
                onClick={handleResume}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading/Buffering Overlay */}
      {videoState.isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity">
          <div className="w-12 h-12">
            <div className="w-full h-full border-4 border-white/30 rounded-full">
              <div className="w-full h-full border-4 border-transparent border-t-white rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity ${
          videoState.isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
        }`}
      >
        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={videoState.isPlaying ? 'Pause' : 'Play'}
          >
            {videoState.isPlaying ? (
              <Pause size={32} className="text-white" />
            ) : (
              <Play size={32} className="text-white ml-1" />
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <div
              className="relative h-1.5 bg-white/30 rounded-full cursor-pointer group/progress"
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const x = e.clientX - rect.left;
                const progress = (x / rect.width) * 100;
                handleSeek(Math.min(Math.max(progress, 0), 100));
              }}
              role="slider"
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              {/* Resume Position Marker */}
              {resumeProgress > 0 && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-yellow-400/80 z-10"
                  style={{ left: `${resumeProgress}%` }}
                ></div>
              )}

              {/* Progress Fill */}
              <div
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
              
              {/* Hover Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                style={{ left: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
              aria-label={videoState.isPlaying ? 'Pause' : 'Play'}
            >
              {videoState.isPlaying ? (
                <Pause size={24} />
              ) : (
                <Play size={24} className="ml-0.5" />
              )}
            </button>

            {/* Time Display */}
            <span className="text-white text-sm font-mono tabular-nums">
              {formatTime(videoState.currentTime)} / {formatTime(duration)}
            </span>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                aria-label={videoState.isMuted ? 'Unmute' : 'Mute'}
              >
                {videoState.isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <div className="w-24">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={videoState.isMuted ? 0 : videoState.volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                  aria-label="Volume"
                />
              </div>
            </div>

            {/* Playback Speed */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); setShowQualityMenu(false); }}
                className="text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-2 py-1 text-xs font-medium bg-white/10 hover:bg-white/20"
                aria-label="Playback speed"
              >
                {videoState.playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 border border-gray-700 rounded-lg py-1 min-w-[80px] z-50" onClick={(e) => e.stopPropagation()}>
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changePlaybackSpeed(speed)}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 transition-colors ${
                        videoState.playbackSpeed === speed ? 'text-blue-400 font-medium' : 'text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Selector */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); }}
                className="text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                aria-label="Quality settings"
              >
                <Settings size={22} />
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 border border-gray-700 rounded-lg py-1 min-w-[100px] z-50" onClick={(e) => e.stopPropagation()}>
                  <div className="px-3 py-1.5 text-xs text-gray-400 font-medium border-b border-gray-700">Quality</div>
                  {QUALITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => changeQuality(opt.value)}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 transition-colors ${
                        videoState.quality === opt.value ? 'text-blue-400 font-medium' : 'text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
              aria-label={videoState.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {videoState.isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { VideoPlayerProps };
