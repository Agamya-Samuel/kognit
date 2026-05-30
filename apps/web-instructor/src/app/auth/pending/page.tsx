'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@edutech/ui';
import { Clock } from 'lucide-react';

export default function PendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4 dark:from-amber-950/20 dark:to-orange-950/20">
      <Card className="mx-auto max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle className="text-xl">Application Pending Approval</CardTitle>
          <CardDescription>
            Your instructor account application has been submitted successfully. An administrator will review your application and approve it shortly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>Once your account is approved, you will be able to:</p>
            <ul className="list-inside list-disc space-y-1 text-left">
              <li>Create and manage courses</li>
              <li>Upload lectures and content</li>
              <li>Track student progress</li>
              <li>Communicate with students</li>
            </ul>
            <p className="pt-2">
              If you have any questions, please contact the platform administrator.
            </p>
          </div>
          <div className="mt-6">
            <a
              href="/auth/login"
              className="text-sm text-primary hover:underline"
            >
              Return to login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
