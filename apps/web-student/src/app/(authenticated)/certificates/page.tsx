'use client';

import { useState } from 'react';
import { useMyCertificates } from '@/hooks/useCertificates';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Skeleton } from '@edutech/ui';
import { Award, ExternalLink, Download, Share2, Copy, CheckCircle2 } from 'lucide-react';

export default function CertificatesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyCertificates(page);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {Array.from({ length: 3 }).map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-xl text-destructive font-semibold">Failed to load certificates</h2>
          <p className="text-muted-foreground mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }

  const certificates = data?.certificates ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Certificates</h1>
          <p className="text-muted-foreground">{total} certificate{total !== 1 ? 's' : ''} earned</p>
        </div>

        {certificates.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-4">
              <div className="mx-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">No certificates yet</h3>
              <p className="text-sm text-muted-foreground">Complete a course to earn your first certificate!</p>
              <Button asChild>
                <a href="/courses">Browse Courses</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
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
        )}

        {total > 10 && (
          <div className="flex justify-center items-center mt-8 gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={certificates.length < 10}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}