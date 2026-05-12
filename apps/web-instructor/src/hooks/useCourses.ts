import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Types
export interface Course {
  id: number;
  instructorId: number;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  domain: string;
  pricingType: 'free' | 'paid';
  priceInr: number;
  isPublished: boolean;
  enrollmentCount?: number;
  revenue?: number;
  createdAt: string;
  updatedAt: string;
  sections?: Section[];
}

export interface Section {
  id: number;
  courseId: number;
  title: string;
  order: number;
  lectures?: Lecture[];
}

export interface Lecture {
  id: number;
  sectionId: number;
  title: string;
  type: 'video' | 'document' | 'text' | 'quiz';
  videoUrl?: string;
  documentUrl?: string;
  content?: string;
  order: number;
  isFreePreview: boolean;
  duration?: number;
}

export interface DashboardMetrics {
  totalStudents: number;
  activeCourses: number;
  totalRevenue: number;
  upcomingClasses: number;
}

export interface ActivityItem {
  id: number;
  type: 'enrollment' | 'completion' | 'review' | 'question';
  message: string;
  time: string;
}

export interface UpcomingClass {
  id: number;
  title: string;
  time: string;
  enrolledCount: number;
}

// ─── Queries ───────────────────────────────────────────────────────────────────

export function useInstructorCourses() {
  return useQuery({
    queryKey: ['courses', 'instructor'],
    queryFn: async () => {
      const { data } = await api.get('/courses?instructorId=2'); // TODO: Get actual instructor ID
      return data.data;
    },
  });
}

export function useCourse(id: number | string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const { data } = await api.get(`/courses/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      // TODO: Replace with actual API endpoint
      return {
        totalStudents: 1234,
        activeCourses: 8,
        totalRevenue: 245000,
        upcomingClasses: 3,
      };
    },
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => {
      // TODO: Replace with actual API endpoint
      return [
        { id: 1, type: 'enrollment', message: 'John Doe enrolled in TypeScript Basics', time: '2 min ago' },
        { id: 2, type: 'completion', message: 'Jane Smith completed React Patterns', time: '15 min ago' },
        { id: 3, type: 'review', message: 'New review: "Excellent course!" on Node.js Fundamentals', time: '1 hour ago' },
      ] as ActivityItem[];
    },
  });
}

export function useUpcomingClasses() {
  return useQuery({
    queryKey: ['dashboard', 'upcoming-classes'],
    queryFn: async () => {
      // TODO: Replace with actual API endpoint
      return [
        { id: 1, title: 'TypeScript Live Session', time: 'Today, 3:00 PM', enrolledCount: 45 },
        { id: 2, title: 'React Patterns Q&A', time: 'Tomorrow, 10:00 AM', enrolledCount: 32 },
      ] as UpcomingClass[];
    },
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData: Partial<Course>) => {
      const { data } = await api.post('/courses', courseData);
      return data.data;
    },
    onSuccess: (_data, _variables) => {
      // Invalidate and refetch courses list
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor'] });
      // Optionally navigate to the new course
      // router.push(`/dashboard/courses/${data.id}`);
    },
    onError: (error) => {
      console.error('Failed to create course:', error);
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...courseData }: Partial<Course> & { id: number }) => {
      const { data } = await api.put(`/courses/${id}`, courseData);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate specific course query
      queryClient.invalidateQueries({ queryKey: ['course', variables.id] });
      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor'] });
    },
    onError: (error) => {
      console.error('Failed to update course:', error);
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/courses/${id}`);
      return id;
    },
    onSuccess: () => {
      // Invalidate courses list
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor'] });
    },
    onError: (error) => {
      console.error('Failed to delete course:', error);
    },
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, ...sectionData }: Partial<Section> & { courseId: number }) => {
      const { data } = await api.post(`/courses/${courseId}/sections`, sectionData);
      return data.data;
    },
    onSuccess: () => {
      // Invalidate course query to refresh sections
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
    onError: (error) => {
      console.error('Failed to create section:', error);
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, sectionId, ...sectionData }: Partial<Section> & { courseId: number; sectionId: number }) => {
      const { data } = await api.put(`/courses/${courseId}/sections/${sectionId}`, sectionData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
    onError: (error) => {
      console.error('Failed to update section:', error);
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, sectionId }: { courseId: number; sectionId: number }) => {
      await api.delete(`/courses/${courseId}/sections/${sectionId}`);
      return { courseId, sectionId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
    onError: (error) => {
      console.error('Failed to delete section:', error);
    },
  });
}

export function useReorderSections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, sections }: { courseId: number; sections: Array<{ id: number; order: number }> }) => {
      const { data } = await api.put(`/courses/${courseId}/sections/reorder`, { sections });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
    onError: (error) => {
      console.error('Failed to reorder sections:', error);
    },
  });
}

export function useCreateLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, sectionId, ...lectureData }: Partial<Lecture> & { courseId: number; sectionId: number }) => {
      const { data } = await api.post(`/courses/${courseId}/sections/${sectionId}/lectures`, lectureData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
    onError: (error) => {
      console.error('Failed to create lecture:', error);
    },
  });
}

export function useUpdateLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, sectionId, lectureId, ...lectureData }: Partial<Lecture> & { courseId: number; sectionId: number; lectureId: number }) => {
      const { data } = await api.put(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`, lectureData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
    onError: (error) => {
      console.error('Failed to update lecture:', error);
    },
  });
}

export function useDeleteLecture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, sectionId, lectureId }: { courseId: number; sectionId: number; lectureId: number }) => {
      await api.delete(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`);
      return { courseId, sectionId, lectureId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
    onError: (error) => {
      console.error('Failed to delete lecture:', error);
    },
  });
}

export function useReorderLectures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, sectionId, lectures }: { courseId: number; sectionId: number; lectures: Array<{ id: number; order: number }> }) => {
      const { data } = await api.put(`/courses/${courseId}/sections/${sectionId}/lectures/reorder`, { lectures });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
    onError: (error) => {
      console.error('Failed to reorder lectures:', error);
    },
  });
}

export function useUpdateCoursePublishStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, isPublished }: { courseId: number; isPublished: boolean }) => {
      const { data } = await api.patch(`/courses/${courseId}/publish`, { isPublished });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
    onError: (error) => {
      console.error('Failed to update publish status:', error);
    },
  });
}
