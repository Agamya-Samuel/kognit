import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LecturesService } from '../lectures.service';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../../db/repositories/sections.repository';
import { CoursesRepository } from '../../../db/repositories/courses.repository';

// ─── Inline Test Factories ─────────────────────────────────────────────

function createCourse(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 1,
    instructorId: overrides.instructorId ?? 10,
    title: 'Test Course',
    description: 'A test course',
    thumbnailUrl: null,
    domain: 'Programming',
    pricingType: 'free',
    priceInr: 0,
    isPublished: overrides.isPublished ?? true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createSection(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id ?? 1,
    courseId: overrides.courseId ?? 1,
    title: 'Test Section',
    orderIndex: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

function createLecture(overrides: Record<string, any> = {}) {
  const id = overrides.id ?? Math.floor(Math.random() * 10000);
  return {
    id,
    sectionId: overrides.sectionId ?? 1,
    title: overrides.title ?? `Test Lecture ${id}`,
    description: overrides.description ?? 'A test lecture',
    orderIndex: overrides.orderIndex ?? 0,
    type: overrides.type ?? 'video',
    muxAssetId: overrides.muxAssetId ?? 'asset-123',
    muxPlaybackId: overrides.muxPlaybackId ?? 'playback-123',
    durationSeconds: overrides.durationSeconds ?? 300,
    isFreePreview: overrides.isFreePreview ?? false,
    isPublished: overrides.isPublished ?? false,
    createdAt: new Date(),
    ...overrides,
  };
}

// ─── Mock Helpers ───────────────────────────────────────────────────────

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

function createMockCoursesRepo(overrides: Partial<Record<string, jest.Mock>> = {}): Record<string, jest.Mock> {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue({ data: [], total: 0, limit: 10, offset: 0 }),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    ...overrides,
  };
}

// ─── Test Suite ─────────────────────────────────────────────────────────

describe('LecturesService', () => {
  let service: LecturesService;
  let lecturesRepo: Record<string, jest.Mock>;
  let sectionsRepo: Record<string, jest.Mock>;
  let coursesRepo: Record<string, jest.Mock>;

  beforeEach(async () => {
    lecturesRepo = createMockLecturesRepo();
    sectionsRepo = createMockSectionsRepo();
    coursesRepo = createMockCoursesRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LecturesService,
        { provide: LecturesRepository, useValue: lecturesRepo },
        { provide: SectionsRepository, useValue: sectionsRepo },
        { provide: CoursesRepository, useValue: coursesRepo },
      ],
    }).compile();

    service = module.get<LecturesService>(LecturesService);
  });

  // ─── createLecture ───────────────────────────────────────────────────

  describe('createLecture', () => {
    it('should throw NotFoundException for non-existent section', async () => {
      sectionsRepo.findById.mockResolvedValue(null);
      await expect(
        service.createLecture(999, 10, 'instructor', { title: 'Lecture 1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner instructor', async () => {
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));

      await expect(
        service.createLecture(1, 5, 'instructor', { title: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for student', async () => {
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));

      await expect(
        service.createLecture(1, 10, 'student', { title: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should auto-assign orderIndex when not provided', async () => {
      const section = createSection({ id: 1, courseId: 1 });
      const course = createCourse({ instructorId: 10 });
      const existingLectures = [createLecture({ sectionId: 1 }), createLecture({ sectionId: 1 })];
      const newLecture = createLecture({ sectionId: 1, title: 'Lecture 3', orderIndex: 2 });

      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(course);
      lecturesRepo.findBySectionId.mockResolvedValue({ data: existingLectures, total: 2, limit: 1000, offset: 0 });
      lecturesRepo.create.mockResolvedValue(newLecture);

      const result = await service.createLecture(1, 10, 'instructor', { title: 'Lecture 3' });

      expect(lecturesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ orderIndex: 2, type: 'video', isFreePreview: false, isPublished: false }),
      );
    });

    it('should create lecture with default values', async () => {
      const section = createSection({ id: 1, courseId: 1 });
      const course = createCourse({ instructorId: 10 });
      const newLecture = createLecture({ sectionId: 1 });

      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(course);
      lecturesRepo.create.mockResolvedValue(newLecture);

      const result = await service.createLecture(1, 10, 'instructor', { title: 'New Lecture' });

      expect(lecturesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'video',
          muxAssetId: null,
          muxPlaybackId: null,
          durationSeconds: 0,
          isFreePreview: false,
          isPublished: false,
        }),
      );
    });

    it('should allow admin to create lecture', async () => {
      const section = createSection({ id: 1, courseId: 1 });
      const course = createCourse({ instructorId: 10 });
      const newLecture = createLecture({ sectionId: 1 });

      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(course);
      lecturesRepo.create.mockResolvedValue(newLecture);

      const result = await service.createLecture(1, 99, 'admin', { title: 'Admin Lecture' });
      expect(result).toEqual(newLecture);
    });
  });

  // ─── getLecturesBySection ───────────────────────────────────────────

  describe('getLecturesBySection', () => {
    it('should throw NotFoundException for non-existent section', async () => {
      sectionsRepo.findById.mockResolvedValue(null);
      await expect(service.getLecturesBySection(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if course not found', async () => {
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(null);
      await expect(service.getLecturesBySection(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for unpublished course when not owner/admin', async () => {
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ isPublished: false, instructorId: 10 }));

      await expect(service.getLecturesBySection(1, 5, 'student')).rejects.toThrow(NotFoundException);
    });

    it('should hide media fields for non-preview lectures for non-enrolled users', async () => {
      const section = createSection({ id: 1, courseId: 1 });
      const course = createCourse({ id: 1, instructorId: 10, isPublished: true });
      const previewLecture = createLecture({ id: 1, sectionId: 1, isFreePreview: true, muxAssetId: 'preview-asset', durationSeconds: 200 });
      const restrictedLecture = createLecture({ id: 2, sectionId: 1, isFreePreview: false, muxAssetId: 'restricted-asset', durationSeconds: 600, description: 'Secret' });

      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(course);
      lecturesRepo.findBySectionId.mockResolvedValue({ data: [previewLecture, restrictedLecture], total: 2, limit: 1000, offset: 0 });

      const result = await service.getLecturesBySection(1, 99, 'student', false);

      expect(result[0].muxAssetId).toBe('preview-asset');
      expect(result[0].durationSeconds).toBe(200);
      expect(result[1].muxAssetId).toBeNull();
      expect(result[1].muxPlaybackId).toBeNull();
      expect(result[1].durationSeconds).toBe(0);
      expect(result[1].description).toBeNull();
    });

    it('should return full lecture data to owner', async () => {
      const section = createSection({ id: 1, courseId: 1 });
      const course = createCourse({ id: 1, instructorId: 10, isPublished: true });
      const lecture = createLecture({ id: 1, sectionId: 1, isFreePreview: false, muxAssetId: 'full-asset', durationSeconds: 600 });

      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(course);
      lecturesRepo.findBySectionId.mockResolvedValue({ data: [lecture], total: 1, limit: 1000, offset: 0 });

      const result = await service.getLecturesBySection(1, 10, 'instructor', false);
      expect(result[0].muxAssetId).toBe('full-asset');
    });

    it('should return full lecture data to enrolled users', async () => {
      const section = createSection({ id: 1, courseId: 1 });
      const course = createCourse({ id: 1, instructorId: 10, isPublished: true });
      const lecture = createLecture({ id: 1, sectionId: 1, isFreePreview: false, muxAssetId: 'full-asset' });

      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(course);
      lecturesRepo.findBySectionId.mockResolvedValue({ data: [lecture], total: 1, limit: 1000, offset: 0 });

      const result = await service.getLecturesBySection(1, 99, 'student', true);
      expect(result[0].muxAssetId).toBe('full-asset');
    });
  });

  // ─── getLectureById ────────────────────────────────────────────────

  describe('getLectureById', () => {
    it('should throw NotFoundException for non-existent lecture', async () => {
      lecturesRepo.findById.mockResolvedValue(null);
      await expect(service.getLectureById(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for unpublished course when not owner/admin', async () => {
      lecturesRepo.findById.mockResolvedValue(createLecture({ sectionId: 1 }));
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ isPublished: false, instructorId: 10 }));

      await expect(service.getLectureById(1, 5, 'student')).rejects.toThrow(NotFoundException);
    });

    it('should hide media details for non-preview, non-enrolled lecture', async () => {
      const lecture = createLecture({ id: 1, sectionId: 1, isFreePreview: false, muxAssetId: 'secret-asset', description: 'Secret desc' });
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ id: 1, instructorId: 10, isPublished: true }));

      lecturesRepo.findById.mockResolvedValue(lecture);
      sectionsRepo.findById.mockResolvedValue(createSection({ id: 1, courseId: 1 }));

      const result = await service.getLectureById(1, 99, 'student', false);

      expect(result.muxAssetId).toBeNull();
      expect(result.muxPlaybackId).toBeNull();
      expect(result.durationSeconds).toBe(0);
      expect(result.description).toBeNull();
    });

    it('should return full data for preview lecture', async () => {
      const lecture = createLecture({ id: 1, sectionId: 1, isFreePreview: true, muxAssetId: 'preview-asset', durationSeconds: 200 });
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ id: 1, instructorId: 10, isPublished: true }));

      lecturesRepo.findById.mockResolvedValue(lecture);
      sectionsRepo.findById.mockResolvedValue(createSection({ id: 1, courseId: 1 }));

      const result = await service.getLectureById(1, 99, 'student', false);
      expect(result.muxAssetId).toBe('preview-asset');
      expect(result.durationSeconds).toBe(200);
    });

    it('should return full data to owner', async () => {
      const lecture = createLecture({ id: 1, sectionId: 1, isFreePreview: false, muxAssetId: 'owner-asset' });
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ id: 1, instructorId: 10, isPublished: true }));

      lecturesRepo.findById.mockResolvedValue(lecture);
      sectionsRepo.findById.mockResolvedValue(createSection({ id: 1, courseId: 1 }));

      const result = await service.getLectureById(1, 10, 'instructor', false);
      expect(result.muxAssetId).toBe('owner-asset');
    });
  });

  // ─── updateLecture ───────────────────────────────────────────────────

  describe('updateLecture', () => {
    it('should throw NotFoundException for non-existent lecture', async () => {
      lecturesRepo.findById.mockResolvedValue(null);
      await expect(
        service.updateLecture(999, 10, 'instructor', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner instructor', async () => {
      lecturesRepo.findById.mockResolvedValue(createLecture({ sectionId: 1 }));
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));

      await expect(
        service.updateLecture(1, 5, 'instructor', { title: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update lecture as owner', async () => {
      const lecture = createLecture({ id: 1, sectionId: 1 });
      const updated = { ...lecture, title: 'Updated Title', description: 'Updated desc' };

      lecturesRepo.findById.mockResolvedValue(lecture);
      sectionsRepo.findById.mockResolvedValue(createSection({ id: 1, courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      lecturesRepo.update.mockResolvedValue(updated);

      const result = await service.updateLecture(1, 10, 'instructor', { title: 'Updated Title', description: 'Updated desc' });
      expect(result.title).toBe('Updated Title');
    });

    it('should allow admin to update any lecture', async () => {
      const lecture = createLecture({ id: 1, sectionId: 1 });
      const updated = { ...lecture, title: 'Admin Updated' };

      lecturesRepo.findById.mockResolvedValue(lecture);
      sectionsRepo.findById.mockResolvedValue(createSection({ id: 1, courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      lecturesRepo.update.mockResolvedValue(updated);

      const result = await service.updateLecture(1, 99, 'admin', { title: 'Admin Updated' });
      expect(result.title).toBe('Admin Updated');
    });

    it('should throw NotFoundException if update returns null', async () => {
      const lecture = createLecture({ id: 1, sectionId: 1 });
      lecturesRepo.findById.mockResolvedValue(lecture);
      sectionsRepo.findById.mockResolvedValue(createSection({ id: 1, courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      lecturesRepo.update.mockResolvedValue(null);

      await expect(
        service.updateLecture(1, 10, 'instructor', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── deleteLecture ───────────────────────────────────────────────────

  describe('deleteLecture', () => {
    it('should throw NotFoundException for non-existent lecture', async () => {
      lecturesRepo.findById.mockResolvedValue(null);
      await expect(service.deleteLecture(999, 10, 'instructor')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner', async () => {
      lecturesRepo.findById.mockResolvedValue(createLecture({ sectionId: 1 }));
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));

      await expect(service.deleteLecture(1, 5, 'instructor')).rejects.toThrow(ForbiddenException);
    });

    it('should delete lecture as owner', async () => {
      const lecture = createLecture({ id: 1, sectionId: 1 });
      lecturesRepo.findById.mockResolvedValue(lecture);
      sectionsRepo.findById.mockResolvedValue(createSection({ id: 1, courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      lecturesRepo.delete.mockResolvedValue(true);

      await service.deleteLecture(1, 10, 'instructor');
      expect(lecturesRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if delete returns false', async () => {
      const lecture = createLecture({ id: 1, sectionId: 1 });
      lecturesRepo.findById.mockResolvedValue(lecture);
      sectionsRepo.findById.mockResolvedValue(createSection({ id: 1, courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      lecturesRepo.delete.mockResolvedValue(false);

      await expect(service.deleteLecture(1, 10, 'instructor')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── reorderLectures ─────────────────────────────────────────────────

  describe('reorderLectures', () => {
    it('should throw NotFoundException for non-existent section', async () => {
      sectionsRepo.findById.mockResolvedValue(null);
      await expect(
        service.reorderLectures(999, 10, 'instructor', [1, 2]),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if course not found', async () => {
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(null);
      await expect(
        service.reorderLectures(1, 10, 'instructor', [1, 2]),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner', async () => {
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));

      await expect(
        service.reorderLectures(1, 5, 'instructor', [1, 2]),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if lecture does not belong to section', async () => {
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      lecturesRepo.findBySectionId.mockResolvedValue({ data: [createLecture({ id: 1, sectionId: 1 })], total: 1, limit: 1000, offset: 0 });

      await expect(
        service.reorderLectures(1, 10, 'instructor', [1, 999]),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reorder lectures and return them', async () => {
      const section = createSection({ id: 1, courseId: 1 });
      const course = createCourse({ id: 1, instructorId: 10 });
      const l1 = createLecture({ id: 1, sectionId: 1, orderIndex: 0 });
      const l2 = createLecture({ id: 2, sectionId: 1, orderIndex: 1 });
      const reordered = [
        { ...l2, orderIndex: 0 },
        { ...l1, orderIndex: 1 },
      ];

      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(course);
      lecturesRepo.findBySectionId
        .mockResolvedValueOnce({ data: [l1, l2], total: 2, limit: 1000, offset: 0 })
        .mockResolvedValueOnce({ data: reordered, total: 2, limit: 1000, offset: 0 });
      lecturesRepo.update.mockResolvedValue(undefined);

      const result = await service.reorderLectures(1, 10, 'instructor', [2, 1]);

      expect(lecturesRepo.update).toHaveBeenCalledWith(2, { orderIndex: 0 });
      expect(lecturesRepo.update).toHaveBeenCalledWith(1, { orderIndex: 1 });
      expect(result).toEqual(reordered);
    });
  });
});
