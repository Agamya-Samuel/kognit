import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-jakarta',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'EduTech - Master Tech Skills with Expert Mentors',
  description:
    'Transform your career with live, interactive courses. Gain practical skills in Fullstack, Data Science, Android, and more — guided by industry professionals.',
  keywords: [
    'online learning',
    'live classes',
    'tech courses',
    'fullstack development',
    'data science',
    'Android development',
    'coding bootcamp',
    'interactive learning',
    'mentorship',
    'career growth',
  ],
  authors: [{ name: 'EduTech' }],
  metadataBase: new URL('https://eduplatform.com'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'EduTech',
    title: 'EduTech - Master Tech Skills with Expert Mentors',
    description:
      'Transform your career with live, interactive courses. Gain practical skills guided by industry professionals.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduTech - Master Tech Skills with Expert Mentors',
    description:
      'Transform your career with live, interactive courses. Gain practical skills guided by industry professionals.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} ${mono.variable} font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
