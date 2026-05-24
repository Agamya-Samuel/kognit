import { useQuery } from '@tanstack/react-query';
import { coursesService } from '@edutech/api-client';
import type { CourseWithCurriculum, InstructorProfile } from '@/types/courses';

export function useCourseWithCurriculum(id: number | string) {
  return useQuery({
    queryKey: ['course', id, 'curriculum'],
    queryFn: async () => {
      return coursesService.getCurriculum(id) as unknown as CourseWithCurriculum;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInstructorProfile(instructorId: number) {
  return useQuery({
    queryKey: ['instructor', instructorId],
    queryFn: async () => {
      return coursesService.getInstructorProfile(instructorId);
    },
    enabled: !!instructorId,
    staleTime: 10 * 60 * 1000,
  });
}