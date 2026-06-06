'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ResetPasswordForm } from '@edutech/shared-components';
import { authService } from '@edutech/api-client';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  return (
    <ResetPasswordForm
      token={token}
      onSubmit={async (email, token, password, confirmPassword) => {
        await authService.resetPassword(email, token, password, confirmPassword);
      }}
      onBackClick={() => router.push('/auth/login')}
    />
  );
}
