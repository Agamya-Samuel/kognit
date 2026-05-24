import type { ReactNode } from 'react';
import { AuthLayout } from '@edutech/shared-components';

export default function AuthLayoutPage({ children }: { children: ReactNode }) {
  return (
    <AuthLayout brandName="EduTech">
      {children}
    </AuthLayout>
  );
}
