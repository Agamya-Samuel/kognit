import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/ThemeProvider';
import { WebVitalsReporter } from '@/components/WebVitalsReporter';
import './globals.css';

const inter = localFont({
  src: '../../public/fonts/inter-400.woff2',
  weight: '400',
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = localFont({
  src: '../../public/fonts/plus-jakarta-sans-600-700-800.woff2',
  weight: '600 700 800',
  variable: '--font-jakarta',
  display: 'swap',
});

const mono = localFont({
  src: '../../public/fonts/jetbrains-mono-400.woff2',
  weight: '400',
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EduTech - Learn Tech Skills with Live Expert Mentorship',
  description:
    'Transform your career through live, interactive courses in Fullstack Development, Data Science, Mobile, and more. Join 25,000+ learners guided by industry professionals.',
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'EduTech',
    title: 'EduTech - Learn Tech Skills with Live Expert Mentorship',
    description:
      'Transform your career through live, interactive courses guided by industry professionals.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduTech - Learn Tech Skills with Live Expert Mentorship',
    description:
      'Transform your career through live, interactive courses guided by industry professionals.',
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
      <body
        className={`${inter.variable} ${jakarta.variable} ${mono.variable} font-sans antialiased`}
      >
        <WebVitalsReporter />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
