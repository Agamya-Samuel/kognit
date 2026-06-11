import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sectionsService, lecturesService, type CreateSectionDto, type UpdateSectionDto, type CreateLectureDto, type UpdateLectureDto } from '@edutech/api-client';

// --- Sections ---

export function useSections(courseId: number | string) {
  return useQuery({
    queryKey: ['courses', courseId, 'sections'],
    queryFn: async () => {
      return sectionsService.list(courseId);
    },
    enabled: !!courseId,
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, dto }: { courseId: number | string; dto: CreateSectionDto }) => {
      return sectionsService.create(courseId, dto);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'sections'] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, sectionId, dto }: { courseId: number | string; sectionId: number; dto: UpdateSectionDto }) => {
      return sectionsService.update(courseId, sectionId, dto);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'sections'] });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, sectionId }: { courseId: number | string; sectionId: number }) => {
      return sectionsService.delete(courseId, sectionId);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'sections'] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

export function useReorderSections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, orderedIds }: { courseId: number | string; orderedIds: number[] }) => {
      return sectionsService.reorder(courseId, orderedIds);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'sections'] });
    },
  });
}

// --- Lectures ---

export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionId, dto }: { courseId: number | string; sectionId: number; dto: CreateLectureDto }) => {
      return lecturesService.create(sectionId, dto);
    },
    onSuccess: (_, { courseId, sectionId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'sections'] });
      queryClient.invalidateQueries({ queryKey: ['sections', sectionId, 'lectures'] });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionId, lectureId, dto }: { courseId: number | string; sectionId: number; lectureId: number; dto: UpdateLectureDto }) => {
      return lecturesService.update(sectionId, lectureId, dto);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'sections'] });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionId, lectureId }: { courseId: number | string; sectionId: number; lectureId: number }) => {
      return lecturesService.delete(sectionId, lectureId);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'sections'] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });
}

export function useReorderLessons() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sectionId, orderedIds }: { courseId: number | string; sectionId: number; orderedIds: number[] }) => {
      return lecturesService.reorder(sectionId, orderedIds);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'sections'] });
    },
  });
}
