import { Test, TestingModule } from '@nestjs/testing';
import { LecturesController } from '../lectures.controller';
import { LecturesService } from '../lectures.service';
import type { JwtPayload } from '../../auth/strategies';

// ─── Test Suite ─────────────────────────────────────────────────────────

describe('LecturesController', () => {
  let controller: LecturesController;
  let lecturesService: Record<string, jest.Mock>;

  beforeEach(async () => {
    lecturesService = {
      getLecturesBySection: jest.fn(),
      getLectureById: jest.fn(),
      createLecture: jest.fn(),
      updateLecture: jest.fn(),
      reorderLectures: jest.fn(),
      deleteLecture: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LecturesController],
      providers: [{ provide: LecturesService, useValue: lecturesService }],
    }).compile();

    controller = module.get<LecturesController>(LecturesController);
  });

  describe('listLectures', () => {
    it('should call lecturesService.getLecturesBySection', async () => {
      const mockLectures = [{ id: 1, title: 'Lecture 1' }];
      lecturesService.getLecturesBySection.mockResolvedValue(mockLectures);
      const user: JwtPayload = { sub: 10, email: 'test@test.com', role: 'instructor' };

      const result = await controller.listLectures(1, user);

      expect(lecturesService.getLecturesBySection).toHaveBeenCalledWith(1, 10, 'instructor', false);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLectures);
    });

    it('should call with no user for public access', async () => {
      const mockLectures = [{ id: 1, title: 'Lecture 1' }];
      lecturesService.getLecturesBySection.mockResolvedValue(mockLectures);

      const result = await controller.listLectures(1);

      expect(lecturesService.getLecturesBySection).toHaveBeenCalledWith(1, undefined, undefined, false);
    });
  });

  describe('getLecture', () => {
    it('should call lecturesService.getLectureById', async () => {
      const mockLecture = { id: 1, title: 'Lecture 1' };
      lecturesService.getLectureById.mockResolvedValue(mockLecture);

      const result = await controller.getLecture(1, 1);

      expect(lecturesService.getLectureById).toHaveBeenCalledWith(1, undefined, undefined, false);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLecture);
    });
  });

  describe('createLecture', () => {
    it('should call lecturesService.createLecture with user data', async () => {
      const mockLecture = { id: 1, title: 'New Lecture' };
      const user: JwtPayload = { sub: 10, email: 'instructor@test.com', role: 'instructor' };
      lecturesService.createLecture.mockResolvedValue(mockLecture);

      const result = await controller.createLecture(1, user, {
        title: 'New Lecture',
      });

      expect(lecturesService.createLecture).toHaveBeenCalledWith(1, 10, 'instructor', {
        title: 'New Lecture',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLecture);
    });

    it('should allow admin to create lecture', async () => {
      const mockLecture = { id: 1, title: 'Admin Lecture' };
      const user: JwtPayload = { sub: 99, email: 'admin@test.com', role: 'admin' };
      lecturesService.createLecture.mockResolvedValue(mockLecture);

      const result = await controller.createLecture(1, user, { title: 'Admin Lecture' });

      expect(lecturesService.createLecture).toHaveBeenCalledWith(1, 99, 'admin', {
        title: 'Admin Lecture',
      });
    });
  });

  describe('updateLecture', () => {
    it('should call lecturesService.updateLecture', async () => {
      const mockLecture = { id: 1, title: 'Updated Lecture' };
      const user: JwtPayload = { sub: 10, email: 'instructor@test.com', role: 'instructor' };
      lecturesService.updateLecture.mockResolvedValue(mockLecture);

      const result = await controller.updateLecture(1, 1, user, {
        title: 'Updated Lecture',
      });

      expect(lecturesService.updateLecture).toHaveBeenCalledWith(1, 10, 'instructor', {
        title: 'Updated Lecture',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLecture);
    });

    it('should allow admin to update lecture', async () => {
      const mockLecture = { id: 1, title: 'Admin Updated' };
      const user: JwtPayload = { sub: 99, email: 'admin@test.com', role: 'admin' };
      lecturesService.updateLecture.mockResolvedValue(mockLecture);

      const result = await controller.updateLecture(1, 1, user, {
        title: 'Admin Updated',
      });

      expect(lecturesService.updateLecture).toHaveBeenCalledWith(1, 99, 'admin', {
        title: 'Admin Updated',
      });
    });
  });

  describe('reorderLectures', () => {
    it('should call lecturesService.reorderLectures', async () => {
      const mockLectures = [
        { id: 2, title: 'Lecture 2' },
        { id: 1, title: 'Lecture 1' },
      ];
      const user: JwtPayload = { sub: 10, email: 'instructor@test.com', role: 'instructor' };
      lecturesService.reorderLectures.mockResolvedValue(mockLectures);

      const result = await controller.reorderLectures(1, user, {
        lectureIds: [2, 1],
      });

      expect(lecturesService.reorderLectures).toHaveBeenCalledWith(1, 10, 'instructor', [2, 1]);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLectures);
    });
  });

  describe('deleteLecture', () => {
    it('should call lecturesService.deleteLecture', async () => {
      const user: JwtPayload = { sub: 10, email: 'instructor@test.com', role: 'instructor' };
      lecturesService.deleteLecture.mockResolvedValue(undefined);

      const result = await controller.deleteLecture(1, 1, user);

      expect(lecturesService.deleteLecture).toHaveBeenCalledWith(1, 10, 'instructor');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ message: 'Lecture deleted successfully.' });
    });

    it('should allow admin to delete lecture', async () => {
      const user: JwtPayload = { sub: 99, email: 'admin@test.com', role: 'admin' };
      lecturesService.deleteLecture.mockResolvedValue(undefined);

      const result = await controller.deleteLecture(1, 1, user);

      expect(lecturesService.deleteLecture).toHaveBeenCalledWith(1, 99, 'admin');
    });
  });
});
