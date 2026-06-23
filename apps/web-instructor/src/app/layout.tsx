import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { WebVitalsReporter } from '@edutech/shared-components';

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <WebVitalsReporter />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
