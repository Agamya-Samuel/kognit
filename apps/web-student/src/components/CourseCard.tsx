import Link from 'next/link';
import { CourseCard as SharedCourseCard } from '@edutech/shared-components';
import type { Course } from '@/types/courses';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <SharedCourseCard
        title={course.title}
        description={course.description ?? undefined}
        domain={course.domain}
        thumbnailUrl={course.thumbnailUrl ?? undefined}
        pricingType={course.pricingType}
        priceInr={course.priceInr}
        isPublished={course.isPublished}
      />
    </Link>
  );
}
