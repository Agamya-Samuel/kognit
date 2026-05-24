import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionsService } from '@edutech/api-client';
import type { SubmissionFilters, GradingResult, BulkGradeDto } from '@edutech/types';

export function useAssignmentSubmissions(
  assignmentId: number,
  filters?: Omit<SubmissionFilters, 'assignmentId'>
) {
  return useQuery({
    queryKey: ['submissions', 'assignment', assignmentId, filters],
    queryFn: async () => {
      return submissionsService.getByAssignment(assignmentId, filters);
    },
    enabled: !!assignmentId,
  });
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
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grade = async (submissionId: number, score: number, feedback?: string): Promise<{
    success: boolean;
    result: GradingResult | null;
    error: string | null;
  }> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await submissionsService.grade(submissionId, { score, feedback });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      return { success: true, result: result as unknown as GradingResult, error: null };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to grade submission';
      setError(msg);
      return { success: false, result: null, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const autoGrade = async (submissionId: number): Promise<{
    success: boolean;
    result: GradingResult | null;
    error: string | null;
  }> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await submissionsService.autoGrade(submissionId);
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      return { success: true, result: result as unknown as GradingResult, error: null };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to auto-grade submission';
      setError(msg);
      return { success: false, result: null, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const bulkGrade = async (dto: BulkGradeDto): Promise<{
    success: boolean;
    results: GradingResult[];
    errors: string[];
  }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await submissionsService.bulkGrade(dto);
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      return { success: true, results: response.graded || [], errors: response.errors || [] };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to bulk grade submissions';
      setError(msg);
      return { success: false, results: [], errors: [msg] };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    grade,
    autoGrade,
    bulkGrade,
    isLoading,
    error,
  };
}

export function useGradingReactQuery() {
  const queryClient = useQueryClient();

  const grade = useMutation({
    mutationFn: async ({ submissionId, score, feedback }: { submissionId: number; score: number; feedback?: string }) => {
      return submissionsService.grade(submissionId, { score, feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });

  const autoGrade = useMutation({
    mutationFn: async (submissionId: number) => {
      return submissionsService.autoGrade(submissionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });

  const bulkGrade = useMutation({
    mutationFn: async (dto: BulkGradeDto) => {
      return submissionsService.bulkGrade(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });

  return {
    grade,
    autoGrade,
    bulkGrade,
  };
}