import { getApiClient } from '../index';
import type { LectureProgress, UpdateProgressResponse, WatchHistoryResponse } from '@edutech/types';

export interface WatchTimeSummary {
  totalWatchedSeconds: number;
  totalCourses: number;
  lastWatchedAt: string | null;
}

export const progressService = {
  async getLectureProgress(lectureId: number): Promise<LectureProgress | null> {
    try {
      return getApiClient().get<LectureProgress>(`/progress/lecture/${lectureId}`);
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  async updateProgress(lectureId: number, watchedSeconds: number): Promise<UpdateProgressResponse> {
    return getApiClient().post<UpdateProgressResponse>('/progress/update', {
      lectureId,
      watchedSeconds,
    });
  },

  async getWatchHistory(offset = 0, limit = 20): Promise<WatchHistoryResponse> {
    return getApiClient().get<WatchHistoryResponse>('/progress/history', {
      offset,
      limit,
    });
  },

  async getWatchSummary(): Promise<WatchTimeSummary> {
    return getApiClient().get<WatchTimeSummary>('/progress/summary');
  },
};