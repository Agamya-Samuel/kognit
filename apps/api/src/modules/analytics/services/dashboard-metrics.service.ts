import { Injectable, NotFoundException } from '@nestjs/common';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import { PaymentsRepository } from '../../../db/repositories/payments.repository';
import { LiveClassesRepository } from '../../../db/repositories/live-classes.repository';
import { UsersRepository } from '../../../db/repositories/users.repository';
import { ProgressRepository } from '../../../db/repositories/progress.repository';

export interface DashboardMetrics {
  totalStudents: number;      // Total enrolled students across instructor's courses
  activeCourses: number;      // Number of published courses
  totalRevenue: number;       // Total revenue from paid enrollments
  upcomingClasses: number;    // Count of scheduled live classes
}

export interface RecentActivityItem {
  id: number;
  type: 'enrollment' | 'completion' | 'review' | 'assignment_submission' | 'live_class';
  title: string;
  time: string;
}

export interface DashboardMetricsWithActivity extends DashboardMetrics {
  recentActivity: RecentActivityItem[];
}

@Injectable()
export class DashboardMetricsService {
  constructor(
    private readonly coursesRepo: CoursesRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly paymentsRepo: PaymentsRepository,
    private readonly liveClassesRepo: LiveClassesRepository,
    private readonly usersRepo: UsersRepository,
    private readonly progressRepo: ProgressRepository,
  ) {}

  async getDashboardMetrics(instructorId: number): Promise<DashboardMetricsWithActivity> {
    // Get instructor's courses
    const coursesResult = await this.coursesRepo.findMany({ instructorId, limit: 100 });
    const courses = coursesResult.data;
    const courseIds = courses.map(c => c.id);

    // Calculate metrics in parallel
    const [
      totalEnrollments,
      totalRevenue,
      upcomingClasses,
      recentActivity
    ] = await Promise.all([
      this.getTotalEnrollments(courseIds),
      this.getTotalRevenue(courseIds),
      this.getUpcomingClasses(instructorId),
      this.getRecentActivity(instructorId),
    ]);

    return {
      totalStudents: totalEnrollments,
      activeCourses: courses.filter(c => c.isPublished).length,
      totalRevenue,
      upcomingClasses,
      recentActivity,
    };
  }

  async getTotalEnrollments(courseIds: number[]): Promise<number> {
    if (courseIds.length === 0) return 0;
    return this.enrollmentsRepo.countByCourseIds(courseIds);
  }

  private async getTotalRevenue(courseIds: number[]): Promise<number> {
    if (courseIds.length === 0) return 0;
    
    const result = await this.paymentsRepo.sumPaidAmountByCourseIds(courseIds);
    return result ?? 0;
  }

  private async getUpcomingClasses(instructorId: number): Promise<number> {
    const result = await this.liveClassesRepo.countUpcomingForInstructor(instructorId);
    return result;
  }

  private async getRecentActivity(instructorId: number): Promise<RecentActivityItem[]> {
    // Get recent enrollments (last 10)
    const recentEnrollments = await this.getRecentEnrollments(instructorId);
    // Get recent completions (last 10)
    const recentCompletions = await this.getRecentCompletions(instructorId);
    // Get recent assignments submissions (last 10)
    const recentAssignments = await this.getRecentAssignmentSubmissions(instructorId);
    // Get recent live classes (last 10)
    const recentLiveClasses = await this.getRecentLiveClasses(instructorId);
    // Get recent reviews (last 10) - if we have a reviews repository

    // Combine and sort by date
    const allActivities = [
      ...recentEnrollments,
      ...recentCompletions,
      ...recentAssignments,
      ...recentLiveClasses,
    ];

    // Sort by time descending (most recent first) and take top 10
    return allActivities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);
  }

  private async getRecentEnrollments(instructorId: number): Promise<RecentActivityItem[]> {
    const enrollments = await this.enrollmentsRepo.findRecentForInstructor(instructorId, 10);
    return enrollments.map(enrollment => ({
      id: enrollment.id,
      type: 'enrollment' as const,
      title: `${enrollment.studentName} enrolled in ${enrollment.courseTitle}`,
       time: this.formatTimeAgo(enrollment.enrolledAt.toISOString()),
    }));
  }

  private async getRecentCompletions(instructorId: number): Promise<RecentActivityItem[]> {
    // TODO: Implement based on progress completion tracking
    // Would need to query progressRepository for completed lectures
    return [];
  }

  private async getRecentAssignmentSubmissions(instructorId: number): Promise<RecentActivityItem[]> {
    // TODO: Implement using assignmentsRepository for submissions
    return [];
  }

  private async getRecentLiveClasses(instructorId: number): Promise<RecentActivityItem[]> {
    const liveClasses = await this.liveClassesRepo.findRecentForInstructor(instructorId, 10);
    return liveClasses.map(liveClass => ({
      id: liveClass.id,
      type: 'live_class' as const,
      title: `Live class: ${liveClass.title}`,
       time: this.formatTimeAgo(liveClass.scheduledAt.toISOString()),
    }));
  }

  private formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour ago`;
    if (diffDays < 30) return `${diffDays} day ago`;
    return date.toLocaleDateString();
  }
}