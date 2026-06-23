import { useQuery } from '@tanstack/react-query';
import { coursesService } from '@edutech/api-client';
import type { CoursesListResponse, Course } from '@/types/courses';

export function useCourses(filters: any = {}) {
  const { domain, search, pricingType, minPrice, maxPrice, page = 1, limit = 20, sort } = filters;

  return useQuery({
    queryKey: ['courses', { domain, search, pricingType, minPrice, maxPrice, page, limit, sort }],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = {
        page,
        limit,
        isPublished: true,
      };

      if (domain) params.domain = domain;
      if (search) params.search = search;
      if (pricingType && pricingType !== 'all') params.pricingType = pricingType;

      const response = await coursesService.list(params);

      // The API returns a paginated response: { courses, total, page, limit, hasNext, hasPrev }
      if (response && typeof response === 'object' && !Array.isArray(response) && 'courses' in response) {
        return {
          courses: (response as any).courses as Course[],
          total: (response as any).total ?? 0,
          page: (response as any).page ?? page,
          limit: (response as any).limit ?? limit,
          hasNext: (response as any).hasNext ?? false,
          hasPrev: (response as any).hasPrev ?? false,
        } as CoursesListResponse;
      }

      // Fallback for legacy array responses
      if (Array.isArray(response)) {
        return {
          courses: response as Course[],
          total: (response as Course[]).length,
          page,
          limit,
          hasNext: false,
          hasPrev: false,
        } as CoursesListResponse;
      }

      return {
        courses: [],
        total: 0,
        page: 1,
        limit: 20,
        hasNext: false,
        hasPrev: false,
      } as CoursesListResponse;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      return coursesService.getDomains();
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useCourse(id: number | string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      return coursesService.getById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
