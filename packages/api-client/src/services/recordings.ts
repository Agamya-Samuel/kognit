import { getApiClient } from '../index';

export const recordingsService = {
  async getRecordings(filters?: Record<string, unknown>) {
    return getApiClient().get<any[]>('/instructor/recordings', filters);
  },

  async updateRecording(id: number, data: any) {
    return getApiClient().put<any>(`/instructor/recordings/${id}`, data);
  },
};