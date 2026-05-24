'use client';

import { useRouter } from 'next/navigation';
import { ForgotPasswordForm } from '@edutech/shared-components';
import { authService } from '@edutech/api-client';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <ForgotPasswordForm
      onSubmit={async (email) => {
        await authService.forgotPassword(email);
      }}
      onBackClick={() => router.push('/auth/login')}
    />
  );
}
