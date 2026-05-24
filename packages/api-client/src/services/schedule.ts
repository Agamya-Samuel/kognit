import { getApiClient } from '../index';

export const scheduleService = {
  async getSchedule(filters?: Record<string, unknown>) {
    return getApiClient().get<any[]>('/instructor/schedule', filters);
  },
};