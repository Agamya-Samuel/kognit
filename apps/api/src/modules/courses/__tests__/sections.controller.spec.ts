import { Test, TestingModule } from '@nestjs/testing';
import { SectionsController } from '../sections.controller';
import { SectionsService } from '../sections.service';
import type { JwtPayload } from '../../auth/strategies';

// ─── Test Suite ─────────────────────────────────────────────────────────

describe('SectionsController', () => {
  let controller: SectionsController;
  let sectionsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    sectionsService = {
      getSectionsByCourse: jest.fn(),
      getSectionById: jest.fn(),
      createSection: jest.fn(),
      updateSection: jest.fn(),
      reorderSections: jest.fn(),
      deleteSection: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectionsController],
      providers: [{ provide: SectionsService, useValue: sectionsService }],
    }).compile();

    controller = module.get<SectionsController>(SectionsController);
  });

  describe('listSections', () => {
    it('should call sectionsService.getSectionsByCourse', async () => {
      const mockSections = [{ id: 1, title: 'Section 1' }];
      sectionsService.getSectionsByCourse.mockResolvedValue(mockSections);
      const user: JwtPayload = { sub: 10, email: 'test@test.com', role: 'instructor' };

      const result = await controller.listSections(1, user);

      expect(sectionsService.getSectionsByCourse).toHaveBeenCalledWith(1, 10, 'instructor');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSections);
    });

    it('should call with no user for public access', async () => {
      const mockSections = [{ id: 1, title: 'Section 1' }];
      sectionsService.getSectionsByCourse.mockResolvedValue(mockSections);

      const result = await controller.listSections(1);

      expect(sectionsService.getSectionsByCourse).toHaveBeenCalledWith(1, undefined, undefined);
    });
  });

  describe('getSection', () => {
    it('should call sectionsService.getSectionById', async () => {
      const mockSection = { id: 1, title: 'Section 1' };
      sectionsService.getSectionById.mockResolvedValue(mockSection);

      const result = await controller.getSection(1, 1);

      expect(sectionsService.getSectionById).toHaveBeenCalledWith(1, undefined, undefined);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSection);
    });
  });

  describe('createSection', () => {
    it('should call sectionsService.createSection with user data', async () => {
      const mockSection = { id: 1, title: 'New Section' };
      const user: JwtPayload = { sub: 10, email: 'instructor@test.com', role: 'instructor' };
      sectionsService.createSection.mockResolvedValue(mockSection);

      const result = await controller.createSection(1, user, {
        title: 'New Section',
      });

      expect(sectionsService.createSection).toHaveBeenCalledWith(1, 10, 'instructor', {
        title: 'New Section',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSection);
    });

    it('should allow admin to create section', async () => {
      const mockSection = { id: 1, title: 'Admin Section' };
      const user: JwtPayload = { sub: 99, email: 'admin@test.com', role: 'admin' };
      sectionsService.createSection.mockResolvedValue(mockSection);

      const result = await controller.createSection(1, user, { title: 'Admin Section' });

      expect(sectionsService.createSection).toHaveBeenCalledWith(1, 99, 'admin', {
        title: 'Admin Section',
      });
    });
  });

  describe('updateSection', () => {
    it('should call sectionsService.updateSection', async () => {
      const mockSection = { id: 1, title: 'Updated Section' };
      const user: JwtPayload = { sub: 10, email: 'instructor@test.com', role: 'instructor' };
      sectionsService.updateSection.mockResolvedValue(mockSection);

      const result = await controller.updateSection(1, 1, user, {
        title: 'Updated Section',
      });

      expect(sectionsService.updateSection).toHaveBeenCalledWith(1, 10, 'instructor', {
        title: 'Updated Section',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSection);
    });
  });

  describe('reorderSections', () => {
    it('should call sectionsService.reorderSections', async () => {
      const mockSections = [
        { id: 2, title: 'Section 2' },
        { id: 1, title: 'Section 1' },
      ];
      const user: JwtPayload = { sub: 10, email: 'instructor@test.com', role: 'instructor' };
      sectionsService.reorderSections.mockResolvedValue(mockSections);

      const result = await controller.reorderSections(1, user, {
        sectionIds: [2, 1],
      });

      expect(sectionsService.reorderSections).toHaveBeenCalledWith(1, 10, 'instructor', [2, 1]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSections);
    });
  });

  describe('deleteSection', () => {
    it('should call sectionsService.deleteSection', async () => {
      const user: JwtPayload = { sub: 10, email: 'instructor@test.com', role: 'instructor' };
      sectionsService.deleteSection.mockResolvedValue(undefined);

      const result = await controller.deleteSection(1, 1, user);

      expect(sectionsService.deleteSection).toHaveBeenCalledWith(1, 10, 'instructor');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ message: 'Section deleted successfully.' });
    });

    it('should allow admin to delete section', async () => {
      const user: JwtPayload = { sub: 99, email: 'admin@test.com', role: 'admin' };
      sectionsService.deleteSection.mockResolvedValue(undefined);

      const result = await controller.deleteSection(1, 1, user);

      expect(sectionsService.deleteSection).toHaveBeenCalledWith(1, 99, 'admin');
    });
  });
});
