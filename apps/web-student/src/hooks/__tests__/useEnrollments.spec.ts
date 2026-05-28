import { describe, expect, test, vi } from 'vitest';
import { useMyEnrollments } from './useEnrollments';
import { renderHook, waitFor } from '@testing-library/react';

// Mock the api-client enrollment service
vi.mock('@edutech/api-client', () => ({
  enrollmentService: {
    getMyEnrollments: vi.fn(),
  },
}));

describe('useMyEnrollments', () => {
  const mockEnrollmentsService = {
    getMyEnrollments: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(require('@edutech/api-client').enrollmentService).mockImplementation(
      () => mockEnrollmentsService
    );
  });

  test('should return enrollments data when successful', async () => {
    const mockData = [
      { id: 1, courseId: 101, courseTitle: 'React Basics', progress: 50 },
      { id: 2, courseId: 102, courseTitle: 'Vue.js Fundamentals', progress: 100 },
    ];
    mockEnrollmentsService.getMyEnrollments.mockResolvedValue(mockData);

    const { result } = renderHook(() => useMyEnrollments());

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for data to resolve
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockData);
    });
  });

  test('should handle API error', async () => {
    const mockError = new Error('Failed to fetch enrollments');
    mockEnrollmentsService.getMyEnrollments.mockRejectedValue(mockError);

    const { result } = renderHook(() => useMyEnrollments());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for error to be caught
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(mockError);
    });
  });

  test('should handle empty enrollments', async () => {
    mockEnrollmentsService.getMyEnrollments.mockResolvedValue([]);

    const { result } = renderHook(() => useMyEnrollments());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data to resolve
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual([]);
    });
  });
});