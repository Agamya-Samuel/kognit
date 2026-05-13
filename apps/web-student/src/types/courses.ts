export interface Course {
  id: number;
  instructorId: number;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  domain: string;
  pricingType: 'free' | 'paid';
  priceInr: number;
  isPublished: boolean;
  enrollmentCount?: number;
  rating?: number;
  reviewCount?: number;
  instructor?: Instructor;
  createdAt: string;
  updatedAt: string;
}

export interface Instructor {
  id: number;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface Section {
  id: number;
  courseId: number;
  title: string;
  orderIndex: number;
  lectures: Lecture[];
  createdAt: string;
}

export interface Lecture {
  id: number;
  sectionId: number;
  title: string;
  description?: string | null;
  orderIndex: number;
  type: 'video' | 'live' | 'text' | 'assignment' | 'quiz';
  muxAssetId?: string | null;
  muxPlaybackId?: string | null;
  durationSeconds: number;
  isFreePreview: boolean;
  isPublished: boolean;
  createdAt: string;
}

export interface CourseWithCurriculum extends Course {
  sections: Section[];
  totalDurationSeconds?: number;
}

export interface CoursesListResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CourseFilters {
  domain?: string;
  search?: string;
  pricingType?: 'all' | 'free' | 'paid';
  minPrice?: number;
  maxPrice?: number;
  instructorId?: number;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'popular' | 'rating' | 'price-low' | 'price-high';
}
