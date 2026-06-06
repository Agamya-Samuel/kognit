import { getApiClient } from '../index';

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

export interface PlaybackUrlResponse {
  playbackUrl: string;
  expiresAt: string;
  type: 'signed' | 'public';
}

export const mediaService = {
  getVideoStatus(lectureId: number): Promise<VideoStatusResponse> {
    return getApiClient().get<VideoStatusResponse>(`/media/video-status/${lectureId}`);
  },

  getPlaybackUrl(lectureId: number, expiryMinutes = 60): Promise<PlaybackUrlResponse> {
    return getApiClient().post<PlaybackUrlResponse>('/media/playback-url', { lectureId, expiryMinutes });
  },

  getPublicPlaybackUrl(lectureId: number): Promise<PlaybackUrlResponse> {
    return getApiClient().post<PlaybackUrlResponse>(`/media/public-playback-url/${lectureId}`);
  },
};
