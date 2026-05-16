import api from './api';

export interface Certificate {
  id: number;
  studentId: number;
  courseId: number;
  certificateUid: string;
  issuedAt: string;
  pdfUrl: string | null;
  studentName: string;
  courseTitle: string;
  instructorName: string;
}

export interface CertificateListResponse {
  success: boolean;
  data: Certificate[];
  total: number;
  page: number;
  limit: number;
}

export interface VerifyCertificateResponse {
  success: boolean;
  data: {
    valid: boolean;
    certificate: Certificate | null;
  };
}

export async function fetchMyCertificates(page = 1, limit = 10): Promise<CertificateListResponse> {
  const { data } = await api.get<CertificateListResponse>('/certificates', {
    params: { page, limit },
  });
  return data;
}

export async function verifyCertificate(uid: string): Promise<VerifyCertificateResponse> {
  const { data } = await api.get<VerifyCertificateResponse>(`/certificates/verify/${uid}`);
  return data;
}
