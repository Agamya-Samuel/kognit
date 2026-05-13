import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { CourseWithCurriculum } from '@/types/courses';

export function useCourseWithCurriculum(id: number | string) {
  return useQuery({
    queryKey: ['course', id, 'curriculum'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: CourseWithCurriculum; error: null }>(
        `/courses/${id}/curriculum`
      );
      return data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInstructorProfile(instructorId: number) {
  return useQuery({
    queryKey: ['instructor', instructorId],
    queryFn: async () => {
      const { data } = await api.get(`/instructors/${instructorId}`);
      return data.data;
    },
    enabled: !!instructorId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
