import { useQuery } from '@tanstack/react-query';
import { adminService } from '@edutech/api-client';

export function useInstitution(id: number) {
  return useQuery({
    queryKey: ['admin', 'institutions', id],
    queryFn: async () => {
      return (await adminService.getInstitution(id)) as any;
    },
    enabled: Boolean(id),
  });
}
