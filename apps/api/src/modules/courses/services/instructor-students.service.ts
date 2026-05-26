import { Injectable } from '@nestjs/common';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import { ProgressRepository } from '../../../db/repositories/progress.repository';

export interface InstructorStudent {
  id: number;
  name: string;
  email: string;
  courseId: number;
  courseTitle: string;
  enrolledAt: string;
  progressPercentage: number;
}

export interface InstructorStudentsResponse {
  students: InstructorStudent[];
  total: number;
}

@Injectable()
export class InstructorStudentsService {
  constructor(
    private readonly coursesRepo: CoursesRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly progressRepo: ProgressRepository,
  ) {}

  async getStudents(
    instructorId: number,
    filters: { search?: string; courseId?: string },
  ): Promise<InstructorStudentsResponse> {
    // Get instructor's course IDs
    const coursesResult = await this.coursesRepo.findMany({ instructorId, limit: 100 });
    const courses = coursesResult.data;
    
    let courseIds: number[];
    if (filters.courseId) {
      courseIds = [parseInt(filters.courseId, 10)];
    } else {
      courseIds = courses.map(c => c.id);
    }

    // Get enrollments with student and course details
    const enrollments = await this.enrollmentsRepo.findByCoursesWithDetails(courseIds);

    // Filter by search term if provided
    const filteredEnrollments = filters.search 
      ? enrollments.filter(enrollment => 
          enrollment.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
          enrollment.studentEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
          enrollment.courseTitle.toLowerCase().includes(filters.search.toLowerCase())
        )
      : enrollments;

    // Enrich with progress data
    const studentsWithProgress = await Promise.all(
      filteredEnrollments.map(async (enrollment) => {
        const progress = await this.progressRepo.getCourseProgressSummary(
          enrollment.studentId, 
          enrollment.courseId
        );

        return {
          id: enrollment.studentId,
          name: enrollment.studentName,
          email: enrollment.studentEmail,
          courseId: enrollment.courseId,
          courseTitle: enrollment.courseTitle,
          enrolledAt: enrollment.enrolledAt instanceof Date 
            ? enrollment.enrolledAt.toISOString() 
            : String(enrollment.enrolledAt),
          progressPercentage: progress?.progressPercentage || 0,
        };
      }),
    );

    return {
      students: studentsWithProgress,
      total: studentsWithProgress.length,
    };
  }
}