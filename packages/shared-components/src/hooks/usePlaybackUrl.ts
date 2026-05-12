'use client';

import { useState, useCallback, useRef } from 'react';

interface UsePlaybackUrlOptions {
  lectureId: number;
  isAuthenticated?: boolean;
  autoFetch?: boolean;
  expiryMinutes?: number;
}

interface PlaybackUrlState {
  playbackUrl: string | null;
  expiresAt: string | null;
  type: 'signed' | 'public' | null;
  isLoading: boolean;
  error: string | null;
  status: 'preparing' | 'ready' | 'errored' | 'none' | null;
}

interface VideoStatusResponse {
  lectureId: number;
  muxAssetId?: string;
  muxPlaybackId?: string;
  status: 'preparing' | 'ready' | 'errored' | 'none';
  duration: number;
  errorMessage?: string;
  thumbnailUrl?: string;
  isFreePreview?: boolean;
}

export function usePlaybackUrl({
  lectureId,
  isAuthenticated = true,
  autoFetch = true,
  expiryMinutes = 60,
}: UsePlaybackUrlOptions) {
  const [state, setState] = useState<PlaybackUrlState>({
    playbackUrl: null,
    expiresAt: null,
    type: null,
    isLoading: false,
    error: null,
    status: null,
  });

  const [videoStatus, setVideoStatus] = useState<VideoStatusResponse | null>(null);
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const urlRefreshTimeout = useRef<NodeJS.Timeout | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Fetch video status
  const fetchVideoStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(
        `${API_BASE_URL}/api/v1/media/video-status/${lectureId}`,
        {
          headers: isAuthenticated
            ? {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              }
            : {},
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: VideoStatusResponse = await response.json();
      setVideoStatus(data);
      setState(prev => ({ ...prev, status: data.status, isLoading: false }));

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch video status';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return null;
    }
  }, [lectureId, isAuthenticated, API_BASE_URL]);

  // Fetch playback URL
  const fetchPlaybackUrl = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const endpoint = videoStatus?.status === 'ready' && videoStatus?.isFreePreview
        ? 'public-playback-url'
        : 'playback-url';

      const response = await fetch(
        `${API_BASE_URL}/api/v1/media/${endpoint}/${lectureId}`,
        {
          method: 'POST',
          headers: isAuthenticated
            ? {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
              }
            : {
                'Content-Type': 'application/json',
              },
          body: endpoint === 'playback-url'
            ? JSON.stringify({ lectureId, expiryMinutes })
            : undefined,
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You are not enrolled in this course');
        } else if (response.status === 404) {
          throw new Error('Video not found or not ready');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        playbackUrl: data.playbackUrl,
        expiresAt: data.expiresAt,
        type: data.type,
        isLoading: false,
        error: null,
      }));

      // Schedule URL refresh before expiration
      if (data.expiresAt && urlRefreshTimeout.current) {
        const expiresAt = new Date(data.expiresAt);
        const refreshTime = expiresAt.getTime() - Date.now() - 60000; // Refresh 1 minute before expiration
        const delay = Math.max(refreshTime, 0);

        urlRefreshTimeout.current = setTimeout(() => {
          console.log('Refreshing playback URL before expiration');
          fetchPlaybackUrl();
        }, delay);
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch playback URL';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return null;
    }
  }, [lectureId, isAuthenticated, videoStatus, expiryMinutes, API_BASE_URL]);

  // Start status polling for preparing videos
  const startStatusPolling = useCallback(() => {
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }

    statusCheckInterval.current = setInterval(async () => {
      const status = await fetchVideoStatus();
      if (status?.status === 'ready') {
        // Video is ready, stop polling and fetch URL
        if (statusCheckInterval.current) {
          clearInterval(statusCheckInterval.current);
        }
        await fetchPlaybackUrl();
      }
    }, 15000); // Poll every 15 seconds
  }, [fetchVideoStatus, fetchPlaybackUrl]);

  // Initial fetch
  useState(() => {
    if (autoFetch && lectureId) {
      fetchVideoStatus().then((status) => {
        if (status?.status === 'ready') {
          fetchPlaybackUrl();
        } else if (status?.status === 'preparing') {
          startStatusPolling();
        }
      });
    }
  });

  // Cleanup on unmount
  useState(() => {
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
      if (urlRefreshTimeout.current) {
        clearTimeout(urlRefreshTimeout.current);
      }
    };
  });

  // Manual refresh
  const refresh = useCallback(() => {
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }
    if (urlRefreshTimeout.current) {
      clearTimeout(urlRefreshTimeout.current);
    }

    fetchVideoStatus().then((status) => {
      if (status?.status === 'ready') {
        fetchPlaybackUrl();
      } else if (status?.status === 'preparing') {
        startStatusPolling();
      }
    });
  }, [fetchVideoStatus, fetchPlaybackUrl, startStatusPolling]);

  return {
    ...state,
    videoStatus,
    refresh,
  };
}

export type { PlaybackUrlState, VideoStatusResponse };
