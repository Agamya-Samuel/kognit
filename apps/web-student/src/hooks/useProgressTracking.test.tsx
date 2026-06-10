import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { progressService } from '@edutech/api-client';

vi.mock('@edutech/api-client', () => ({
  progressService: {
    getLectureProgress: vi.fn(),
    updateProgress: vi.fn(),
  },
}));

const mockGetLectureProgress = vi.mocked(progressService.getLectureProgress);
const mockUpdateProgress = vi.mocked(progressService.updateProgress);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useProgressTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state with null progress and isLoading=true', async () => {
    mockGetLectureProgress.mockResolvedValue(null);

    const { result } = renderHook(
      () => useProgressTracking({ lectureId: 1, updateInterval: 5000 }),
      { wrapper: createWrapper() },
    );

    expect(result.current.progress).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.updateError).toBeNull();
    expect(typeof result.current.reportProgress).toBe('function');
    expect(typeof result.current.refreshProgress).toBe('function');
  });

  it('fetches lecture progress on mount', async () => {
    mockGetLectureProgress.mockResolvedValue({
      lectureId: 1,
      watchedSeconds: 30,
      isCompleted: false,
      progressPercentage: 15,
    });

    const { result } = renderHook(
      () => useProgressTracking({ lectureId: 1, updateInterval: 5000 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetLectureProgress).toHaveBeenCalledWith(1);
    expect(result.current.progress).toEqual({
      lectureId: 1,
      watchedSeconds: 30,
      isCompleted: false,
      progressPercentage: 15,
    });
  });

  it('updates query cache on successful mutation', async () => {
    mockGetLectureProgress.mockResolvedValue({
      lectureId: 1,
      watchedSeconds: 30,
      isCompleted: false,
      progressPercentage: 15,
    });
    mockUpdateProgress.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                watchedSeconds: 60,
                isCompleted: true,
                progressPercentage: 100,
              }),
            50,
          );
        }),
    );

    const { result } = renderHook(
      () => useProgressTracking({ lectureId: 1, updateInterval: 100 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.reportProgress(60);
    });

    await waitFor(
      () => {
        expect(result.current.progress?.watchedSeconds).toBe(60);
      },
      { timeout: 3000 },
    );

    expect(result.current.progress?.isCompleted).toBe(true);
    expect(result.current.progress?.progressPercentage).toBe(100);
  });

  it('sets updateError on mutation failure', async () => {
    mockGetLectureProgress.mockResolvedValue(null);
    mockUpdateProgress.mockRejectedValue({
      response: { data: { message: 'Network error' } },
    });

    const { result } = renderHook(
      () => useProgressTracking({ lectureId: 1, updateInterval: 100 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.reportProgress(10);
    });

    await waitFor(
      () => {
        expect(result.current.updateError).toBe('Network error');
      },
      { timeout: 3000 },
    );
  });

  it('clears updateError on subsequent successful mutation', async () => {
    mockGetLectureProgress.mockResolvedValue(null);
    mockUpdateProgress
      .mockRejectedValueOnce({ response: { data: { message: 'First error' } } })
      .mockResolvedValueOnce({
        watchedSeconds: 20,
        isCompleted: false,
        progressPercentage: 10,
      });

    const { result } = renderHook(
      () => useProgressTracking({ lectureId: 1, updateInterval: 100 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.reportProgress(10);
    });

    await waitFor(
      () => {
        expect(result.current.updateError).toBe('First error');
      },
      { timeout: 3000 },
    );

    act(() => {
      result.current.reportProgress(20);
    });

    await waitFor(
      () => {
        expect(result.current.updateError).toBeNull();
      },
      { timeout: 3000 },
    );
  });

  it('flushes pending seconds on unmount', async () => {
    mockGetLectureProgress.mockResolvedValue(null);
    mockUpdateProgress.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                watchedSeconds: 15,
                isCompleted: false,
                progressPercentage: 7,
              }),
            50,
          );
        }),
    );

    const { result, unmount } = renderHook(
      () => useProgressTracking({ lectureId: 1, updateInterval: 60000 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.reportProgress(15);
    });

    unmount();

    await waitFor(
      () => {
        expect(mockUpdateProgress).toHaveBeenCalledWith(1, 15);
      },
      { timeout: 3000 },
    );
  });

  it('does not start interval when enabled=false', async () => {
    mockGetLectureProgress.mockResolvedValue(null);
    mockUpdateProgress.mockResolvedValue({
      watchedSeconds: 10,
      isCompleted: false,
      progressPercentage: 5,
    });

    const { result } = renderHook(
      () =>
        useProgressTracking({
          lectureId: 1,
          updateInterval: 100,
          enabled: false,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.reportProgress(10);
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(mockUpdateProgress).not.toHaveBeenCalled();
  });
});
