import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RecordingInfo {
  liveClassId: number;
  status: 'none' | 'recording' | 'processing' | 'ready' | 'failed';
  s3Key: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  playbackUrl: string | null;
  error: string | null;
}

export interface PostSessionResult {
  liveClassId: number;
  lectureId: number;
  recordingStatus: 'none' | 'recording' | 'processing' | 'ready' | 'failed';
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  lectureUpdated: boolean;
}

// ─── Start Recording ─────────────────────────────────────────────────────────

export function useStartRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (liveClassId: number) => {
      const { data } = await api.post<{ message: string; s3Key: string }>('/live/recording/start', {
        liveClassId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live', 'recording'] });
    },
  });
}

// ─── Get Recording Info ──────────────────────────────────────────────────────

export function useRecordingInfo(liveClassId: number | null) {
  return useQuery({
    queryKey: ['live', 'recording', liveClassId],
    queryFn: async () => {
      const { data } = await api.get<RecordingInfo>(`/live/recording/${liveClassId}`);
      return data;
    },
    enabled: !!liveClassId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Poll while recording or processing
      if (status === 'recording' || status === 'processing') {
        return 5000; // 5 seconds
      }
      return false;
    },
  });
}

// ─── Retry Failed Recording ──────────────────────────────────────────────────

export function useRetryRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (liveClassId: number) => {
      const { data } = await api.post<PostSessionResult>('/live/recording/retry', {
        liveClassId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live', 'recording'] });
    },
  });
}
