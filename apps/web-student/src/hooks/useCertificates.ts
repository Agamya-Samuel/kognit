import { useQuery } from '@tanstack/react-query';
import { certificatesService } from '@edutech/api-client';
import type { Certificate, VerifyCertificateResponse } from '@edutech/types';

export function useMyCertificates(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['certificates', page, limit],
    queryFn: () => certificatesService.getMyCertificates(page, limit) as Promise<{
      certificates: Certificate[];
      total: number;
      page: number;
      limit: number;
    }>,
  });
}

export function useVerifyCertificate(uid: string) {
  return useQuery({
    queryKey: ['certificate-verify', uid],
    queryFn: () => certificatesService.verify(uid) as Promise<VerifyCertificateResponse>,
    enabled: !!uid,
  });
}