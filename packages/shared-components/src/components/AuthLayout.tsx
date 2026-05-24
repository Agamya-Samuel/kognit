import type { ReactNode } from 'react';

export interface AuthLayoutProps {
  children: ReactNode;
  brandName?: string;
  logo?: ReactNode;
}

export function AuthLayout({ children, brandName, logo }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {brandName || logo ? (
          <a href="/" className="flex items-center gap-2 self-center font-medium">
            {logo}
            {brandName && <span>{brandName}</span>}
          </a>
        ) : null}
        {children}
      </div>
    </div>
  );
}
