import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../../db/repositories/users.repository';
import { InstructorProfilesRepository } from '../../db/repositories/instructor-profiles.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';
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

@Injectable()
export class AdminService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly instructorProfilesRepo: InstructorProfilesRepository,
    private readonly coursesRepo: CoursesRepository,
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

  // ─── Instructor Approval ─────────────────────────────────────────────────

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

  // ─── Course Moderation ───────────────────────────────────────────────────

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

  private sanitizeUser(user: User) {
    const { passwordHash, deletedAt, ...safe } = user;
    return safe;
  }
}
