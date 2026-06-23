import { useQuery } from '@tanstack/react-query';
import { adminService } from '@edutech/api-client';

export function useInstitutions(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ['admin', 'institutions', params],
    queryFn: async () => {
      const result = (await adminService.getInstitutions(params)) as any;
      return {
        institutions: result?.institutions ?? [],
        total: result?.total ?? 0,
      };
    },
  });
}
