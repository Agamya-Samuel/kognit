import { getApiClient } from '../index';
import type { Certificate, VerifyCertificateResponse, PaginationQuery } from '@edutech/types';

export const certificatesService = {
  async getMyCertificates(page = 1, limit = 10) {
    return getApiClient().get<{ certificates: Certificate[]; total: number; page: number; limit: number }>('/certificates', { page, limit } as PaginationQuery);
  },

  async verify(uid: string) {
    return getApiClient().get<VerifyCertificateResponse>(`/certificates/verify/${uid}`);
  },
};