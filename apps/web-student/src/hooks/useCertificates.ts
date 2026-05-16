import { useQuery } from '@tanstack/react-query';
import { fetchMyCertificates, verifyCertificate } from '@/lib/certificates-api';

export function useMyCertificates(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['certificates', page, limit],
    queryFn: () => fetchMyCertificates(page, limit),
  });
}

export function useVerifyCertificate(uid: string) {
  return useQuery({
    queryKey: ['certificate-verify', uid],
    queryFn: () => verifyCertificate(uid),
    enabled: !!uid,
  });
}
