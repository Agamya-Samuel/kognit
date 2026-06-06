import { Metadata } from 'next';
import { coursesService } from '@edutech/api-client';
import { generateCourseMetadata } from '@/lib/metadata';

interface CourseDetailLayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export async function generateMetadata({ params }: CourseDetailLayoutProps): Promise<Metadata> {
  try {
    const course = await coursesService.getById(params.id);

    if (!course) {
      return {
        title: 'Course Not Found - EduTech',
      };
    }

    return generateCourseMetadata(course);
  } catch {
    return {
      title: 'Course - EduTech',
    };
  }
}

export default function CourseDetailLayout({ children }: CourseDetailLayoutProps) {
  return <>{children}</>;
}
