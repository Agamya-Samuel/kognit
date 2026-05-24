import { getApiClient } from '../index';
import type { UploadRequest, UploadResponse, UploadData, UploadCompleteResponse, UploadStatus } from '@edutech/types';

export const uploadsService = {
  async requestUrl(lectureId: number, requestData: UploadRequest) {
    return getApiClient().post<UploadResponse>(`/uploads/request-url/${lectureId}`, requestData);
  },

  async completeUpload(uploadId: string, uploadData: UploadData) {
    return getApiClient().post<UploadCompleteResponse>(`/uploads/${uploadId}/complete`, uploadData);
  },

  async getStatus(uploadId: string) {
    return getApiClient().get<UploadStatus>(`/uploads/${uploadId}/status`);
  },

  async deleteUpload(uploadId: string) {
    return getApiClient().delete<void>(`/uploads/${uploadId}`);
  },
};