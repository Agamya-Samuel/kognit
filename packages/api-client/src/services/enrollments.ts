import { getApiClient } from '../index';

export interface Enrollment {
  id: number;
  courseId: number;
  courseTitle: string;
  instructorName: string;
  enrolledAt: string;
  accessType: 'purchased' | 'free';
  progress: number; // percentage
}

export const enrollmentsService = {
  /**
   * Get current user's enrollments
   * @returns List of enrollments
   */
  getMyEnrollments(): Promise<Enrollment[]> {
    return getApiClient().get<Enrollment[]>('/enrollments/me');
  },
};