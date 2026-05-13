import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProgressController } from '../progress.controller';
import { ProgressService } from '../progress.service';

// ─── Test Suite ─────────────────────────────────────────────────────────

describe('ProgressController', () => {
  let controller: ProgressController;
  let progressService: Record<string, jest.Mock>;

  const mockUser = { sub: 100, role: 'student' };

  beforeEach(async () => {
    progressService = {
      updateProgress: jest.fn(),
      getLectureProgress: jest.fn(),
      getCourseProgress: jest.fn(),
      getCourseLectureProgress: jest.fn(),
      getWatchHistory: jest.fn(),
      verifyEnrollment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [{ provide: ProgressService, useValue: progressService }],
    }).compile();

    controller = module.get<ProgressController>(ProgressController);
  });

  // ─── updateProgress ──────────────────────────────────────────────────

  describe('updateProgress', () => {
    const dto = { lectureId: 1, watchedSeconds: 300 };

    it('should update progress when enrolled', async () => {
      progressService.verifyEnrollment.mockResolvedValue(true);
      progressService.updateProgress.mockResolvedValue({
        watchedSeconds: 300,
        isCompleted: false,
        progressPercentage: 50,
      });

      const result = await controller.updateProgress(mockUser, dto);

      expect(progressService.verifyEnrollment).toHaveBeenCalledWith(100, 1);
      expect(progressService.updateProgress).toHaveBeenCalledWith(100, 1, 300);
      expect(result.success).toBe(true);
      expect(result.data.watchedSeconds).toBe(300);
    });

    it('should throw ForbiddenException when not enrolled', async () => {
      progressService.verifyEnrollment.mockResolvedValue(false);

      await expect(
        controller.updateProgress(mockUser, dto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should propagate NotFoundException from service', async () => {
      progressService.verifyEnrollment.mockResolvedValue(true);
      progressService.updateProgress.mockRejectedValue(
        new NotFoundException('Lecture not found'),
      );

      await expect(
        controller.updateProgress(mockUser, dto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getLectureProgress ──────────────────────────────────────────────

  describe('getLectureProgress', () => {
    it('should return lecture progress', async () => {
      const progressData = {
        lectureId: 1,
        watchedSeconds: 300,
        isCompleted: false,
        lastWatchedAt: new Date().toISOString(),
        durationSeconds: 600,
        progressPercentage: 50,
      };
      progressService.getLectureProgress.mockResolvedValue(progressData);

      const result = await controller.getLectureProgress(mockUser, '1');

      expect(progressService.getLectureProgress).toHaveBeenCalledWith(100, 1);
      expect(result.success).toBe(true);
      expect(result.data.watchedSeconds).toBe(300);
    });

    it('should throw NotFoundException if lecture not found', async () => {
      progressService.getLectureProgress.mockResolvedValue(null);

      await expect(
        controller.getLectureProgress(mockUser, '999'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getCourseProgress ───────────────────────────────────────────────

  describe('getCourseProgress', () => {
    it('should return course progress summary', async () => {
      const summary = {
        courseId: 5,
        totalLectures: 10,
        completedLectures: 3,
        watchedSeconds: 900,
        totalDurationSeconds: 6000,
        progressPercentage: 30,
      };
      progressService.getCourseProgress.mockResolvedValue(summary);

      const result = await controller.getCourseProgress(mockUser, '5');

      expect(progressService.getCourseProgress).toHaveBeenCalledWith(100, 5);
      expect(result.success).toBe(true);
      expect(result.data.completedLectures).toBe(3);
    });

    it('should throw NotFoundException if course has no data', async () => {
      progressService.getCourseProgress.mockResolvedValue(null);

      await expect(
        controller.getCourseProgress(mockUser, '999'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getCourseLectureProgress ────────────────────────────────────────

  describe('getCourseLectureProgress', () => {
    it('should return per-lecture progress', async () => {
      const data = [
        { lectureId: 1, watchedSeconds: 300, isCompleted: false, progressPercentage: 50 },
        { lectureId: 2, watchedSeconds: 600, isCompleted: true, progressPercentage: 100 },
      ];
      progressService.getCourseLectureProgress.mockResolvedValue(data);

      const result = await controller.getCourseLectureProgress(mockUser, '5');

      expect(progressService.getCourseLectureProgress).toHaveBeenCalledWith(100, 5);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  // ─── getWatchHistory ─────────────────────────────────────────────────

  describe('getWatchHistory', () => {
    it('should return watch history with default pagination', async () => {
      const historyData = {
        items: [],
        total: 0,
        limit: 20,
        offset: 0,
      };
      progressService.getWatchHistory.mockResolvedValue(historyData);

      const result = await controller.getWatchHistory(mockUser);

      expect(progressService.getWatchHistory).toHaveBeenCalledWith(100, {
        limit: 20,
        offset: 0,
      });
      expect(result.success).toBe(true);
    });

    it('should accept custom pagination', async () => {
      const historyData = {
        items: [],
        total: 50,
        limit: 10,
        offset: 20,
      };
      progressService.getWatchHistory.mockResolvedValue(historyData);

      const result = await controller.getWatchHistory(mockUser, '10', '20');

      expect(progressService.getWatchHistory).toHaveBeenCalledWith(100, {
        limit: 10,
        offset: 20,
      });
      expect(result.data.total).toBe(50);
    });
  });
});
