'use client';

import { useVerifyCertificate } from '@/hooks/useCertificates';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@edutech/ui';
import { CheckCircle2, XCircle, Award } from 'lucide-react';

export default function VerifyCertificatePage() {
  const params = useParams();
  const uid = params.uid as string;
  const { data, isLoading } = useVerifyCertificate(uid);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <Card>
            <CardContent className="p-8 text-center">
              <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
              <Skeleton className="h-8 w-1/2 mx-auto mb-2" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isValid = data?.data?.valid;
  const cert = data?.data?.certificate;

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-muted/30">
      <div className="max-w-md w-full">
        {isValid && cert ? (
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="text-center">
              <div className="mx-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Valid Certificate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Student</span>
                  <span className="text-sm font-medium">{cert.studentName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Course</span>
                  <span className="text-sm font-medium">{cert.courseTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Instructor</span>
                  <span className="text-sm font-medium">{cert.instructorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Issued</span>
                  <span className="text-sm font-medium">
                    {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Certificate ID</span>
                  <span className="text-xs font-mono text-muted-foreground">{cert.certificateUid}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                <Award className="h-4 w-4" />
                <span>This certificate is authentic and verified</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-destructive/50 bg-gradient-to-br from-destructive/5 to-background">
            <CardHeader className="text-center">
              <div className="mx-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-destructive">Invalid Certificate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                This certificate ID could not be verified. Please check the ID and try again.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}