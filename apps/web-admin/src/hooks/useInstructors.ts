import { useQuery } from '@tanstack/react-query';
import { adminService } from '@edutech/api-client';

export function useInstructors(params: { page: number; limit: number; status: string }) {
  return useQuery({
    queryKey: ['admin', 'instructors', params],
    queryFn: async () => {
      const result = (await adminService.getInstructors(params)) as any;
      return {
        instructors: result?.instructors ?? [],
        total: result?.total ?? 0,
      };
    },
  });
}
