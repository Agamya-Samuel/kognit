import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { Toaster } from '@edutech/ui';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EduTech Instructor Dashboard',
  description: 'Instructor dashboard for managing courses and students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <Providers>{children}</Providers>
          <ToasterClient />
        </ToastProvider>
      </body>
    </html>
  );
}

function ToasterClient() {
  const { toasts, removeToast } = useToast();
  return <Toaster toasts={toasts} onDismiss={removeToast} />;
}
