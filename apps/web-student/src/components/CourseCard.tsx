import Link from 'next/link';
import type { Course } from '@/types/courses';
import { CourseCard as SharedCourseCard } from '@edutech/shared-components';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/(authenticated)/courses/${course.id}`}>
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