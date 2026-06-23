import { useQuery } from '@tanstack/react-query';
import { adminService } from '@edutech/api-client';

interface AssignmentsParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  [key: string]: unknown;
}

export function useAssignments(params: AssignmentsParams) {
  return useQuery({
    queryKey: ['admin', 'assignments', params],
    queryFn: async () => {
      const result = await adminService.getAssignments(params);
      return {
        assignments: result.assignments ?? [],
        total: result.total ?? 0,
      };
    },
  });
}
