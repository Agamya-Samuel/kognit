'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { mediaService } from '@edutech/api-client';

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

export interface VideoStatusResponse {
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

  const fetchVideoStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await mediaService.getVideoStatus(lectureId);
      setVideoStatus(data as VideoStatusResponse);
      setState(prev => ({ ...prev, status: data.status, isLoading: false }));
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch video status';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return null;
    }
  }, [lectureId]);

  const fetchPlaybackUrl = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const isFreePreview = videoStatus?.status === 'ready' && videoStatus?.isFreePreview;
      const data = isFreePreview
        ? await mediaService.getPublicPlaybackUrl(lectureId)
        : await mediaService.getPlaybackUrl(lectureId, expiryMinutes);

      setState(prev => ({
        ...prev,
        playbackUrl: data.playbackUrl,
        expiresAt: data.expiresAt,
        type: data.type,
        isLoading: false,
        error: null,
      }));

      if (data.expiresAt && urlRefreshTimeout.current) {
        const expiresAt = new Date(data.expiresAt);
        const refreshTime = expiresAt.getTime() - Date.now() - 60000;
        const delay = Math.max(refreshTime, 0);

        urlRefreshTimeout.current = setTimeout(() => {
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
  }, [lectureId, videoStatus, expiryMinutes]);

  const startStatusPolling = useCallback(() => {
    if (statusCheckInterval.current) {
      clearInterval(statusCheckInterval.current);
    }

    statusCheckInterval.current = setInterval(async () => {
      const status = await fetchVideoStatus();
      if (status?.status === 'ready') {
        if (statusCheckInterval.current) {
          clearInterval(statusCheckInterval.current);
        }
        await fetchPlaybackUrl();
      }
    }, 15000);
  }, [fetchVideoStatus, fetchPlaybackUrl]);

  // On mount: kick off the initial fetch + status-polling bootstrap.
  useEffect(() => {
    if (autoFetch && lectureId) {
      fetchVideoStatus().then((status) => {
        if (status?.status === 'ready') {
          fetchPlaybackUrl();
        } else if (status?.status === 'preparing') {
          startStatusPolling();
        }
      });
    }
    // Intentional: only run on mount. Refs hold the latest state.
  }, []);

  // On unmount: clear any pending interval/timeout so we don't leak them
  // or fire callbacks against an unmounted component.
  useEffect(() => {
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
      if (urlRefreshTimeout.current) {
        clearTimeout(urlRefreshTimeout.current);
      }
    };
  }, []);

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

export type { PlaybackUrlState };
