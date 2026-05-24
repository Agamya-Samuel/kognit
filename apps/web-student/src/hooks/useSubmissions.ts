import { useQueryClient } from '@tanstack/react-query';
import { submissionsService } from '@edutech/api-client';
import type { Submission, SubmissionFilters } from '@edutech/types';

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
      error: string | null;
    }> {
      try {
        const submission = await submissionsService.submit(assignmentId, { content });
        queryClient.invalidateQueries({ queryKey: ['submissions'] });
        return { success: true, submission, error: null };
      } catch (err: any) {
        const msg = err.message || 'Failed to submit assignment';
        return { success: false, submission: null, error: msg };
      }
    },

    isLoading: false,
    error: null,
  };
}