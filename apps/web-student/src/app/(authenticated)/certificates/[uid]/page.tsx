'use client';

import { useVerifyCertificate } from '@/hooks/useCertificates';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Skeleton } from '@edutech/ui';
import { Award, CheckCircle2, Copy, Download, Share2 } from 'lucide-react';
import { EmptyState } from '@edutech/shared-components';

export default function CertificateDetailPage() {
  const params = useParams();
  const uid = params.uid as string;
  const { data, isLoading, error } = useVerifyCertificate(uid);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-10">
              <Skeleton className="h-8 w-1/2 mb-6" />
              <Skeleton className="h-12 w-3/4 mb-4" />
              <Skeleton className="h-8 w-1/2 mb-6" />
              <Skeleton className="h-10 w-2/3 mb-6" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data?.data?.valid || !data.data.certificate) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <EmptyState
            title="Certificate Not Found"
            description="The certificate ID is invalid or does not exist."
          />
        </div>
      </div>
    );
  }

  const cert = data.data.certificate;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="text-center pb-2">
            <div className="relative">
              <Badge className="mb-6 bg-amber-600 text-white uppercase tracking-widest">
                Certificate of Completion
              </Badge>
              <div className="absolute top-0 right-0 h-12 w-12 flex items-center justify-center">
                <Award className="h-8 w-8 text-amber-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 text-center pb-10">
            <div>
              <CardTitle className="text-3xl mb-2">{cert.courseTitle}</CardTitle>
              <p className="text-muted-foreground">This is to certify that</p>
              <h2 className="text-2xl font-semibold text-primary mt-2">{cert.studentName}</h2>
              <p className="text-muted-foreground mt-4">has successfully completed the course</p>
              <p className="text-sm text-muted-foreground mt-2">
                Instructed by <span className="font-medium text-foreground">{cert.instructorName}</span>
              </p>
            </div>

            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground">
                Issued on {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Certificate ID: {cert.certificateUid}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <Button variant="outline" asChild>
            <a href={`/verify/${cert.certificateUid}`} target="_blank" rel="noopener noreferrer" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Verify
            </a>
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Download className="h-4 w-4" />
            Print / Save PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share on LinkedIn
          </Button>
          <Button variant="ghost" size="icon" onClick={() => {
            // Public-facing base URL so the share link works outside localhost. Falls back to localhost for dev.
            const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            navigator.clipboard.writeText(`${baseUrl}/verify/${cert.certificateUid}`);
          }} className="gap-2">
            <Copy className="h-4 w-4" />
            Copy Link
          </Button>
        </div>
      </div>
    </div>
  );
}