'use client';

import { useState } from 'react';
import { useCourses, useDomains } from '@/hooks/useCourses';
import { SearchBar } from '@edutech/shared-components';
import { DomainFilter, PriceFilter, SortDropdown } from '@/components/filters';
import { CourseCard } from '@/components/CourseCard';
import { CourseListSkeleton } from '@/components/CourseListSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import type { CourseFilters } from '@/types/courses';

export default function CoursesPage() {
  const [filters, setFilters] = useState<CourseFilters>({
    page: 1,
    limit: 20,
    sort: 'newest',
    pricingType: 'all',
  });

  const { data: coursesData, isLoading, error, refetch } = useCourses(filters);
  const { data: domains } = useDomains();

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleDomainChange = (domain: string | null) => {
    setFilters(prev => ({ ...prev, domain: domain || undefined, page: 1 }));
  };

  const handlePricingChange = (pricingType: 'all' | 'free' | 'paid') => {
    setFilters((prev: CourseFilters) => ({
      ...prev,
      pricingType: pricingType === 'all' ? undefined : pricingType,
      page: 1,
    }));
  };

  const handleSortChange = (sort: CourseFilters['sort']) => {
    setFilters((prev: CourseFilters) => ({ ...prev, sort, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev: CourseFilters) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold">Explore Courses</h1>

        {isLoading && !coursesData ? (
          <CourseListSkeleton />
        ) : error ? (
          <ErrorState
            message="Failed to load courses. Please try again later."
            onRetry={() => refetch()}
          />
        ) : coursesData?.courses.length === 0 ? (
          <EmptyState
            title="No courses found"
            description="Try adjusting your search or filters to find what you're looking for."
            icon={<span className="text-6xl">📚</span>}
            action={{
              label: 'Clear Filters',
              onClick: () => setFilters({ page: 1, limit: 20, sort: 'newest', pricingType: 'all' }),
            }}
          />
        ) : (
          <>
            <div className="mb-8 space-y-6">
              <SearchBar
                value={filters.search || ''}
                onChange={handleSearch}
                placeholder="Search courses..."
                className="max-w-2xl"
              />

              <div className="space-y-4">
                {domains && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Domain
                    </label>
                    <DomainFilter
                      domains={domains}
                      selectedDomain={filters.domain || null}
                      onDomainChange={handleDomainChange}
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Price
                  </label>
                  <PriceFilter
                    selectedPricing={filters.pricingType || 'all'}
                    onPricingChange={handlePricingChange}
                  />
                </div>

                <SortDropdown
                  value={filters.sort || 'newest'}
                  onChange={handleSortChange}
                  className="max-w-xs"
                />
              </div>
            </div>

            <div className="mb-6 text-sm text-muted-foreground">
              Showing {coursesData?.courses.length} of {coursesData?.total} courses
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {coursesData?.courses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {coursesData && coursesData.total > coursesData.limit && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={!coursesData.hasPrev}
                  className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                >
                  Previous
                </button>
                <span className="flex items-center px-4 text-sm">
                  Page {coursesData.page}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={!coursesData.hasNext}
                  className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
