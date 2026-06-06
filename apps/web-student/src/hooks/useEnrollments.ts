import { useQuery } from '@tanstack/react-query';
import { enrollmentsService } from '@edutech/api-client';
import type { CourseWithCurriculum } from '@edutech/types';

interface EnrolledCourse extends CourseWithCurriculum {
  enrolledAt: string;
  accessType: 'purchased' | 'free';
  progress?: number;
}

export function useMyEnrollments() {
  return useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: async (): Promise<EnrolledCourse[]> => {
      return enrollmentsService.getMyEnrollments() as Promise<EnrolledCourse[]>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useEnrolledCourse(courseId: number | string) {
  return useQuery({
    queryKey: ['enrollments', 'me', courseId],
    queryFn: async (): Promise<EnrolledCourse | null> => {
      try {
        return await enrollmentsService.getEnrolledCourse(courseId) as EnrolledCourse;
      } catch {
        return null;
      }
    },
    enabled: !!courseId,
  });
}

export function useCourseProgress(courseId: number | string) {
  return useQuery({
    queryKey: ['progress', 'course', courseId],
    queryFn: async (): Promise<{ progress: number; completedLectures: number; totalLectures: number }> => {
      return enrollmentsService.getCourseProgress(courseId);
    },
    enabled: !!courseId,
  });
}
