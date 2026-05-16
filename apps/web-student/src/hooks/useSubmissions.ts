import { useState, useEffect } from 'react';
import { submissionsApi } from '@/lib/assignments-api';
import type { Submission, SubmissionFilters, LateSubmissionStatus } from '@/types/assignments';

interface UseSubmissionsReturn {
  data: Submission[];
  isLoading: boolean;
  error: string | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  refetch: () => void;
}

export function useMySubmissions(filters?: SubmissionFilters): UseSubmissionsReturn {
  const [data, setData] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<UseSubmissionsReturn['meta']>();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await submissionsApi.getMySubmissions(filters);
      if (response.success) {
        setData(response.data);
        setMeta(response.meta);
      } else {
        setError(response.error || 'Failed to fetch submissions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters?.assignmentId, filters?.page, filters?.limit]);

  return { data, isLoading, error, meta, refetch: fetchData };
}

interface UseSubmissionReturn {
  data: Submission | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMySubmission(assignmentId: number): UseSubmissionReturn {
  const [data, setData] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await submissionsApi.getMySubmission(assignmentId);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch submission');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchData();
    }
  }, [assignmentId]);

  return { data, isLoading, error, refetch: fetchData };
}

interface UseSubmitAssignmentReturn {
  submit: (assignmentId: number, content: string) => Promise<{
    success: boolean;
    submission: Submission | null;
    lateStatus: LateSubmissionStatus | null;
    error: string | null;
  }>;
  isLoading: boolean;
  error: string | null;
}

export function useSubmitAssignment(): UseSubmitAssignmentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (assignmentId: number, content: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await submissionsApi.submit(assignmentId, { content });
      if (response.success) {
        return {
          success: true,
          submission: response.data.submission,
          lateStatus: response.data.lateStatus,
          error: null,
        };
      } else {
        const errorMsg = response.error || 'Failed to submit assignment';
        setError(errorMsg);
        return { success: false, submission: null, lateStatus: null, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, submission: null, lateStatus: null, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return { submit, isLoading, error };
}