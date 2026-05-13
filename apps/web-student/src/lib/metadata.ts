import type { Metadata } from 'next';
import type { Course } from '@/types/courses';

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export function generateCourseMetadata(course: Course): Metadata {
  const title = `${course.title} - EduTech`;
  const description = course.description || `Learn ${course.title} on EduTech`;
  const url = `${BASE_URL}/courses/${course.id}`;

  return {
    title,
    description,
    keywords: [
      course.title,
      course.domain,
      course.pricingType,
      'course',
      'learning',
      'education',
      'online course',
    ].join(', '),
    openGraph: {
      title,
      description,
      url,
      siteName: 'EduTech',
      type: 'website',
      images: course.thumbnailUrl
        ? [
            {
              url: course.thumbnailUrl,
              width: 1200,
              height: 630,
              alt: course.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: course.thumbnailUrl ? [course.thumbnailUrl] : [],
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateCourseStructuredData(course: Course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    image: course.thumbnailUrl,
    provider: {
      '@type': 'Organization',
      name: 'EduTech',
      url: BASE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: course.pricingType === 'paid' ? (course.priceInr / 100).toFixed(2) : '0',
      priceCurrency: 'INR',
      availability: course.isPublished ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      category: course.domain,
    },
    courseCode: course.id.toString(),
    educationalLevel: 'Beginner',
    inLanguage: 'en',
    url: `${BASE_URL}/courses/${course.id}`,
  };
}
