import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from '../progress.service';
import { ProgressRepository } from '../../../db/repositories/progress.repository';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../../db/repositories/sections.repository';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import { CoursesRepository } from '../../../db/repositories/courses.repository';

// ─── Inline Test Factories ─────────────────────────────────────────────

function createLecture(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    sectionId: 10,
    title: 'Test Lecture',
    description: 'A test lecture',
    orderIndex: 0,
    type: 'video',
    muxAssetId: null,
    muxPlaybackId: null,
    durationSeconds: 600,
    isFreePreview: false,
    isPublished: true,
    createdAt: new Date(),
    ...overrides,
  };
}

function createProgress(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    studentId: 100,
    lectureId: 1,
    watchedSeconds: 300,
    isCompleted: false,
    lastWatchedAt: new Date(),
    ...overrides,
  };
}

function createSection(overrides: Record<string, any> = {}) {
  return {
    id: 10,
    courseId: 5,
    title: 'Test Section',
    orderIndex: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

function createCourse(overrides: Record<string, any> = {}) {
  return {
    id: 5,
    instructorId: 1,
    title: 'Test Course',
    description: 'A test course',
    thumbnailUrl: null,
    domain: 'Programming',
    pricingType: 'free',
    priceInr: 0,
    isPublished: true,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Mock Factories ─────────────────────────────────────────────────────

function createMockProgressRepo(overrides: Partial<Record<string, jest.Mock>> = {}): Record<string, jest.Mock> {
  return {
    findById: jest.fn().mockResolvedValue(null),
    findByStudentAndLecture: jest.fn().mockResolvedValue(null),
    findByStudent: jest.fn().mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 }),
    findByStudentAndCourse: jest.fn().mockResolvedValue([]),
    upsert: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    getCourseLectureIds: jest.fn().mockResolvedValue([]),
    getCourseProgressSummary: jest.fn().mockResolvedValue(null),
    getRecentWatchHistory: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function createMockLecturesRepo(overrides: Partial<Record<string, jest.Mock>> = {}): Record<string, jest.Mock> {
  return {
    findById: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

function createMockSectionsRepo(overrides: Partial<Record<string, jest.Mock>> = {}): Record<string, jest.Mock> {
  return {
    findById: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

function createMockEnrollmentsRepo(overrides: Partial<Record<string, jest.Mock>> = {}): Record<string, jest.Mock> {
  return {
    checkEnrollmentExists: jest.fn().mockResolvedValue(false),
    ...overrides,
  };
}

function createMockCoursesRepo(overrides: Partial<Record<string, jest.Mock>> = {}): Record<string, jest.Mock> {
  return {
    findById: jest.fn().mockResolvedValue(null),
    ...overrides,
  };
}

// ─── Test Suite ─────────────────────────────────────────────────────────

describe('ProgressService', () => {
  let service: ProgressService;
  let progressRepo: Record<string, jest.Mock>;
  let lecturesRepo: Record<string, jest.Mock>;
  let sectionsRepo: Record<string, jest.Mock>;
  let enrollmentsRepo: Record<string, jest.Mock>;
  let coursesRepo: Record<string, jest.Mock>;

  beforeEach(async () => {
    progressRepo = createMockProgressRepo();
    lecturesRepo = createMockLecturesRepo();
    sectionsRepo = createMockSectionsRepo();
    enrollmentsRepo = createMockEnrollmentsRepo();
    coursesRepo = createMockCoursesRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: ProgressRepository, useValue: progressRepo },
        { provide: LecturesRepository, useValue: lecturesRepo },
        { provide: SectionsRepository, useValue: sectionsRepo },
        { provide: EnrollmentsRepository, useValue: enrollmentsRepo },
        { provide: CoursesRepository, useValue: coursesRepo },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  // ─── checkCompletion ──────────────────────────────────────────────────

  describe('checkCompletion', () => {
    it('should mark as completed when watched >= 95% of duration', () => {
      const result = service.checkCompletion(570, 600); // 95%
      expect(result.isCompleted).toBe(true);
      expect(result.percentage).toBe(95);
      expect(result.watchedSeconds).toBe(570);
      expect(result.durationSeconds).toBe(600);
    });

    it('should mark as completed when watched > 95% of duration', () => {
      const result = service.checkCompletion(590, 600); // 98.3%
      expect(result.isCompleted).toBe(true);
      expect(result.percentage).toBe(98);
    });

    it('should NOT mark as completed when watched < 95% of duration', () => {
      const result = service.checkCompletion(569, 600); // 94.8%
      expect(result.isCompleted).toBe(false);
      expect(result.percentage).toBe(95); // rounded up
    });

    it('should handle zero duration', () => {
      const result = service.checkCompletion(100, 0);
      expect(result.isCompleted).toBe(false);
      expect(result.percentage).toBe(0);
    });

    it('should cap percentage at 100', () => {
      const result = service.checkCompletion(650, 600); // > 100%
      expect(result.percentage).toBe(100);
    });

    it('should handle exact 100% watch', () => {
      const result = service.checkCompletion(600, 600);
      expect(result.isCompleted).toBe(true);
      expect(result.percentage).toBe(100);
    });
  });

  // ─── updateProgress ──────────────────────────────────────────────────

  describe('updateProgress', () => {
    it('should throw if lecture not found', async () => {
      lecturesRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateProgress(100, 999, 300),
      ).rejects.toThrow('Lecture not found');
    });

    it('should upsert progress and return result', async () => {
      const lecture = createLecture();
      const progressRecord = createProgress({ watchedSeconds: 300, isCompleted: false });

      lecturesRepo.findById.mockResolvedValue(lecture);
      progressRepo.upsert.mockResolvedValue(progressRecord);

      const result = await service.updateProgress(100, 1, 300);

      expect(progressRepo.upsert).toHaveBeenCalledWith(100, 1, 300, false);
      expect(result.watchedSeconds).toBe(300);
      expect(result.isCompleted).toBe(false);
      expect(result.progressPercentage).toBe(50); // 300/600 * 100
    });

    it('should detect completion when threshold met', async () => {
      const lecture = createLecture({ durationSeconds: 600 });
      const progressRecord = createProgress({ watchedSeconds: 570, isCompleted: true });

      lecturesRepo.findById.mockResolvedValue(lecture);
      progressRepo.upsert.mockResolvedValue(progressRecord);

      const result = await service.updateProgress(100, 1, 570);

      expect(progressRepo.upsert).toHaveBeenCalledWith(100, 1, 570, true);
      expect(result.isCompleted).toBe(true);
    });
  });

  // ─── getLectureProgress ──────────────────────────────────────────────

  describe('getLectureProgress', () => {
    it('should return null if lecture not found', async () => {
      lecturesRepo.findById.mockResolvedValue(null);

      const result = await service.getLectureProgress(100, 999);
      expect(result).toBeNull();
    });

    it('should return default progress if no record exists', async () => {
      lecturesRepo.findById.mockResolvedValue(createLecture());
      progressRepo.findByStudentAndLecture.mockResolvedValue(null);

      const result = await service.getLectureProgress(100, 1);

      expect(result).toEqual({
        lectureId: 1,
        watchedSeconds: 0,
        isCompleted: false,
        durationSeconds: 600,
        progressPercentage: 0,
        lastWatchedAt: expect.any(String),
      });
    });

    it('should return progress with percentage', async () => {
      const lecture = createLecture({ durationSeconds: 600 });
      const progressRecord = createProgress({ watchedSeconds: 300, isCompleted: false });

      lecturesRepo.findById.mockResolvedValue(lecture);
      progressRepo.findByStudentAndLecture.mockResolvedValue(progressRecord);

      const result = await service.getLectureProgress(100, 1);

      expect(result?.watchedSeconds).toBe(300);
      expect(result?.progressPercentage).toBe(50);
      expect(result?.isCompleted).toBe(false);
    });
  });

  // ─── getCourseProgress ───────────────────────────────────────────────

  describe('getCourseProgress', () => {
    it('should delegate to repository', async () => {
      const summary = {
        courseId: 5,
        totalLectures: 10,
        completedLectures: 3,
        watchedSeconds: 900,
        totalDurationSeconds: 6000,
        progressPercentage: 30,
      };
      progressRepo.getCourseProgressSummary.mockResolvedValue(summary);

      const result = await service.getCourseProgress(100, 5);

      expect(progressRepo.getCourseProgressSummary).toHaveBeenCalledWith(100, 5);
      expect(result).toEqual(summary);
    });
  });

  // ─── getCourseLectureProgress ────────────────────────────────────────

  describe('getCourseLectureProgress', () => {
    it('should return empty array when no progress', async () => {
      progressRepo.findByStudentAndCourse.mockResolvedValue([]);

      const result = await service.getCourseLectureProgress(100, 5);

      expect(result).toEqual([]);
    });

    it('should map progress records with percentages', async () => {
      const progressRecords = [
        createProgress({ lectureId: 1, watchedSeconds: 300, isCompleted: false }),
        createProgress({ lectureId: 2, watchedSeconds: 600, isCompleted: true, id: 2 }),
      ];
      progressRepo.findByStudentAndCourse.mockResolvedValue(progressRecords);
      lecturesRepo.findById.mockImplementation((id: number) => {
        if (id === 1) return Promise.resolve(createLecture({ id: 1, durationSeconds: 600 }));
        if (id === 2) return Promise.resolve(createLecture({ id: 2, durationSeconds: 600 }));
        return Promise.resolve(null);
      });

      const result = await service.getCourseLectureProgress(100, 5);

      expect(result).toHaveLength(2);
      expect(result[0].progressPercentage).toBe(50);
      expect(result[1].progressPercentage).toBe(100);
      expect(result[1].isCompleted).toBe(true);
    });
  });

  // ─── getWatchHistory ─────────────────────────────────────────────────

  describe('getWatchHistory', () => {
    it('should return empty history', async () => {
      progressRepo.getRecentWatchHistory.mockResolvedValue([]);
      progressRepo.count.mockResolvedValue(0);

      const result = await service.getWatchHistory(100);

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should enrich history items with course titles', async () => {
      const historyItems = [
        {
          id: 1,
          studentId: 100,
          lectureId: 1,
          watchedSeconds: 300,
          isCompleted: false,
          lastWatchedAt: new Date(),
          lectureTitle: 'Intro',
          lectureDuration: 600,
          sectionTitle: 'Section 1',
          courseId: 5,
          courseTitle: '',
        },
      ];
      progressRepo.getRecentWatchHistory.mockResolvedValue(historyItems);
      progressRepo.count.mockResolvedValue(1);
      coursesRepo.findById.mockResolvedValue(createCourse({ title: 'Test Course' }));

      const result = await service.getWatchHistory(100);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].courseTitle).toBe('Test Course');
      expect(result.items[0].progressPercentage).toBe(50);
      expect(result.total).toBe(1);
    });

    it('should use default pagination', async () => {
      progressRepo.getRecentWatchHistory.mockResolvedValue([]);
      progressRepo.count.mockResolvedValue(0);

      await service.getWatchHistory(100);

      expect(progressRepo.getRecentWatchHistory).toHaveBeenCalledWith(
        100,
        { offset: 0, limit: 20 },
      );
    });

    it('should use custom pagination', async () => {
      progressRepo.getRecentWatchHistory.mockResolvedValue([]);
      progressRepo.count.mockResolvedValue(0);

      await service.getWatchHistory(100, { offset: 20, limit: 10 });

      expect(progressRepo.getRecentWatchHistory).toHaveBeenCalledWith(
        100,
        { offset: 20, limit: 10 },
      );
    });
  });

  // ─── verifyEnrollment ────────────────────────────────────────────────

  describe('verifyEnrollment', () => {
    it('should return false if lecture not found', async () => {
      lecturesRepo.findById.mockResolvedValue(null);

      const result = await service.verifyEnrollment(100, 999);
      expect(result).toBe(false);
    });

    it('should return true for free preview lectures', async () => {
      lecturesRepo.findById.mockResolvedValue(
        createLecture({ isFreePreview: true }),
      );

      const result = await service.verifyEnrollment(100, 1);
      expect(result).toBe(true);
    });

    it('should return false if section not found', async () => {
      lecturesRepo.findById.mockResolvedValue(createLecture());
      sectionsRepo.findById.mockResolvedValue(null);

      const result = await service.verifyEnrollment(100, 1);
      expect(result).toBe(false);
    });

    it('should check enrollment via repository', async () => {
      lecturesRepo.findById.mockResolvedValue(createLecture());
      sectionsRepo.findById.mockResolvedValue(createSection());
      enrollmentsRepo.checkEnrollmentExists.mockResolvedValue(true);

      const result = await service.verifyEnrollment(100, 1);

      expect(enrollmentsRepo.checkEnrollmentExists).toHaveBeenCalledWith(100, 5);
      expect(result).toBe(true);
    });

    it('should return false when not enrolled', async () => {
      lecturesRepo.findById.mockResolvedValue(createLecture());
      sectionsRepo.findById.mockResolvedValue(createSection());
      enrollmentsRepo.checkEnrollmentExists.mockResolvedValue(false);

      const result = await service.verifyEnrollment(100, 1);
      expect(result).toBe(false);
    });
  });
});
