import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SectionsService } from '../sections.service';
import { SectionsRepository } from '../../../db/repositories/sections.repository';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import { createCourse, createSection } from '../../../test/factories';

// ─── Mock Helpers ───────────────────────────────────────────────────────

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

describe('SectionsService', () => {
  let service: SectionsService;
  let sectionsRepo: Record<string, jest.Mock>;
  let coursesRepo: Record<string, jest.Mock>;

  beforeEach(async () => {
    sectionsRepo = createMockSectionsRepo();
    coursesRepo = createMockCoursesRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsService,
        { provide: SectionsRepository, useValue: sectionsRepo },
        { provide: CoursesRepository, useValue: coursesRepo },
      ],
    }).compile();

    service = module.get<SectionsService>(SectionsService);
  });

  // ─── createSection ───────────────────────────────────────────────────

  describe('createSection', () => {
    it('should throw NotFoundException for non-existent course', async () => {
      coursesRepo.findById.mockResolvedValue(null);
      await expect(
        service.createSection(999, 10, 'instructor', { title: 'Section 1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner instructor', async () => {
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      await expect(
        service.createSection(1, 5, 'instructor', { title: 'Section 1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for student', async () => {
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      await expect(
        service.createSection(1, 10, 'student', { title: 'Section 1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should auto-assign orderIndex when not provided', async () => {
      const course = createCourse({ instructorId: 10 });
      const existingSections = [createSection({ courseId: 1 }), createSection({ courseId: 1 })];
      const newSection = createSection({ courseId: 1, title: 'Section 3', orderIndex: 2 });

      coursesRepo.findById.mockResolvedValue(course);
      sectionsRepo.findByCourseId.mockResolvedValue({ data: existingSections, total: 2, limit: 1000, offset: 0 });
      sectionsRepo.create.mockResolvedValue(newSection);

      const result = await service.createSection(1, 10, 'instructor', { title: 'Section 3' });

      expect(sectionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ orderIndex: 2 }),
      );
      expect(result).toEqual(newSection);
    });

    it('should use provided orderIndex', async () => {
      const course = createCourse({ instructorId: 10 });
      const newSection = createSection({ courseId: 1, orderIndex: 5 });

      coursesRepo.findById.mockResolvedValue(course);
      sectionsRepo.create.mockResolvedValue(newSection);

      const result = await service.createSection(1, 10, 'instructor', { title: 'Section 1', orderIndex: 5 });

      expect(sectionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ orderIndex: 5 }),
      );
    });

    it('should allow admin to create section in any course', async () => {
      const course = createCourse({ instructorId: 10 });
      const newSection = createSection({ courseId: 1 });

      coursesRepo.findById.mockResolvedValue(course);
      sectionsRepo.create.mockResolvedValue(newSection);

      const result = await service.createSection(1, 99, 'admin', { title: 'Admin Section' });
      expect(result).toEqual(newSection);
    });
  });

  // ─── getSectionsByCourse ─────────────────────────────────────────────

  describe('getSectionsByCourse', () => {
    it('should throw NotFoundException for non-existent course', async () => {
      coursesRepo.findById.mockResolvedValue(null);
      await expect(service.getSectionsByCourse(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for unpublished course when not owner/admin', async () => {
      coursesRepo.findById.mockResolvedValue(createCourse({ status: 'draft', instructorId: 10 }));
      await expect(service.getSectionsByCourse(1, 5, 'student')).rejects.toThrow(NotFoundException);
    });

    it('should return sections for published course to anyone', async () => {
      const sections = [createSection({ courseId: 1 }), createSection({ courseId: 1 })];
      coursesRepo.findById.mockResolvedValue(createCourse({ status: 'published' }));
      sectionsRepo.findByCourseId.mockResolvedValue({ data: sections, total: 2, limit: 1000, offset: 0 });

      const result = await service.getSectionsByCourse(1);
      expect(result).toHaveLength(2);
    });

    it('should return sections for unpublished course to owner', async () => {
      const sections = [createSection({ courseId: 1 })];
      coursesRepo.findById.mockResolvedValue(createCourse({ status: 'draft', instructorId: 10 }));
      sectionsRepo.findByCourseId.mockResolvedValue({ data: sections, total: 1, limit: 1000, offset: 0 });

      const result = await service.getSectionsByCourse(1, 10, 'instructor');
      expect(result).toHaveLength(1);
    });
  });

  // ─── getSectionById ──────────────────────────────────────────────────

  describe('getSectionById', () => {
    it('should throw NotFoundException for non-existent section', async () => {
      sectionsRepo.findById.mockResolvedValue(null);
      await expect(service.getSectionById(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if course not found', async () => {
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(null);
      await expect(service.getSectionById(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for unpublished course when not owner/admin', async () => {
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ status: 'draft', instructorId: 10 }));

      await expect(service.getSectionById(1, 5, 'student')).rejects.toThrow(NotFoundException);
    });

    it('should return section for published course', async () => {
      const section = createSection({ id: 1, courseId: 1 });
      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(createCourse({ status: 'published' }));

      const result = await service.getSectionById(1);
      expect(result).toEqual(section);
    });
  });

  // ─── updateSection ───────────────────────────────────────────────────

  describe('updateSection', () => {
    it('should throw NotFoundException for non-existent section', async () => {
      sectionsRepo.findById.mockResolvedValue(null);
      await expect(
        service.updateSection(999, 10, 'instructor', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner instructor', async () => {
      const section = createSection({ courseId: 1 });
      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));

      await expect(
        service.updateSection(1, 5, 'instructor', { title: 'Hacked' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update section as owner', async () => {
      const section = createSection({ id: 1, courseId: 1 });
      const updated = { ...section, title: 'Updated Title' };
      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      sectionsRepo.update.mockResolvedValue(updated);

      const result = await service.updateSection(1, 10, 'instructor', { title: 'Updated Title' });
      expect(result.title).toBe('Updated Title');
    });

    it('should allow admin to update any section', async () => {
      const section = createSection({ id: 1, courseId: 1 });
      const updated = { ...section, title: 'Admin Updated' };
      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      sectionsRepo.update.mockResolvedValue(updated);

      const result = await service.updateSection(1, 99, 'admin', { title: 'Admin Updated' });
      expect(result.title).toBe('Admin Updated');
    });

    it('should throw NotFoundException if update returns null', async () => {
      const section = createSection({ courseId: 1 });
      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      sectionsRepo.update.mockResolvedValue(null);

      await expect(
        service.updateSection(1, 10, 'instructor', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── deleteSection ───────────────────────────────────────────────────

  describe('deleteSection', () => {
    it('should throw NotFoundException for non-existent section', async () => {
      sectionsRepo.findById.mockResolvedValue(null);
      await expect(service.deleteSection(999, 10, 'instructor')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner instructor', async () => {
      sectionsRepo.findById.mockResolvedValue(createSection({ courseId: 1 }));
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));

      await expect(service.deleteSection(1, 5, 'instructor')).rejects.toThrow(ForbiddenException);
    });

    it('should delete section as owner', async () => {
      const section = createSection({ courseId: 1 });
      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      sectionsRepo.delete.mockResolvedValue(true);

      await service.deleteSection(1, 10, 'instructor');
      expect(sectionsRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if delete returns false', async () => {
      const section = createSection({ courseId: 1 });
      sectionsRepo.findById.mockResolvedValue(section);
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      sectionsRepo.delete.mockResolvedValue(false);

      await expect(service.deleteSection(1, 10, 'instructor')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── reorderSections ─────────────────────────────────────────────────

  describe('reorderSections', () => {
    it('should throw NotFoundException for non-existent course', async () => {
      coursesRepo.findById.mockResolvedValue(null);
      await expect(
        service.reorderSections(999, 10, 'instructor', [1, 2]),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner', async () => {
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      await expect(
        service.reorderSections(1, 5, 'instructor', [1, 2]),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if section does not belong to course', async () => {
      coursesRepo.findById.mockResolvedValue(createCourse({ instructorId: 10 }));
      sectionsRepo.findByCourseId.mockResolvedValue({ data: [createSection({ id: 1, courseId: 1 })], total: 1, limit: 1000, offset: 0 });

      await expect(
        service.reorderSections(1, 10, 'instructor', [1, 999]),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reorder sections and return them', async () => {
      const course = createCourse({ instructorId: 10 });
      const s1 = createSection({ id: 1, courseId: 1, orderIndex: 0 });
      const s2 = createSection({ id: 2, courseId: 1, orderIndex: 1 });
      const reordered = [
        { ...s2, orderIndex: 0 },
        { ...s1, orderIndex: 1 },
      ];

      coursesRepo.findById.mockResolvedValue(course);
      sectionsRepo.findByCourseId
        .mockResolvedValueOnce({ data: [s1, s2], total: 2, limit: 1000, offset: 0 })
        .mockResolvedValueOnce({ data: reordered, total: 2, limit: 1000, offset: 0 });
      sectionsRepo.update.mockResolvedValue(undefined);

      const result = await service.reorderSections(1, 10, 'instructor', [2, 1]);

      expect(sectionsRepo.update).toHaveBeenCalledWith(2, { orderIndex: 0 });
      expect(sectionsRepo.update).toHaveBeenCalledWith(1, { orderIndex: 1 });
      expect(result).toEqual(reordered);
    });
  });
});
