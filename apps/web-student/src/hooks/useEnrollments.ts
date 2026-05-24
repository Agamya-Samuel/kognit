import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient } from '@edutech/api-client';
import type { CourseWithCurriculum, LectureProgress } from '@edutech/types';

interface EnrolledCourse extends CourseWithCurriculum {
  enrolledAt: string;
  accessType: 'purchased' | 'free';
  progress?: number;
}

export function useMyEnrollments() {
  return useQuery({
    queryKey: ['enrollments', 'me'],
    queryFn: async (): Promise<EnrolledCourse[]> => {
      const apiClient = getApiClient();
      const response = await apiClient.get<{ data: EnrolledCourse[] }>('/enrollments/me');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useEnrolledCourse(courseId: number | string) {
  return useQuery({
    queryKey: ['enrollments', 'me', courseId],
    queryFn: async (): Promise<EnrolledCourse | null> => {
      try {
        const apiClient = getApiClient();
        const response = await apiClient.get<{ data: EnrolledCourse }>(`/enrollments/me/course/${courseId}`);
        return response.data;
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
      const apiClient = getApiClient();
      const response = await apiClient.get(`/progress/course/${courseId}`);
      return response.data;
    },
    enabled: !!courseId,
  });
}