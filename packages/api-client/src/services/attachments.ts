import { getApiClient } from '../index';

export interface LessonAttachment {
  id: number;
  lectureId: number;
  fileName: string;
  fileUrl: string;
  contentType: string | null;
  fileSize: number | null;
  orderIndex: number;
  createdAt: string;
}

export interface CreateAttachmentDto {
  fileName: string;
  fileUrl: string;
  contentType?: string;
  fileSize?: number;
}

export const attachmentsService = {
  async list(lectureId: number | string) {
    return getApiClient().get<LessonAttachment[]>(`/lectures/${lectureId}/attachments`);
  },

  async add(lectureId: number | string, dto: CreateAttachmentDto) {
    return getApiClient().post<LessonAttachment>(`/lectures/${lectureId}/attachments`, dto);
  },

  async remove(lectureId: number | string, attachmentId: number) {
    return getApiClient().delete<void>(`/lectures/${lectureId}/attachments/${attachmentId}`);
  },

  async reorder(lectureId: number | string, orderedIds: number[]) {
    return getApiClient().put<void>(`/lectures/${lectureId}/attachments/reorder`, { orderedIds });
  },
};
