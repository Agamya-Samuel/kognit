'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { ResetPasswordForm } from '@edutech/shared-components';
import { authService } from '@edutech/api-client';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  return (
    <ResetPasswordForm
      token={token}
      onSubmit={async (token, password, confirmPassword) => {
        await authService.resetPassword(token, password, confirmPassword);
      }}
      onBackClick={() => router.push('/auth/login')}
    />
  );
}
