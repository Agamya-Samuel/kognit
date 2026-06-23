import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { WebVitalsReporter } from '@edutech/shared-components';

export const metadata: Metadata = {
  title: 'EduTech Admin',
  description: 'EduTech Administration Panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WebVitalsReporter />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
