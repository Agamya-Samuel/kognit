import { useQuery } from '@tanstack/react-query';
import { certificatesService } from '@edutech/api-client';

export function useMyCertificates(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['certificates', page, limit],
    queryFn: () => certificatesService.getMyCertificates(page, limit),
  });
}

export function useVerifyCertificate(uid: string) {
  return useQuery({
    queryKey: ['certificate-verify', uid],
    queryFn: () => certificatesService.verify(uid),
    enabled: !!uid,
  });
}
