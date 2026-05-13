'use client';

import { useCourseWithCurriculum } from '@/hooks/useCourseDetail';
import { generateCourseStructuredData } from '@/lib/metadata';
import { CurriculumAccordion } from '@/components/CurriculumAccordion';
import { CourseDetailSkeleton } from '@/components/CourseDetailSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { data: course, isLoading, error, refetch } = useCourseWithCurriculum(params.id);

  const formatPrice = (priceInr: number, pricingType: 'free' | 'paid') => {
    if (pricingType === 'free') return 'Free';
    return `₹${(priceInr / 100).toFixed(0)}`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState
          message="Failed to load course details. Please try again later."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Course not found"
          description="The course you're looking for doesn't exist or has been removed."
          icon={<span className="text-6xl">😕</span>}
        />
      </div>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateCourseStructuredData(course)),
        }}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {course.thumbnailUrl && (
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                  {course.pricingType === 'paid' && (
                    <div className="absolute bottom-4 right-4 rounded-md bg-black/70 px-3 py-1.5 text-sm font-medium text-white">
                      {formatPrice(course.priceInr, course.pricingType)}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <h1 className="mb-2 text-3xl font-bold">{course.title}</h1>
                <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="rounded-full bg-secondary px-3 py-1 capitalize">
                    {course.domain}
                  </span>
                  {course.enrollmentCount && (
                    <span>{course.enrollmentCount} students enrolled</span>
                  )}
                  {course.rating && (
                    <span className="flex items-center gap-1">
                      ⭐ {course.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="prose max-w-none">
                  {course.description && (
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {course.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm lg:sticky lg:top-8">
              <div className="mb-4">
                <div className="mb-2 text-3xl font-bold">
                  {formatPrice(course.priceInr, course.pricingType)}
                </div>
                {course.pricingType === 'paid' && (
                  <p className="text-sm text-muted-foreground">One-time payment</p>
                )}
              </div>

              <button className="mb-4 w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                {course.pricingType === 'free' ? 'Start Learning' : 'Enroll Now'}
              </button>

              <div className="space-y-3 border-t pt-4">
                {course.sections && course.sections.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sections</span>
                    <span className="font-medium">{course.sections.length}</span>
                  </div>
                )}
                {course.sections && course.sections.length > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lectures</span>
                    <span className="font-medium">
                      {course.sections.reduce((acc: number, section: any) => acc + section.lectures.length, 0)}
                    </span>
                  </div>
                )}
                {course.totalDurationSeconds && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{formatDuration(course.totalDurationSeconds)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {course.instructor && (
            <div className="mb-8 rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-xl font-bold">Instructor</h2>
              <div className="flex items-start gap-4">
                {course.instructor.avatarUrl && (
                  <img
                    src={course.instructor.avatarUrl}
                    alt={course.instructor.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="mb-1 text-lg font-semibold">{course.instructor.name}</h3>
                  {course.instructor.bio && (
                    <p className="text-sm text-muted-foreground">{course.instructor.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {course.sections && course.sections.length > 0 && (
            <div>
              <h2 className="mb-6 text-2xl font-bold">Course Curriculum</h2>
              <CurriculumAccordion sections={course.sections} />
            </div>
          )}

          {course.rating && (course.reviewCount ?? 0) > 0 && (
            <div className="mt-8">
              <h2 className="mb-6 text-2xl font-bold">Student Reviews</h2>
              <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center gap-4">
                  <div className="text-4xl font-bold">{course.rating.toFixed(1)}</div>
                  <div>
                    <div className="mb-1 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={i < Math.floor(course.rating!) ? 'text-foreground' : 'text-muted-foreground'}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {course.reviewCount} reviews
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
