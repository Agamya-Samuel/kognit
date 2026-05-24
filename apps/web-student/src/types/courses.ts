import type {
  Course,
  CourseWithSections,
  CourseWithCurriculum,
  Section,
  SectionWithLectures,
  Lecture,
  PricingType,
  InstructorProfile,
} from '@edutech/types';

export type {
  Course,
  CourseWithSections,
  CourseWithCurriculum,
  Section,
  SectionWithLectures,
  Lecture,
  PricingType,
  InstructorProfile,
};

export type CourseSortOption = 'newest' | 'popular' | 'price_asc' | 'price_desc' | 'rating';

export interface CourseFilters {
  page?: number;
  limit?: number;
  search?: string;
  domain?: string;
  pricingType?: 'free' | 'paid' | 'all';
  sort?: CourseSortOption;
}

export interface CoursesListResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}