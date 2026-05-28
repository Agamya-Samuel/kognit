import { beforeEach, describe, expect, test, vi } from 'vitest';
import { progressService } from '../services/progress';

// Mock the getApiClient function
vi.mock('../index', () => ({
  getApiClient: vi.fn(),
}));

describe('progressService', () => {
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(require('../index').getApiClient).mockReturnValue({
      get: mockGet,
    });
  });

  describe('getWatchSummary', () => {
    test('should call progress summary endpoint', async () => {
      const mockResponse = {
        totalWatchedSeconds: 3600,
        totalCourses: 2,
        lastWatchedAt: '2026-05-27T10:30:00Z',
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await progressService.getWatchSummary();

      expect(mockGet).toHaveBeenCalledWith('/progress/summary');
      expect(result).toEqual(mockResponse);
    });

    test('should handle error from API', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));

      await expect(progressService.getWatchSummary()).rejects.toThrow(
        'Network error'
      );
    });
  });
});