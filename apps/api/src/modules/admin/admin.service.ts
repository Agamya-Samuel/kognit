import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../db/repositories/users.repository';
import { InstructorProfilesRepository } from '../../db/repositories/instructor-profiles.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';
import { AssignmentsRepository } from '../../db/repositories/assignments.repository';
import { PaymentsRepository } from '../../db/repositories/payments.repository';
import { TestProgressRepository } from '../../db/repositories/progress.repository';
import type { User } from '../../db/schema';

export interface AdminListUsersQuery {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export interface AdminListInstructorsQuery {
  page?: number;
  limit?: number;
  status?: string;
}

export interface AdminListCoursesQuery {
  page?: number;
  limit?: number;
  search?: string;
  isPublished?: boolean;
}

export interface AdminListAssignmentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface DashboardMetrics {
  totalUsers: number;
  totalCourses: number;
  totalInstructors: number;
  totalRevenue: number;
  activeUsers: number;
  newUsersThisMonth: number;
  completedCourses: number;
  pendingApprovals: number;
}

export interface ChartData {
  name: string;
  users: number;
  revenue: number;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly instructorProfilesRepo: InstructorProfilesRepository,
    private readonly coursesRepo: CoursesRepository,
    private readonly assignmentsRepo: AssignmentsRepository,
    private readonly paymentsRepo: PaymentsRepository,
    private readonly progressRepo: TestProgressRepository,
  ) {}

  async listUsers(query: AdminListUsersQuery) {
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = ((query.page ?? 1) - 1) * limit;

    const result = await this.usersRepo.findMany({
      limit,
      offset,
      role: query.role,
    });

    return {
      users: result.data.map(this.sanitizeUser),
      total: result.total,
      page: query.page ?? 1,
      limit,
    };
  }

  async getUser(id: number) {
    const user = await this.usersRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  async updateUserRole(id: number, role: string) {
    const user = await this.usersRepo.update(id, { role: role as User['role'] });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  async toggleUserActive(id: number) {
    const user = await this.usersRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const updated = await this.usersRepo.update(id, { isActive: !user.isActive });
    return this.sanitizeUser(updated!);
  }

  async deleteUser(id: number) {
    const deleted = await this.usersRepo.softDelete(id);
    if (!deleted) throw new NotFoundException('User not found');
    return { message: 'User deleted' };
  }

  async listPendingInstructors(query: AdminListInstructorsQuery) {
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = ((query.page ?? 1) - 1) * limit;

    const result = await this.instructorProfilesRepo.findMany({
      limit,
      offset,
      approvalStatus: query.status || 'pending',
    });

    const enriched = await Promise.all(
      result.data.map(async (profile) => {
        const user = await this.usersRepo.findById(profile.userId);
        return {
          ...profile,
          userName: user?.name ?? 'Unknown',
          userEmail: user?.email ?? '',
        };
      }),
    );

    return {
      instructors: enriched,
      total: result.total,
      page: query.page ?? 1,
      limit,
    };
  }

  async approveInstructor(profileId: number) {
    const profile = await this.instructorProfilesRepo.findById(profileId);
    if (!profile) throw new NotFoundException('Instructor profile not found');

    await this.instructorProfilesRepo.update(profileId, {
      approvalStatus: 'approved',
    });

    await this.usersRepo.update(profile.userId, { role: 'instructor' });

    return { message: 'Instructor approved' };
  }

  async rejectInstructor(profileId: number, reason: string) {
    if (!reason?.trim()) throw new BadRequestException('Rejection reason is required');

    const profile = await this.instructorProfilesRepo.findById(profileId);
    if (!profile) throw new NotFoundException('Instructor profile not found');

    await this.instructorProfilesRepo.update(profileId, {
      approvalStatus: 'rejected',
    });

    return { message: 'Instructor rejected' };
  }

  async listCourses(query: AdminListCoursesQuery) {
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = ((query.page ?? 1) - 1) * limit;

    const result = await this.coursesRepo.findMany({
      limit,
      offset,
      search: query.search,
      isPublished: query.isPublished,
    });

    const enriched = await Promise.all(
      result.data.map(async (course) => {
        const instructor = await this.usersRepo.findById(course.instructorId);
        return {
          ...course,
          instructorName: instructor?.name ?? 'Unknown',
        };
      }),
    );

    return {
      courses: enriched,
      total: result.total,
      page: query.page ?? 1,
      limit,
    };
  }

  async approveCourse(courseId: number) {
    const course = await this.coursesRepo.update(courseId, { isPublished: true });
    if (!course) throw new NotFoundException('Course not found');
    return { message: 'Course approved' };
  }

  async rejectCourse(courseId: number, reason: string) {
    if (!reason?.trim()) throw new BadRequestException('Rejection reason is required');

    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    await this.coursesRepo.softDelete(courseId);

    return { message: 'Course rejected' };
  }

  async suspendCourse(courseId: number) {
    const course = await this.coursesRepo.update(courseId, { isPublished: false });
    if (!course) throw new NotFoundException('Course not found');
    return { message: 'Course suspended' };
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalCourses,
      totalInstructors,
      totalRevenue,
      activeUsers,
      newUsersThisMonth,
      completedCourses,
      pendingApprovals,
    ] = await Promise.all([
      this.usersRepo.count(),
      this.coursesRepo.count(),
      this.instructorProfilesRepo.countAllApproved(),
      this.paymentsRepo.sumPaidAmount(),
      this.usersRepo.count({ isActive: true }),
      this.usersRepo.countAfterDate(startOfMonth),
      this.progressRepo.countCompleted(),
      this.instructorProfilesRepo.countAllPending(),
    ]);

    return {
      totalUsers,
      totalCourses,
      totalInstructors,
      totalRevenue,
      activeUsers,
      newUsersThisMonth,
      completedCourses,
      pendingApprovals,
    };
  }

  async getChartData(days: number = 30): Promise<ChartData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.paymentsRepo.getDailyStats(startDate);
  }

  async listAssignments(query: AdminListAssignmentsQuery) {
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = ((query.page ?? 1) - 1) * limit;

    const result = await this.assignmentsRepo.findManyWithCourseName({
      offset,
      limit,
      search: query.search,
      status: query.status,
    });

    return {
      assignments: result.data,
      total: result.total,
      page: query.page ?? 1,
      limit,
    };
  }

  async deleteAssignment(id: number) {
    const deleted = await this.assignmentsRepo.delete(id);
    if (!deleted) throw new NotFoundException('Assignment not found');
    return { message: 'Assignment deleted' };
  }

  // ─── Settings Management ───────────────────────────────────────────────

  async getSettings(): Promise<any> {
    const settings = await this.settingsRepo.getAll();
    // Group settings by key for easier consumption by frontend
    const grouped = {};
    for (const setting of settings) {
      grouped[setting.id] = JSON.parse(setting.value);
    }
    return grouped;
  }

  async updateSettings(settingsData: any): Promise<{ message: string }> {
    // Update each setting key-value pair
    for (const [key, value] of Object.entries(settingsData)) {
      await this.settingsRepo.upsert(key, JSON.stringify(value), `Setting for ${key}`);
    }
    return { message: 'Settings updated successfully' };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, deletedAt, ...safe } = user;
    return safe;
  }
}