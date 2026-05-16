'use client';

import { useVerifyCertificate } from '@/hooks/useCertificates';
import { useParams } from 'next/navigation';

export default function VerifyCertificatePage() {
  const params = useParams();
  const uid = params.uid as string;
  const { data, isLoading } = useVerifyCertificate(uid);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Verifying certificate...</div>
      </div>
    );
  }

  const isValid = data?.data?.valid;
  const cert = data?.data?.certificate;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        {isValid && cert ? (
          <div className="bg-white rounded-lg border border-green-200 p-8 text-center">
            <div className="text-5xl mb-4 text-green-500">&#10003;</div>
            <h1 className="text-2xl font-bold text-green-700 mb-2">Valid Certificate</h1>
            <p className="text-gray-600 mb-6">This certificate is authentic.</p>

            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Student</span>
                <span className="text-sm font-medium">{cert.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Course</span>
                <span className="text-sm font-medium">{cert.courseTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Instructor</span>
                <span className="text-sm font-medium">{cert.instructorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Issued</span>
                <span className="text-sm font-medium">
                  {new Date(cert.issuedAt).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Certificate ID</span>
                <span className="text-xs font-mono text-gray-600">{cert.certificateUid}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
            <div className="text-5xl mb-4 text-red-500">&#10007;</div>
            <h1 className="text-2xl font-bold text-red-700 mb-2">Invalid Certificate</h1>
            <p className="text-gray-600">This certificate ID could not be verified.</p>
          </div>
        )}
      </div>
    </div>
  );
}
