import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { UsersRepository } from '../../db/repositories/users.repository';
import { InstructorProfilesRepository } from '../../db/repositories/instructor-profiles.repository';
import { StudentProfilesRepository } from '../../db/repositories/student-profiles.repository';
import { InstitutionAccountsRepository } from '../../db/repositories/institution-accounts.repository';
import { EmailVerificationsRepository } from '../../db/repositories/email-verifications.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';
import { AssignmentsRepository } from '../../db/repositories/assignments.repository';
import { PaymentsRepository } from '../../db/repositories/payments.repository';
import { ProgressRepository } from '../../db/repositories/progress.repository';
import { SettingsRepository } from '../../db/repositories/settings.repository';
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

export interface RevenueBreakdown {
  course_sales: number;
  subscriptions: number;
  other: number;
}

export interface ChartData {
  name: string;
  users: number;
  revenue: number;
}

export interface UserCountByRole {
  role: string;
  count: number;
}

export interface CourseCountByStatus {
  active: number;
  draft: number;
  archived: number;
}

export interface DatabaseStats {
  databaseSize: { bytes: number; pretty: string };
  tableCount: number;
  tables: { name: string; rowCount: number; sizeBytes: number; sizePretty: string }[];
  connectionPool: { active: number; idle: number; total: number; maxPool: number };
}

@Injectable()
export class AdminService {
  constructor(
    @Inject('ADMIN_DRIZZLE_DB') private readonly db: any,
    private readonly usersRepo: UsersRepository,
    private readonly instructorProfilesRepo: InstructorProfilesRepository,
    private readonly coursesRepo: CoursesRepository,
    private readonly assignmentsRepo: AssignmentsRepository,
    private readonly paymentsRepo: PaymentsRepository,
    private readonly progressRepo: ProgressRepository,
    private readonly settingsRepo: SettingsRepository,
    private readonly studentProfilesRepo: StudentProfilesRepository,
    private readonly institutionAccountsRepo: InstitutionAccountsRepository,
    private readonly emailVerificationsRepo: EmailVerificationsRepository,
  ) {}

  async listUsers(query: AdminListUsersQuery) {
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = ((query.page ?? 1) - 1) * limit;

    const result = await this.usersRepo.findMany({
      limit,
      offset,
      role: query.role,
      search: query.search,
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

  async getUserCountsByRole(): Promise<UserCountByRole[]> {
    // Define all possible roles from the enum
    const roles = ['student', 'instructor', 'admin', 'institution_admin'];
    
    // Get count for each role
    const counts = await Promise.all(
      roles.map(async (role) => {
        const count = await this.usersRepo.count({ role });
        return { role, count };
      })
    );
    
    return counts;
  }

   async getCourseCountsByStatus(): Promise<CourseCountByStatus> {
     const [active, draft, archived] = await Promise.all([
       this.coursesRepo.count({ isPublished: true }), // Active: published and not deleted
       this.coursesRepo.count({ isPublished: false }), // Draft: unpublished and not deleted
       this.coursesRepo.count({ deletedAt: true }), // Archived: deleted (regardless of publish state)
     ]);

     return {
       active,
       draft,
       archived,
     };
   }

async getRevenueBreakdown(): Promise<RevenueBreakdown> {
      const breakdown = await this.paymentsRepo.getRevenueBreakdown();

      // Initialize with default values
      const result: RevenueBreakdown = {
        course_sales: 0,
        subscriptions: 0,
        other: 0
      };

      // All payments are course-based now (no type column)
      // Sum up all revenue as course_sales
      breakdown.forEach(item => {
        result.course_sales += Number(item.total);
      });

      return result;
    }

  private sanitizeUser(user: User) {
    const { passwordHash, deletedAt, ...safe } = user;
    return safe;
  }

  // ─── Institution Management ───────────────────────────────────────────────

  async listInstitutions(query: { page?: number; limit?: number; search?: string } = {}) {
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = ((query.page ?? 1) - 1) * limit;

    const result = await this.institutionAccountsRepo.findMany({ limit, offset });

    return {
      institutions: result.data,
      total: result.total,
      page: query.page ?? 1,
      limit,
    };
  }

  async getInstitution(id: number) {
    const institution = await this.institutionAccountsRepo.findById(id);
    if (!institution) {
      throw new NotFoundException('Institution not found');
    }
    return institution;
  }

  // ─── Student Bulk Import ──────────────────────────────────────────────────

  async importStudentsFromCSV(
    institutionId: number,
    csvData: { name: string; email: string }[],
  ): Promise<{
    successCount: number;
    failureCount: number;
    errors: { row: number; email: string; reason: string }[];
  }> {
    const errors: { row: number; email: string; reason: string }[] = [];
    let successCount = 0;

    // Verify institution exists
    const institution = await this.institutionAccountsRepo.findById(institutionId);
    if (!institution) {
      throw new NotFoundException('Institution not found');
    }

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNumber = i + 2; // CSV row number (1-indexed, +1 for header)

      try {
        // Validate email format
        const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(row.email)) {
          errors.push({ row: rowNumber, email: row.email, reason: 'Invalid email format' });
          continue;
        }

        // Validate name
        if (!row.name || row.name.trim().length < 2) {
          errors.push({ row: rowNumber, email: row.email, reason: 'Name is required and must be at least 2 characters' });
          continue;
        }

        // Check if email already exists
        const existingUser = await this.usersRepo.findByEmail(row.email);
        if (existingUser) {
          errors.push({ row: rowNumber, email: row.email, reason: 'Email already registered' });
          continue;
        }

        // Create user
        const user = await this.usersRepo.create({
          email: row.email.toLowerCase().trim(),
          name: row.name.trim(),
          passwordHash: null, // No password - will be set via activation
          role: 'student',
          avatarUrl: null,
          isVerified: false, // Must verify via activation email
          isActive: true,
          approvalStatus: 'approved',
          onboardingCompleted: false,
          deletedAt: null,
        });

        // Create student profile with institution affiliation
        await this.studentProfilesRepo.create({
          userId: user.id,
          affiliatedInstituteId: institutionId,
          resumeUrl: null,
          skills: [],
          placementStatus: null,
          mobile: null,
          address: null,
          city: null,
          state: null,
          pinCode: null,
          country: null,
        });

        // Generate activation token
        const token = await this.generateActivationToken(user.id);

        // In production, send activation email here
        // For now, just log it
        console.log(`[CSV Import] Activation token for ${row.email}: ${token}`);

        successCount++;
      } catch (error) {
        errors.push({
          row: rowNumber,
          email: row.email,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      successCount,
      failureCount: errors.length,
      errors,
    };
  }

  // ─── Database Stats ─────────────────────────────────────────────────────

  async getDatabaseStats(): Promise<DatabaseStats> {
    // 1. Database size
    const [sizeRow] = await this.db.execute(sql`
      SELECT pg_database_size(current_database())::bigint AS bytes,
             pg_size_pretty(pg_database_size(current_database())) AS pretty
    `);

    // 2. Per-table row counts and sizes
    const tableRows = await this.db.execute(sql`
      SELECT
        relname                                        AS name,
        n_live_tup::bigint                             AS row_count,
        pg_total_relation_size(quote_ident(relname))   AS size_bytes,
        pg_size_pretty(pg_total_relation_size(quote_ident(relname))) AS size_pretty
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(quote_ident(relname)) DESC
    `);

    const tables = tableRows.map((r: any) => ({
      name: r.name,
      rowCount: Number(r.row_count),
      sizeBytes: Number(r.size_bytes),
      sizePretty: r.size_pretty,
    }));

    // 3. Connection pool stats
    const connRows = await this.db.execute(sql`
      SELECT
        state,
        count(*) AS cnt
      FROM pg_stat_activity
      WHERE datname = current_database()
      GROUP BY state
    `);

    let active = 0;
    let idle = 0;
    let total = 0;
    for (const row of connRows) {
      const cnt = Number(row.cnt);
      total += cnt;
      if (row.state === 'active') active = cnt;
      else if (row.state === 'idle' || row.state === 'idle in transaction') idle += cnt;
    }

    const [maxRow] = await this.db.execute(sql`SHOW max_connections`);
    const maxPool = Number(maxRow.max_connections);

    return {
      databaseSize: { bytes: Number(sizeRow.bytes), pretty: sizeRow.pretty },
      tableCount: tables.length,
      tables,
      connectionPool: { active, idle, total, maxPool },
    };
  }

  private async generateActivationToken(userId: number): Promise<string> {
    const crypto = require('crypto');
    const bcrypt = require('bcrypt');

    const token = crypto.randomBytes(64).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1200); // 1200 days

    await this.emailVerificationsRepo.create({
      userId,
      tokenHash,
      purpose: 'student_activation',
      expiresAt,
      verified: false,
    });

    return token;
  }
}