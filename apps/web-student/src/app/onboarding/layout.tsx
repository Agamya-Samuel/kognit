import type { ReactNode } from 'react';
import { AuthLayout } from '@edutech/shared-components';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <AuthLayout brandName="EduTech" maxWidth="md">
      {children}
    </AuthLayout>
  );
}
