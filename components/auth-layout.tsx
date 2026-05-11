'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showLinks?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showLinks = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="text-2xl font-bold text-primary">EduTech</div>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>

        {/* Content */}
        <div className="bg-card rounded-lg border border-border shadow-md p-6 mb-4">{children}</div>

        {/* Footer Links */}
        {showLinks && (
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help?{' '}
              <Link href="/help" className="text-primary hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
