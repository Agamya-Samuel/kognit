import type { ReactNode } from 'react';

export interface AuthLayoutProps {
  children: ReactNode;
  brandName?: string;
  logo?: ReactNode;
  backgroundGradient?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * AuthLayout provides a consistent layout wrapper for authentication pages.
 * Features:
 * - Responsive design with mobile-first approach
 * - Customizable brand name and logo
 * - Configurable background gradient
 * - Configurable max width for content container
 */
export function AuthLayout({
  children,
  brandName,
  logo,
  backgroundGradient = 'from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700',
  maxWidth = 'sm',
}: AuthLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${backgroundGradient} p-4 sm:p-6 lg:p-8`}>
      <div className={`w-full ${maxWidthClasses[maxWidth]} flex flex-col gap-6`}>
        {brandName || logo ? (
          <div className="flex items-center justify-center">
            <a
              href="/"
              className="flex items-center gap-3 font-semibold text-lg text-foreground hover:text-primary transition-colors"
            >
              {logo && <span className="flex-shrink-0">{logo}</span>}
              {brandName && <span>{brandName}</span>}
            </a>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
