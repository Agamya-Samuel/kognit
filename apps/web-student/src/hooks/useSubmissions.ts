import { useQuery, useQueryClient } from '@tanstack/react-query';
import { submissionsService } from '@edutech/api-client';
import type { Submission, LateSubmissionStatus, SubmissionFilters } from '@edutech/types';

export function useMySubmissions(filters?: SubmissionFilters) {
  return useQuery({
    queryKey: ['submissions', 'my', filters],
    queryFn: async () => {
      return submissionsService.getMySubmissions(filters);
    },
  });
}

export function useMySubmission(assignmentId: number) {
  return useQuery({
    queryKey: ['submissions', 'my', assignmentId],
    queryFn: async () => {
      return submissionsService.getMySubmission(assignmentId);
    },
    enabled: !!assignmentId,
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  return {
    async submit(assignmentId: number, content: string): Promise<{
      success: boolean;
      submission: Submission | null;
      lateStatus: LateSubmissionStatus | null;
      error: string | null;
    }> {
      try {
        const result = await submissionsService.submit(assignmentId, { content });
        queryClient.invalidateQueries({ queryKey: ['submissions'] });
        return { success: true, submission: result.submission, lateStatus: result.lateStatus, error: null };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to submit assignment';
        return { success: false, submission: null, lateStatus: null, error: msg };
      }
    },

    isLoading: false,
    error: null,
  };
}