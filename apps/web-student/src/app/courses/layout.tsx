import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Courses - EduTech',
  description: 'Discover and enroll in online courses from expert instructors across various domains.',
  keywords: 'courses, online learning, education, tutorials, training',
  openGraph: {
    title: 'Explore Courses - EduTech',
    description: 'Discover and enroll in online courses from expert instructors across various domains.',
    type: 'website',
  },
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
