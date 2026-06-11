import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CoursesService } from '../courses.service';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import { SectionsRepository } from '../../../db/repositories/sections.repository';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';
import { CourseSessionsRepository } from '../../../db/repositories/course-sessions.repository';
import { createCourse, createSection, createLecture } from '../../../test/factories';

// ─── Mock Helpers ───────────────────────────────────────────────────────

function createMockCoursesRepo(overrides: Partial<Record<string, jest.Mock>> = {}): Record<string, jest.Mock> {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue({ data: [], total: 0, limit: 10, offset: 0 }),
    create: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    softDelete: jest.fn(),
    findByInstructor: jest.fn().mockResolvedValue({ data: [], total: 0, limit: 10, offset: 0 }),
    count: jest.fn().mockResolvedValue(0),
    ...overrides,
  };
}

function createMockSectionsRepo(overrides: Partial<Record<string, jest.Mock>> = {}): Record<string, jest.Mock> {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByCourseId: jest.fn().mockResolvedValue({ data: [], total: 0, limit: 1000, offset: 0 }),
    findMany: jest.fn().mockResolvedValue({ data: [], total: 0, limit: 10, offset: 0 }),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    ...overrides,
  };
}

function createMockLecturesRepo(overrides: Partial<Record<string, jest.Mock>> = {}): Record<string, jest.Mock> {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findBySectionId: jest.fn().mockResolvedValue({ data: [], total: 0, limit: 1000, offset: 0 }),
    findMany: jest.fn().mockResolvedValue({ data: [], total: 0, limit: 10, offset: 0 }),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    ...overrides,
  };
}

function createMockCourseSessionsRepo(overrides: Partial<Record<string, jest.Mock>> = {}): Record<string, jest.Mock> {
  return {
    findByCourseId: jest.fn().mockResolvedValue([]),
    findUpcomingByCourse: jest.fn().mockResolvedValue([]),
    findByRecurringScheduleId: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
    ...overrides,
  };
}

// ─── Test Suite ─────────────────────────────────────────────────────────

describe('CoursesService', () => {
  let service: CoursesService;
  let coursesRepo: Record<string, jest.Mock>;
  let sectionsRepo: Record<string, jest.Mock>;
  let lecturesRepo: Record<string, jest.Mock>;

  beforeEach(async () => {
    coursesRepo = createMockCoursesRepo();
    sectionsRepo = createMockSectionsRepo();
    lecturesRepo = createMockLecturesRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: CoursesRepository, useValue: coursesRepo },
        { provide: SectionsRepository, useValue: sectionsRepo },
        { provide: LecturesRepository, useValue: lecturesRepo },
        { provide: CourseSessionsRepository, useValue: createMockCourseSessionsRepo() },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  // ─── createCourse ────────────────────────────────────────────────────

  describe('createCourse', () => {
    it('should throw ForbiddenException for student role', async () => {
      await expect(
        service.createCourse(1, 'student', { title: 'Test', domain: 'Programming', pricingType: 'free', courseStructure: 'normal' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for paid course with no price', async () => {
      await expect(
        service.createCourse(1, 'instructor', { title: 'Test', domain: 'Programming', pricingType: 'paid', courseStructure: 'normal' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for paid course with price 0', async () => {
      await expect(
        service.createCourse(1, 'instructor', { title: 'Test', domain: 'Programming', pricingType: 'paid', priceInr: 0, courseStructure: 'normal' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a free course successfully as instructor', async () => {
      const course = createCourse({ instructorId: 1, pricingType: 'free' });
      coursesRepo.create.mockResolvedValue(course);

      const result = await service.createCourse(1, 'instructor', {
        title: 'Test',
        domain: 'Programming',
        pricingType: 'free',
        courseStructure: 'normal',
      });

      expect(result).toEqual(course);
      expect(coursesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          instructorId: 1,
          pricingType: 'free',
          priceInr: 0,
          status: 'draft',
        }),
      );
    });

    it('should create a paid course with valid price as instructor', async () => {
      const course = createCourse({ instructorId: 1, pricingType: 'paid', priceInr: 999 });
      coursesRepo.create.mockResolvedValue(course);

      const result = await service.createCourse(1, 'instructor', {
        title: 'Paid Course',
        domain: 'Programming',
        pricingType: 'paid',
        priceInr: 999,
        courseStructure: 'normal',
      });

      expect(result).toEqual(course);
      expect(coursesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          pricingType: 'paid',
          priceInr: 999,
        }),
      );
    });

    it('should allow admin to create a course', async () => {
      const course = createCourse({ instructorId: 5 });
      coursesRepo.create.mockResolvedValue(course);

      const result = await service.createCourse(5, 'admin', {
        title: 'Admin Course',
        domain: 'Data Science',
        pricingType: 'free',
        courseStructure: 'live',
      });

      expect(result).toEqual(course);
    });
  });

  // ─── getCourseById ───────────────────────────────────────────────────

  describe('getCourseById', () => {
    it('should throw NotFoundException for non-existent course', async () => {
      coursesRepo.findById.mockResolvedValue(null);
      await expect(service.getCourseById(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for unpublished course when not owner', async () => {
      const course = createCourse({ id: 1, instructorId: 10, status: 'draft' });
      coursesRepo.findById.mockResolvedValue(course);

      await expect(service.getCourseById(1, 5, 'student')).rejects.toThrow(NotFoundException);
    });

    it('should return unpublished course to the owner instructor', async () => {
      const course = createCourse({ id: 1, instructorId: 10, status: 'draft' });
      coursesRepo.findById.mockResolvedValue(course);

      const result = await service.getCourseById(1, 10, 'instructor');
      expect(result).toEqual(course);
    });

    it('should return unpublished course to admin', async () => {
      const course = createCourse({ id: 1, instructorId: 10, status: 'draft' });
      coursesRepo.findById.mockResolvedValue(course);

      const result = await service.getCourseById(1, 99, 'admin');
      expect(result).toEqual(course);
    });

    it('should return published course to anyone', async () => {
      const course = createCourse({ id: 1, status: 'published' });
      coursesRepo.findById.mockResolvedValue(course);

      const result = await service.getCourseById(1);
      expect(result).toEqual(course);
    });
  });

  // ─── getCourseWithCurriculum ─────────────────────────────────────────

  describe('getCourseWithCurriculum', () => {
    it('should throw NotFoundException for non-existent course', async () => {
      coursesRepo.findById.mockResolvedValue(null);
      await expect(service.getCourseWithCurriculum(999)).rejects.toThrow(NotFoundException);
    });

    it('should return course with sections and lectures for owner', async () => {
      const course = createCourse({ id: 1, instructorId: 10, status: 'published' });
      const section = createSection({ id: 1, courseId: 1 });
      const lecture = createLecture({ id: 1, sectionId: 1, muxAssetId: 'asset-abc', muxPlaybackId: 'play-abc', durationSeconds: 600 });

      coursesRepo.findById.mockResolvedValue(course);
      sectionsRepo.findByCourseId.mockResolvedValue({ data: [section], total: 1, limit: 1000, offset: 0 });
      lecturesRepo.findBySectionId.mockResolvedValue({ data: [lecture], total: 1, limit: 1000, offset: 0 });

      const result = await service.getCourseWithCurriculum(1, 10, 'instructor');

      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].lectures).toHaveLength(1);
      expect(result.sections[0].lectures[0].muxAssetId).toBe('asset-abc');
    });

    it('should nullify media fields for non-preview lectures when user is not enrolled', async () => {
      const course = createCourse({ id: 1, instructorId: 10, status: 'published' });
      const section = createSection({ id: 1, courseId: 1 });
      const previewLecture = createLecture({ id: 1, sectionId: 1, isFreePreview: true, muxAssetId: 'preview-asset', muxPlaybackId: 'preview-play', durationSeconds: 200 });
      const restrictedLecture = createLecture({ id: 2, sectionId: 1, isFreePreview: false, muxAssetId: 'restricted-asset', muxPlaybackId: 'restricted-play', durationSeconds: 600, description: 'Secret description' });

      coursesRepo.findById.mockResolvedValue(course);
      sectionsRepo.findByCourseId.mockResolvedValue({ data: [section], total: 1, limit: 1000, offset: 0 });
      lecturesRepo.findBySectionId.mockResolvedValue({ data: [previewLecture, restrictedLecture], total: 2, limit: 1000, offset: 0 });

      const result = await service.getCourseWithCurriculum(1, 99, 'student', false);

      const lectures = result.sections[0].lectures;
      // Preview lecture: full access
      expect(lectures[0].muxAssetId).toBe('preview-asset');
      expect(lectures[0].durationSeconds).toBe(200);
      // Non-preview lecture: media hidden
      expect(lectures[1].muxAssetId).toBeNull();
      expect(lectures[1].muxPlaybackId).toBeNull();
      expect(lectures[1].durationSeconds).toBe(0);
      expect(lectures[1].description).toBeNull();
    });

    it('should give full access to enrolled users', async () => {
      const course = createCourse({ id: 1, instructorId: 10, status: 'published' });
      const section = createSection({ id: 1, courseId: 1 });
      const lecture = createLecture({ id: 1, sectionId: 1, isFreePreview: false, muxAssetId: 'full-asset' });

      coursesRepo.findById.mockResolvedValue(course);
      sectionsRepo.findByCourseId.mockResolvedValue({ data: [section], total: 1, limit: 1000, offset: 0 });
      lecturesRepo.findBySectionId.mockResolvedValue({ data: [lecture], total: 1, limit: 1000, offset: 0 });

      const result = await service.getCourseWithCurriculum(1, 99, 'student', true);
      expect(result.sections[0].lectures[0].muxAssetId).toBe('full-asset');
    });
  });

  // ─── listCourses ─────────────────────────────────────────────────────

  describe('listCourses', () => {
    it('should return paginated courses', async () => {
      const courses = [createCourse({ id: 1 }), createCourse({ id: 2 })];
      coursesRepo.findMany.mockResolvedValue({ data: courses, total: 2, limit: 20, offset: 0 });

      const result = await service.listCourses({ page: 1, limit: 20 });

      expect(result.courses).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });

    it('should compute hasNext and hasPrev correctly', async () => {
      const courses = [createCourse()];
      coursesRepo.findMany.mockResolvedValue({ data: courses, total: 30, limit: 20, offset: 0 });

      const result = await service.listCourses({ page: 1, limit: 20 });

      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(false);
    });

    it('should pass filter options to repository', async () => {
      coursesRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 20, offset: 0 });

      await service.listCourses({ page: 1, limit: 20, domain: 'Programming', status: 'published', instructorId: 5, search: 'test' });

      expect(coursesRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          domain: 'Programming',
          status: 'published',
          instructorId: 5,
          search: 'test',
        }),
      );
    });
  });

  // ─── updateCourse ────────────────────────────────────────────────────

  describe('updateCourse', () => {
    it('should throw NotFoundException for non-existent course', async () => {
      coursesRepo.findById.mockResolvedValue(null);
      await expect(
        service.updateCourse(999, 1, 'instructor', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner instructor', async () => {
      const course = createCourse({ id: 1, instructorId: 10 });
      coursesRepo.findById.mockResolvedValue(course);

      await expect(
        service.updateCourse(1, 5, 'instructor', { title: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for student', async () => {
      const course = createCourse({ id: 1, instructorId: 10 });
      coursesRepo.findById.mockResolvedValue(course);

      await expect(
        service.updateCourse(1, 10, 'student', { title: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for paid course with price 0', async () => {
      const course = createCourse({ id: 1, instructorId: 10 });
      coursesRepo.findById.mockResolvedValue(course);

      await expect(
        service.updateCourse(1, 10, 'instructor', { pricingType: 'paid', priceInr: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reset priceInr when switching to free', async () => {
      const course = createCourse({ id: 1, instructorId: 10, pricingType: 'paid', priceInr: 999 });
      const updated = { ...course, pricingType: 'free', priceInr: 0 };
      coursesRepo.findById.mockResolvedValue(course);
      coursesRepo.update.mockResolvedValue(updated);

      const result = await service.updateCourse(1, 10, 'instructor', { pricingType: 'free' });

      expect(coursesRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ priceInr: 0 }));
    });

    it('should throw ForbiddenException when editing in_review course as instructor', async () => {
      const course = createCourse({ id: 1, instructorId: 10, status: 'in_review' });
      coursesRepo.findById.mockResolvedValue(course);

      await expect(
        service.updateCourse(1, 10, 'instructor', { title: 'Updated' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when editing archived course', async () => {
      const course = createCourse({ id: 1, instructorId: 10, status: 'archived' });
      coursesRepo.findById.mockResolvedValue(course);

      await expect(
        service.updateCourse(1, 10, 'instructor', { title: 'Updated' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to update any course', async () => {
      const course = createCourse({ id: 1, instructorId: 10 });
      const updated = { ...course, title: 'Admin Updated' };
      coursesRepo.findById.mockResolvedValue(course);
      coursesRepo.update.mockResolvedValue(updated);

      const result = await service.updateCourse(1, 99, 'admin', { title: 'Admin Updated' });
      expect(result.title).toBe('Admin Updated');
    });

    it('should throw NotFoundException if update returns null', async () => {
      const course = createCourse({ id: 1, instructorId: 10 });
      coursesRepo.findById.mockResolvedValue(course);
      coursesRepo.update.mockResolvedValue(null);

      await expect(
        service.updateCourse(1, 10, 'instructor', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── Lifecycle actions ───────────────────────────────────────────────

  describe('submitForReview', () => {
    it('should throw NotFoundException for non-existent course', async () => {
      coursesRepo.findById.mockResolvedValue(null);
      await expect(service.submitForReview(999, 1, 'instructor')).rejects.toThrow(NotFoundException);
    });

    it('should transition course to in_review', async () => {
      const course = createCourse({
        id: 1,
        instructorId: 10,
        status: 'draft',
        description: 'A test course',
        thumbnailUrl: 'https://example.com/thumb.jpg',
      });
      const updated = { ...course, status: 'in_review' };
      coursesRepo.findById.mockResolvedValue(course);
      sectionsRepo.findByCourseId.mockResolvedValue({ data: [createSection({ courseId: 1 })], total: 1, limit: 1000, offset: 0 });
      lecturesRepo.findBySectionId.mockResolvedValue({ data: [createLecture({ sectionId: 1 })], total: 1, limit: 1000, offset: 0 });
      coursesRepo.updateStatus.mockResolvedValue(updated);

      const result = await service.submitForReview(1, 10, 'instructor');
      expect(result.status).toBe('in_review');
      expect(coursesRepo.updateStatus).toHaveBeenCalledWith(1, 'in_review');
    });
  });

  describe('approveCourse', () => {
    it('should transition course to published (admin only)', async () => {
      const course = createCourse({ id: 1, status: 'in_review' });
      const updated = { ...course, status: 'published' };
      coursesRepo.findById.mockResolvedValue(course);
      coursesRepo.updateStatus.mockResolvedValue(updated);

      const result = await service.approveCourse(1, 99);
      expect(result.status).toBe('published');
      expect(coursesRepo.updateStatus).toHaveBeenCalledWith(1, 'published');
    });
  });

  describe('requestRevision', () => {
    it('should transition course to revision_requested with notes', async () => {
      const course = createCourse({ id: 1, status: 'in_review' });
      const updated = { ...course, status: 'revision_requested', revisionNotes: 'Add more content' };
      coursesRepo.findById.mockResolvedValue(course);
      coursesRepo.updateStatus.mockResolvedValue(updated);

      const result = await service.requestRevision(1, 99, 'Add more content');
      expect(result.status).toBe('revision_requested');
      expect(coursesRepo.updateStatus).toHaveBeenCalledWith(1, 'revision_requested', 'Add more content');
    });
  });

  describe('archiveCourse', () => {
    it('should transition course to archived', async () => {
      const course = createCourse({ id: 1, instructorId: 10, status: 'published' });
      const updated = { ...course, status: 'archived' };
      coursesRepo.findById.mockResolvedValue(course);
      coursesRepo.updateStatus.mockResolvedValue(updated);

      const result = await service.archiveCourse(1, 10, 'instructor');
      expect(result.status).toBe('archived');
      expect(coursesRepo.updateStatus).toHaveBeenCalledWith(1, 'archived');
    });
  });

  // ─── deleteCourse ────────────────────────────────────────────────────

  describe('deleteCourse', () => {
    it('should throw NotFoundException for non-existent course', async () => {
      coursesRepo.findById.mockResolvedValue(null);
      await expect(service.deleteCourse(999, 1, 'instructor')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner instructor', async () => {
      const course = createCourse({ id: 1, instructorId: 10 });
      coursesRepo.findById.mockResolvedValue(course);
      await expect(service.deleteCourse(1, 5, 'instructor')).rejects.toThrow(ForbiddenException);
    });

    it('should soft-delete the course as owner', async () => {
      const course = createCourse({ id: 1, instructorId: 10 });
      coursesRepo.findById.mockResolvedValue(course);
      coursesRepo.softDelete.mockResolvedValue(true);

      await service.deleteCourse(1, 10, 'instructor');
      expect(coursesRepo.softDelete).toHaveBeenCalledWith(1);
    });

    it('should allow admin to delete any course', async () => {
      const course = createCourse({ id: 1, instructorId: 10 });
      coursesRepo.findById.mockResolvedValue(course);
      coursesRepo.softDelete.mockResolvedValue(true);

      await service.deleteCourse(1, 99, 'admin');
      expect(coursesRepo.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if softDelete returns false', async () => {
      const course = createCourse({ id: 1, instructorId: 10 });
      coursesRepo.findById.mockResolvedValue(course);
      coursesRepo.softDelete.mockResolvedValue(false);

      await expect(service.deleteCourse(1, 10, 'instructor')).rejects.toThrow(NotFoundException);
    });
  });
});
