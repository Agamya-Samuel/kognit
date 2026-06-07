'use client';

import { useState } from 'react';
import { useCourses, useDomains } from '@/hooks/useCourses';
import { SearchBar } from '@edutech/shared-components';
import { DomainFilter, PriceFilter, SortDropdown } from '@/components/filters';
import { CourseCard } from '@/components/CourseCard';
import { CourseListSkeleton } from '@/components/CourseListSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { Button } from '@edutech/ui';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Course Catalog</h1>
        <p className="text-muted-foreground mt-1">Explore and enroll in courses across all domains</p>
      </div>

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
          action={{
            label: 'Clear Filters',
            onClick: () => setFilters({ page: 1, limit: 20, sort: 'newest', pricingType: 'all' }),
          }}
        />
      ) : (
        <>
          {/* Search & Filters */}
          <div className="space-y-4">
            <SearchBar
              value={filters.search || ''}
              onChange={handleSearch}
              placeholder="Search courses..."
              className="max-w-2xl"
            />

            <div className="flex flex-wrap items-center gap-4">
              {domains && (
                <DomainFilter
                  domains={domains}
                  selectedDomain={filters.domain || null}
                  onDomainChange={handleDomainChange}
                />
              )}
              <PriceFilter
                selectedPricing={filters.pricingType || 'all'}
                onPricingChange={handlePricingChange}
              />
              <SortDropdown
                value={filters.sort || 'newest'}
                onChange={handleSortChange}
                className="max-w-xs"
              />
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing {coursesData?.courses.length} of {coursesData?.total} courses
          </p>

          {/* Course Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {coursesData?.courses.map((course: any) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* Pagination */}
          {coursesData && coursesData.total > coursesData.limit && (
            <div className="flex justify-center items-center gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(filters.page! - 1)}
                disabled={!coursesData.hasPrev}
              >
                Previous
              </Button>
              <span className="px-4 text-sm text-muted-foreground">
                Page {coursesData.page}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={!coursesData.hasNext}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
