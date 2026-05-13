import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { CourseFilters, CoursesListResponse, Course } from '@/types/courses';

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

      const { data } = await api.get<CoursesListResponse>('/courses', { params });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDomains() {
  return useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const { data } = await api.get('/courses/domains');
      return data.data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCourse(id: number | string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Course; error: null }>(`/courses/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
