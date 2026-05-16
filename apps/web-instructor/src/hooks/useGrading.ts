import { useState, useEffect } from 'react';
import { submissionsApi } from '@/lib/assignments-api';
import type { Submission, SubmissionFilters, GradingResult, BulkGradeDto } from '@/types/assignments';

interface UseAssignmentSubmissionsReturn {
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

export function useAssignmentSubmissions(
  assignmentId: number,
  filters?: Omit<SubmissionFilters, 'assignmentId'>
): UseAssignmentSubmissionsReturn {
  const [data, setData] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<UseAssignmentSubmissionsReturn['meta']>();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await submissionsApi.getByAssignment(assignmentId, filters);
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
    if (assignmentId) {
      fetchData();
    }
  }, [assignmentId, filters?.page, filters?.limit]);

  return { data, isLoading, error, meta, refetch: fetchData };
}

interface UseGradingReturn {
  grade: (submissionId: number, score: number, feedback?: string) => Promise<{
    success: boolean;
    result: GradingResult | null;
    error: string | null;
  }>;
  autoGrade: (submissionId: number) => Promise<{
    success: boolean;
    result: GradingResult | null;
    error: string | null;
  }>;
  bulkGrade: (dto: BulkGradeDto) => Promise<{
    success: boolean;
    results: GradingResult[];
    errors: string[];
  }>;
  isLoading: boolean;
  error: string | null;
}

export function useGrading(): UseGradingReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grade = async (submissionId: number, score: number, feedback?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await submissionsApi.grade(submissionId, { score, feedback });
      if (response.success) {
        return { success: true, result: response.data, error: null };
      } else {
        const errorMsg = response.error || 'Failed to grade submission';
        setError(errorMsg);
        return { success: false, result: null, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, result: null, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const autoGrade = async (submissionId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await submissionsApi.autoGrade(submissionId);
      if (response.success) {
        return { success: true, result: response.data, error: null };
      } else {
        const errorMsg = response.error || 'Failed to auto-grade submission';
        setError(errorMsg);
        return { success: false, result: null, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, result: null, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const bulkGrade = async (dto: BulkGradeDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await submissionsApi.bulkGrade(dto);
      if (response.success) {
        return { success: true, results: response.data.graded, errors: response.data.errors };
      } else {
        const errorMsg = response.error || 'Failed to bulk grade submissions';
        setError(errorMsg);
        return { success: false, results: [], errors: [errorMsg] };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      return { success: false, results: [], errors: [errorMsg] };
    } finally {
      setIsLoading(false);
    }
  };

  return { grade, autoGrade, bulkGrade, isLoading, error };
}