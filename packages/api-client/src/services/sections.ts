import { getApiClient } from '../index';
import type { Section, Lecture, SectionWithLectures } from '@edutech/types';

export interface CreateSectionDto {
  title: string;
  description?: string;
}

export interface UpdateSectionDto {
  title?: string;
  description?: string;
}

export interface CreateLectureDto {
  title: string;
  description?: string;
  type?: string;
  videoUrl?: string;
  externalVideoUrl?: string;
  isFreePreview?: boolean;
  isPublished?: boolean;
}

export interface UpdateLectureDto {
  title?: string;
  description?: string;
  type?: string;
  videoUrl?: string;
  externalVideoUrl?: string;
  isFreePreview?: boolean;
  isPublished?: boolean;
}

export const sectionsService = {
  async list(courseId: number | string) {
    return getApiClient().get<SectionWithLectures[]>(`/courses/${courseId}/sections`);
  },

  async getById(courseId: number | string, sectionId: number) {
    return getApiClient().get<SectionWithLectures>(`/courses/${courseId}/sections/${sectionId}`);
  },

  async create(courseId: number | string, dto: CreateSectionDto) {
    return getApiClient().post<Section>(`/courses/${courseId}/sections`, dto);
  },

  async update(courseId: number | string, sectionId: number, dto: UpdateSectionDto) {
    return getApiClient().put<Section>(`/courses/${courseId}/sections/${sectionId}`, dto);
  },

  async delete(courseId: number | string, sectionId: number) {
    return getApiClient().delete<void>(`/courses/${courseId}/sections/${sectionId}`);
  },

  async reorder(courseId: number | string, orderedIds: number[]) {
    return getApiClient().put<void>(`/courses/${courseId}/sections/reorder`, { orderedIds });
  },
};

export const lecturesService = {
  async list(sectionId: number) {
    return getApiClient().get<Lecture[]>(`/sections/${sectionId}/lectures`);
  },

  async getById(sectionId: number, lectureId: number) {
    return getApiClient().get<Lecture>(`/sections/${sectionId}/lectures/${lectureId}`);
  },

  async create(sectionId: number, dto: CreateLectureDto) {
    return getApiClient().post<Lecture>(`/sections/${sectionId}/lectures`, dto);
  },

  async update(sectionId: number, lectureId: number, dto: UpdateLectureDto) {
    return getApiClient().put<Lecture>(`/sections/${sectionId}/lectures/${lectureId}`, dto);
  },

  async delete(sectionId: number, lectureId: number) {
    return getApiClient().delete<void>(`/sections/${sectionId}/lectures/${lectureId}`);
  },

  async reorder(sectionId: number, orderedIds: number[]) {
    return getApiClient().put<void>(`/sections/${sectionId}/lectures/reorder`, { orderedIds });
  },
};
