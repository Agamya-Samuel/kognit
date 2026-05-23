import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

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
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['courses', 'instructor'],
    queryFn: async () => {
      const response = await api.get(`/courses?instructorId=${user?.id}`);
      return response.data.data || response.data;
    },
    enabled: !!user?.id,
  });
}

export function useCourse(id: number | string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const response = await api.get(`/courses/${id}`);
      return response.data.data || response.data;
    },
    enabled: !!id,
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const response = await api.get('/analytics/instructor');
      return response.data.data || response.data;
    },
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => {
      const response = await api.get('/analytics/instructor');
      const data = response.data.data || response.data;
      return (data.recentActivity || []) as ActivityItem[];
    },
  });
}

export function useUpcomingClasses() {
  return useQuery({
    queryKey: ['dashboard', 'upcoming-classes'],
    queryFn: async () => {
      const response = await api.get('/live/upcoming');
      const data = response.data.data || response.data;
      return (data || []) as UpcomingClass[];
    },
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseData: Partial<Course>) => {
      const response = await api.post('/courses', courseData);
      return response.data.data || response.data;
    },
    onSuccess: (_data, _variables) => {
      // Invalidate and refetch courses list
      queryClient.invalidateQueries({ queryKey: ['courses', 'instructor'] });
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
      const response = await api.put(`/courses/${id}`, courseData);
      return response.data.data || response.data;
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
      const response = await api.post(`/courses/${courseId}/sections`, sectionData);
      return response.data.data || response.data;
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
      const response = await api.put(`/courses/${courseId}/sections/${sectionId}`, sectionData);
      return response.data.data || response.data;
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
      const response = await api.put(`/courses/${courseId}/sections/reorder`, { sections });
      return response.data.data || response.data;
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
      const response = await api.post(`/courses/${courseId}/sections/${sectionId}/lectures`, lectureData);
      return response.data.data || response.data;
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
      const response = await api.put(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`, lectureData);
      return response.data.data || response.data;
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
      const response = await api.put(`/courses/${courseId}/sections/${sectionId}/lectures/reorder`, { lectures });
      return response.data.data || response.data;
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
      const response = await api.patch(`/courses/${courseId}/publish`, { isPublished });
      return response.data.data || response.data;
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
