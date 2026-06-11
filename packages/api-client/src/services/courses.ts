import { getApiClient } from '../index';
import type { Course, CourseWithSections, InstructorProfile } from '@edutech/types';

export const coursesService = {
  async list(filters?: Record<string, unknown>) {
    return getApiClient().get<Course[]>('/courses', filters);
  },

  async getById(id: number | string) {
    return getApiClient().get<CourseWithSections>(`/courses/${id}`);
  },

  async getDomains() {
    return getApiClient().get<string[]>('/courses/domains');
  },

  async getCurriculum(id: number | string) {
    return getApiClient().get<CourseWithSections>(`/courses/${id}/curriculum`);
  },

  async getValidation(id: number | string) {
    return getApiClient().get<{ isValid: boolean; errors: Array<{ field: string; message: string }> }>(`/courses/${id}/validation`);
  },

  async getInstructorProfile(instructorId: number) {
    return getApiClient().get<InstructorProfile>(`/instructors/${instructorId}`);
  },

  async create(dto: any) {
    return getApiClient().post<Course>('/courses', dto);
  },

  async update(id: number | string, dto: any) {
    return getApiClient().put<Course>(`/courses/${id}`, dto);
  },

  async delete(id: number | string) {
    return getApiClient().delete<void>(`/courses/${id}`);
  },

  async submitForReview(id: number | string) {
    return getApiClient().post<Course>(`/courses/${id}/submit`);
  },

  async approve(id: number | string) {
    return getApiClient().post<Course>(`/courses/${id}/approve`);
  },

  async requestRevision(id: number | string, notes: string) {
    return getApiClient().post<Course>(`/courses/${id}/request-revision`, { notes });
  },

  async archive(id: number | string) {
    return getApiClient().post<Course>(`/courses/${id}/archive`);
  },
};
