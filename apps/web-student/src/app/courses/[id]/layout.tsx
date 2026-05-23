import { Metadata } from 'next';
import { generateCourseMetadata } from '@/lib/metadata';

interface CourseDetailLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export async function generateMetadata({ params }: CourseDetailLayoutProps): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.id}`, {
      cache: 'no-store',
    });
    const data = await response.json();

    if (!data.success || !data.data) {
      return {
        title: 'Course Not Found - EduTech',
      };
    }

    return generateCourseMetadata(data.data);
  } catch {
    return {
      title: 'Course - EduTech',
    };
  }
}

export default function CourseDetailLayout({ children }: CourseDetailLayoutProps) {
  return <>{children}</>;
}
