'use client';

import { useState } from 'react';
import { useMyCertificates } from '@/hooks/useCertificates';
import { Card, CardContent, CardHeader, CardTitle, Button, Skeleton } from '@edutech/ui';
import { EmptyState } from '@/components/EmptyState';
import { Award, ExternalLink } from 'lucide-react';

export default function CertificatesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyCertificates(page);

  const certificates = data?.certificates ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Certificates</h1>
        <p className="text-muted-foreground mt-1">
          {isLoading
            ? 'Loading certificates...'
            : `${total} certificate${total !== 1 ? 's' : ''} earned`}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          title="Failed to load certificates"
          description="Please try again later."
        />
      ) : certificates.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Complete a course to earn your first certificate!"
          action={{
            label: 'Browse Courses',
            onClick: () => (window.location.href = '/courses'),
          }}
        />
      ) : (
        <>
          <div className="space-y-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{cert.courseTitle}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Issued {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">ID: {cert.certificateUid}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <a href={`/certificates/${cert.certificateUid}`} className="block">
                    <Button variant="outline" className="w-full gap-2">
                      View Certificate <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          {total > 10 && (
            <div className="flex justify-center items-center gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-4 text-sm text-muted-foreground">Page {page}</span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={certificates.length < 10}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
