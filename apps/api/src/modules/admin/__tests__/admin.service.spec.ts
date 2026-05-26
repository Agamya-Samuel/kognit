import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { UsersRepository } from '../../../db/repositories/users.repository';
import { InstructorProfilesRepository } from '../../../db/repositories/instructor-profiles.repository';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import { AssignmentsRepository } from '../../../db/repositories/assignments.repository';
import { PaymentsRepository } from '../../../db/repositories/payments.repository';
import { ProgressRepository } from '../../../db/repositories/progress.repository';

describe('AdminService', () => {
  let service: AdminService;
  let usersRepo: jest.Mocked<UsersRepository>;
  let instructorProfilesRepo: jest.Mocked<InstructorProfilesRepository>;
  let coursesRepo: jest.Mocked<CoursesRepository>;

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    name: 'Test User',
    role: 'student' as const,
    passwordHash: 'hash',
    avatarUrl: null,
    isVerified: true,
    isActive: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockInstructorProfile = {
    id: 1,
    userId: 2,
    bio: 'Experienced developer',
    expertise: ['React', 'TypeScript'],
    socialLinks: [],
    approvalStatus: 'pending' as const,
    razorpaySellerAccountId: null,
    createdAt: new Date(),
  };

  const mockCourse = {
    id: 1,
    instructorId: 2,
    title: 'Test Course',
    description: 'A test course',
    thumbnailUrl: null,
    domain: 'Programming',
    pricingType: 'free' as const,
    priceInr: 0,
    isPublished: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            count: jest.fn(),
            countAfterDate: jest.fn(),
          },
        },
        {
          provide: InstructorProfilesRepository,
          useValue: {
            findById: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            countAllApproved: jest.fn(),
            countAllPending: jest.fn(),
          },
        },
        {
          provide: CoursesRepository,
          useValue: {
            findById: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: AssignmentsRepository,
          useValue: {
            findById: jest.fn(),
            findByLectureId: jest.fn(),
            findMany: jest.fn(),
            findManyWithCourseName: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: PaymentsRepository,
          useValue: {
            findById: jest.fn(),
            findByRazorpayOrderId: jest.fn(),
            findByRazorpayPaymentId: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            sumPaidAmount: jest.fn(),
            getDailyStats: jest.fn(),
          },
        },
        {
          provide: ProgressRepository,
          useValue: {
            findById: jest.fn(),
            findByStudentAndLecture: jest.fn(),
            upsert: jest.fn(),
            count: jest.fn(),
            countCompleted: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    usersRepo = module.get(UsersRepository);
    instructorProfilesRepo = module.get(InstructorProfilesRepository);
    coursesRepo = module.get(CoursesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Instructor Approval ─────────────────────────────────────────────────

  describe('listPendingInstructors', () => {
    it('should return paginated pending instructors with user info', async () => {
      instructorProfilesRepo.findMany.mockResolvedValue({
        data: [mockInstructorProfile],
        total: 1,
        limit: 20,
        offset: 0,
      });
      usersRepo.findById.mockResolvedValue({ ...mockUser, id: 2, name: 'Instructor', role: 'student' });

      const result = await service.listPendingInstructors({ page: 1, limit: 20 });

      expect(result.instructors).toHaveLength(1);
      expect(result.instructors[0].userName).toBe('Instructor');
      expect(result.total).toBe(1);
    });
  });

  describe('approveInstructor', () => {
    it('should approve instructor and upgrade user role', async () => {
      instructorProfilesRepo.findById.mockResolvedValue(mockInstructorProfile);
      instructorProfilesRepo.update.mockResolvedValue({
        ...mockInstructorProfile,
        approvalStatus: 'approved',
      });
      usersRepo.update.mockResolvedValue({ ...mockUser, id: 2, role: 'instructor' });

      const result = await service.approveInstructor(1);

      expect(result.message).toBe('Instructor approved');
      expect(instructorProfilesRepo.update).toHaveBeenCalledWith(1, { approvalStatus: 'approved' });
      expect(usersRepo.update).toHaveBeenCalledWith(2, { role: 'instructor' });
    });

    it('should throw if profile not found', async () => {
      instructorProfilesRepo.findById.mockResolvedValue(null);

      await expect(service.approveInstructor(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('rejectInstructor', () => {
    it('should reject instructor with reason', async () => {
      instructorProfilesRepo.findById.mockResolvedValue(mockInstructorProfile);
      instructorProfilesRepo.update.mockResolvedValue({
        ...mockInstructorProfile,
        approvalStatus: 'rejected',
      });

      const result = await service.rejectInstructor(1, 'Insufficient qualifications');

      expect(result.message).toBe('Instructor rejected');
      expect(instructorProfilesRepo.update).toHaveBeenCalledWith(1, { approvalStatus: 'rejected' });
    });

    it('should throw if reason is empty', async () => {
      await expect(service.rejectInstructor(1, '')).rejects.toThrow(BadRequestException);
    });

    it('should throw if profile not found', async () => {
      instructorProfilesRepo.findById.mockResolvedValue(null);

      await expect(service.rejectInstructor(999, 'Reason')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── Course Moderation ───────────────────────────────────────────────────

  describe('listCourses', () => {
    it('should return paginated courses with instructor names', async () => {
      coursesRepo.findMany.mockResolvedValue({
        data: [mockCourse],
        total: 1,
        limit: 20,
        offset: 0,
      });
      usersRepo.findById.mockResolvedValue({ ...mockUser, id: 2, name: 'Prof Smith' });

      const result = await service.listCourses({ page: 1, limit: 20 });

      expect(result.courses).toHaveLength(1);
      expect(result.courses[0].instructorName).toBe('Prof Smith');
      expect(result.total).toBe(1);
    });
  });

  describe('approveCourse', () => {
    it('should publish a course', async () => {
      coursesRepo.update.mockResolvedValue({ ...mockCourse, isPublished: true });

      const result = await service.approveCourse(1);

      expect(result.message).toBe('Course approved');
      expect(coursesRepo.update).toHaveBeenCalledWith(1, { isPublished: true });
    });

    it('should throw if course not found', async () => {
      coursesRepo.update.mockResolvedValue(null);

      await expect(service.approveCourse(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('rejectCourse', () => {
    it('should reject and soft-delete a course', async () => {
      coursesRepo.findById.mockResolvedValue(mockCourse);
      coursesRepo.softDelete.mockResolvedValue(true);

      const result = await service.rejectCourse(1, 'Violates guidelines');

      expect(result.message).toBe('Course rejected');
      expect(coursesRepo.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw if reason is empty', async () => {
      await expect(service.rejectCourse(1, '')).rejects.toThrow(BadRequestException);
    });

    it('should throw if course not found', async () => {
      coursesRepo.findById.mockResolvedValue(null);

      await expect(service.rejectCourse(999, 'Reason')).rejects.toThrow(NotFoundException);
    });
  });

  describe('suspendCourse', () => {
    it('should unpublish a course', async () => {
      coursesRepo.update.mockResolvedValue({ ...mockCourse, isPublished: false });

      const result = await service.suspendCourse(1);

      expect(result.message).toBe('Course suspended');
      expect(coursesRepo.update).toHaveBeenCalledWith(1, { isPublished: false });
    });

    it('should throw if course not found', async () => {
      coursesRepo.update.mockResolvedValue(null);

      await expect(service.suspendCourse(999)).rejects.toThrow(NotFoundException);
    });
  });
});
