import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EduTech - Learn from the Best',
  description: 'Discover courses from expert instructors and learn new skills today',
  keywords: 'education, courses, learning, online education',
  openGraph: {
    title: 'EduTech - Learn from the Best',
    description: 'Discover courses from expert instructors and learn new skills today',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
