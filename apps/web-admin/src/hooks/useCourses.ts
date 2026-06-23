import { useQuery } from '@tanstack/react-query';
import { adminService } from '@edutech/api-client';

interface CoursesParams {
  page: number;
  limit: number;
  isPublished?: boolean;
  search?: string;
  [key: string]: unknown;
}

export function useCourses(params: CoursesParams) {
  return useQuery({
    queryKey: ['admin', 'courses', params],
    queryFn: async () => {
      const result = (await adminService.getCourses(params)) as any;
      return {
        courses: result?.courses ?? [],
        total: result?.total ?? 0,
      };
    },
  });
}
