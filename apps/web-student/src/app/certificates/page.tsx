'use client';

import { useState } from 'react';
import { useMyCertificates } from '@/hooks/useCertificates';

export default function CertificatesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyCertificates(page);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-xl text-red-600">Failed to load certificates</h2>
          <p className="text-gray-500 mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }

  const certificates = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
        <p className="text-gray-500 mb-8">{total} certificate{total !== 1 ? 's' : ''} earned</p>

        {certificates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border">
            <h3 className="text-lg font-medium text-gray-700">No certificates yet</h3>
            <p className="text-gray-400 mt-2">Complete a course to earn your first certificate!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <a
                key={cert.id}
                href={`/certificates/${cert.certificateUid}`}
                className="block bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{cert.courseTitle}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Issued {new Date(cert.issuedAt).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">ID: {cert.certificateUid}</p>
                  </div>
                  <div className="text-2xl text-yellow-500 font-bold">&#127942;</div>
                </div>
              </a>
            ))}
          </div>
        )}

        {total > 10 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={certificates.length < 10}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
