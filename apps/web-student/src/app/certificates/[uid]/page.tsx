'use client';

import { useVerifyCertificate } from '@/hooks/useCertificates';
import { useParams } from 'next/navigation';

export default function CertificateDetailPage() {
  const params = useParams();
  const uid = params.uid as string;
  const { data, isLoading, error } = useVerifyCertificate(uid);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto animate-pulse">
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !data?.data?.valid || !data.data.certificate) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <h2 className="text-xl font-semibold text-gray-700">Certificate Not Found</h2>
          <p className="text-gray-500 mt-2">The certificate ID is invalid or does not exist.</p>
        </div>
      </div>
    );
  }

  const cert = data.data.certificate;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border-2 border-yellow-400 p-10 text-center relative">
          <div className="absolute top-4 right-4 text-4xl">&#127942;</div>
          <div className="text-sm uppercase tracking-widest text-yellow-600 font-semibold mb-6">
            Certificate of Completion
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{cert.courseTitle}</h1>
          <p className="text-gray-500 mb-6">This is to certify that</p>
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">{cert.studentName}</h2>
          <p className="text-gray-500 mb-4">has successfully completed the course</p>
          <p className="text-sm text-gray-400 mb-6">
            Instructed by <span className="font-medium text-gray-600">{cert.instructorName}</span>
          </p>
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-500">
              Issued on {new Date(cert.issuedAt).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
            <p className="text-xs text-gray-400 mt-1">Certificate ID: {cert.certificateUid}</p>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <a
            href={`/verify/${cert.certificateUid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Verify
          </a>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
