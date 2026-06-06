import { getApiClient } from '../index';
import type { CourseWithCurriculum } from '@edutech/types';

export interface Enrollment {
  id: number;
  courseId: number;
  courseTitle: string;
  instructorName: string;
  enrolledAt: string;
  accessType: 'purchased' | 'free';
  progress: number;
}

export interface EnrolledCourse extends CourseWithCurriculum {
  enrolledAt: string;
  accessType: 'purchased' | 'free';
  progress?: number;
}

export const enrollmentsService = {
  getMyEnrollments(): Promise<EnrolledCourse[]> {
    return getApiClient().get<EnrolledCourse[]>('/enrollments/me');
  },

  getEnrolledCourse(courseId: number | string): Promise<EnrolledCourse | null> {
    return getApiClient().get<EnrolledCourse>(`/enrollments/me/course/${courseId}`);
  },

  getCourseProgress(courseId: number | string): Promise<{ progress: number; completedLectures: number; totalLectures: number }> {
    return getApiClient().get(`/progress/course/${courseId}`);
  },
};