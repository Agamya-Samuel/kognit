import { useQuery } from '@tanstack/react-query';
import { coursesService } from '@edutech/api-client';
import type { CourseFilters, CoursesListResponse } from '@/types/courses';

export function useCourses(filters: CourseFilters = {}) {
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

      return coursesService.list(params) as unknown as CoursesListResponse;
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
