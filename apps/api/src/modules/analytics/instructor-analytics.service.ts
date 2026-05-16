import { Injectable, Logger } from '@nestjs/common';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';
import { CertificatesRepository } from '../../db/repositories/certificates.repository';
import { PaymentsRepository } from '../../db/repositories/payments.repository';
import { ProgressRepository } from '../../db/repositories/progress.repository';

export interface InstructorAnalyticsOverview {
  totalEnrollments: number;
  totalCertificates: number;
  totalRevenue: number;
  averageCompletionRate: number;
  courseAnalytics: CourseAnalytics[];
}

export interface CourseAnalytics {
  courseId: number;
  courseTitle: string;
  enrollmentCount: number;
  completionRate: number;
  revenue: number;
  certificateCount: number;
}

@Injectable()
export class InstructorAnalyticsService {
  private readonly logger = new Logger(InstructorAnalyticsService.name);

  constructor(
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly coursesRepository: CoursesRepository,
    private readonly certificatesRepository: CertificatesRepository,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly progressRepository: ProgressRepository,
  ) {}

  /**
   * Get analytics overview for an instructor
   */
  async getInstructorAnalytics(instructorId: number, courseId?: number): Promise<InstructorAnalyticsOverview> {
    // Get instructor's courses
    const instructorCourses = await this.getInstructorCourses(instructorId);

    // Filter by specific course if requested
    const courses = courseId
      ? instructorCourses.filter(c => c.id === courseId)
      : instructorCourses;

    if (courses.length === 0) {
      return {
        totalEnrollments: 0,
        totalCertificates: 0,
        totalRevenue: 0,
        averageCompletionRate: 0,
        courseAnalytics: [],
      };
    }

    // Build per-course analytics
    const courseAnalytics: CourseAnalytics[] = [];
    let totalEnrollments = 0;
    let totalCertificates = 0;
    let totalRevenue = 0;
    let completionSum = 0;

    for (const course of courses) {
      const enrollments = await this.enrollmentsRepository.findByCourse(course.id);
      const enrollmentCount = enrollments.total;
      const certResult = await this.certificatesRepository.findMany({ courseId: course.id });
      const certificateCount = certResult.total;
      const payments = await this.paymentsRepository.findMany({ courseId: course.id, status: 'paid' });
      const revenue = payments.data.reduce((sum, p) => sum + (p.amount ?? 0), 0);

      // Compute completion rate: students with 100% progress
      let completedCount = 0;
      for (const enrollment of enrollments.data) {
        const progress = await this.progressRepository.getCourseProgressSummary(
          enrollment.studentId,
          course.id,
        );
        if (progress && progress.progressPercentage >= 100) {
          completedCount++;
        }
      }
      const completionRate = enrollmentCount > 0 ? Math.round((completedCount / enrollmentCount) * 100) : 0;

      courseAnalytics.push({
        courseId: course.id,
        courseTitle: course.title,
        enrollmentCount,
        completionRate,
        revenue,
        certificateCount,
      });

      totalEnrollments += enrollmentCount;
      totalCertificates += certificateCount;
      totalRevenue += revenue;
      completionSum += completionRate;
    }

    return {
      totalEnrollments,
      totalCertificates,
      totalRevenue,
      averageCompletionRate: courses.length > 0 ? Math.round(completionSum / courses.length) : 0,
      courseAnalytics,
    };
  }

  private async getInstructorCourses(instructorId: number) {
    const result = await this.coursesRepository.findMany({ instructorId, limit: 100 });
    return result.data;
  }
}
