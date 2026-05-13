import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AssignmentService } from '../services/assignment.service';
import { AssignmentsRepository } from '../../../db/repositories/assignments.repository';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../../db/repositories/sections.repository';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import type { Assignment } from '../../../db/schema';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockAssignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: 1,
    lectureId: 10,
    title: 'Week 1 Quiz',
    description: 'Answer all questions',
    type: 'mcq',
    maxScore: 100,
    dueAt: new Date('2026-12-31T23:59:59Z'),
    lateWindowHours: 24,
    latePenaltyPercent: 20,
    createdAt: new Date(),
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AssignmentService', () => {
  let service: AssignmentService;
  let assignmentsRepo: jest.Mocked<AssignmentsRepository>;
  let lecturesRepo: jest.Mocked<LecturesRepository>;
  let sectionsRepo: jest.Mocked<SectionsRepository>;
  let coursesRepo: jest.Mocked<CoursesRepository>;

  beforeEach(async () => {
    const mockAssignmentsRepo = {
      findById: jest.fn(),
      findByLectureId: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockLecturesRepo = {
      findById: jest.fn(),
    };

    const mockSectionsRepo = {
      findById: jest.fn(),
    };

    const mockCoursesRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
        { provide: AssignmentsRepository, useValue: mockAssignmentsRepo },
        { provide: LecturesRepository, useValue: mockLecturesRepo },
        { provide: SectionsRepository, useValue: mockSectionsRepo },
        { provide: CoursesRepository, useValue: mockCoursesRepo },
      ],
    }).compile();

    service = module.get<AssignmentService>(AssignmentService);
    assignmentsRepo = module.get(AssignmentsRepository);
    lecturesRepo = module.get(LecturesRepository);
    sectionsRepo = module.get(SectionsRepository);
    coursesRepo = module.get(CoursesRepository);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── createAssignment ──────────────────────────────────────────────────

  describe('createAssignment', () => {
    const instructorUser = { sub: 1, role: 'instructor' };
    const validData = {
      lectureId: 10,
      title: 'Test Quiz',
      type: 'mcq' as const,
      maxScore: 100,
      dueAt: '2026-12-31T23:59:59Z',
    };

    it('should create an assignment successfully', async () => {
      lecturesRepo.findById.mockResolvedValue({ id: 10, sectionId: 5 } as any);
      sectionsRepo.findById.mockResolvedValue({ id: 5, courseId: 3 } as any);
      coursesRepo.findById.mockResolvedValue({ id: 3, instructorId: 1 } as any);
      assignmentsRepo.create.mockResolvedValue(createMockAssignment());

      const result = await service.createAssignment(1, 'instructor', validData);
      expect(result).toBeDefined();
      expect(assignmentsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          lectureId: 10,
          title: 'Test Quiz',
          type: 'mcq',
          maxScore: 100,
        }),
      );
    });

    it('should throw ForbiddenException for students', async () => {
      await expect(
        service.createAssignment(1, 'student', validData),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if lecture not found', async () => {
      lecturesRepo.findById.mockResolvedValue(null);

      await expect(
        service.createAssignment(1, 'instructor', validData),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if instructor does not own course', async () => {
      lecturesRepo.findById.mockResolvedValue({ id: 10, sectionId: 5 } as any);
      sectionsRepo.findById.mockResolvedValue({ id: 5, courseId: 3 } as any);
      coursesRepo.findById.mockResolvedValue({ id: 3, instructorId: 999 } as any);

      await expect(
        service.createAssignment(1, 'instructor', validData),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to create assignment for any course', async () => {
      lecturesRepo.findById.mockResolvedValue({ id: 10, sectionId: 5 } as any);
      sectionsRepo.findById.mockResolvedValue({ id: 5, courseId: 3 } as any);
      coursesRepo.findById.mockResolvedValue({ id: 3, instructorId: 999 } as any);
      assignmentsRepo.create.mockResolvedValue(createMockAssignment());

      const result = await service.createAssignment(1, 'admin', validData);
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException for invalid due date', async () => {
      lecturesRepo.findById.mockResolvedValue({ id: 10, sectionId: 5 } as any);
      sectionsRepo.findById.mockResolvedValue({ id: 5, courseId: 3 } as any);
      coursesRepo.findById.mockResolvedValue({ id: 3, instructorId: 1 } as any);

      await expect(
        service.createAssignment(1, 'instructor', { ...validData, dueAt: 'invalid-date' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for negative lateWindowHours', async () => {
      lecturesRepo.findById.mockResolvedValue({ id: 10, sectionId: 5 } as any);
      sectionsRepo.findById.mockResolvedValue({ id: 5, courseId: 3 } as any);
      coursesRepo.findById.mockResolvedValue({ id: 3, instructorId: 1 } as any);

      await expect(
        service.createAssignment(1, 'instructor', { ...validData, lateWindowHours: -5 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── getAssignmentById ─────────────────────────────────────────────────

  describe('getAssignmentById', () => {
    it('should return assignment when found', async () => {
      const assignment = createMockAssignment();
      assignmentsRepo.findById.mockResolvedValue(assignment);

      const result = await service.getAssignmentById(1);
      expect(result).toEqual(assignment);
    });

    it('should throw NotFoundException when not found', async () => {
      assignmentsRepo.findById.mockResolvedValue(null);

      await expect(service.getAssignmentById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── listAssignments ───────────────────────────────────────────────────

  describe('listAssignments', () => {
    it('should return paginated assignments', async () => {
      const assignments = [createMockAssignment(), createMockAssignment({ id: 2 })];
      assignmentsRepo.findMany.mockResolvedValue({ data: assignments, total: 2, limit: 20, offset: 0 });

      const result = await service.listAssignments({ page: 1, limit: 20 });
      expect(result.assignments).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });

    it('should filter by lectureId', async () => {
      assignmentsRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 20, offset: 0 });

      await service.listAssignments({ lectureId: 10 });
      expect(assignmentsRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ lectureId: 10 }),
      );
    });

    it('should filter by type', async () => {
      assignmentsRepo.findMany.mockResolvedValue({ data: [], total: 0, limit: 20, offset: 0 });

      await service.listAssignments({ type: 'mcq' });
      expect(assignmentsRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'mcq' }),
      );
    });
  });

  // ─── updateAssignment ──────────────────────────────────────────────────

  describe('updateAssignment', () => {
    it('should update assignment successfully', async () => {
      const assignment = createMockAssignment();
      assignmentsRepo.findById.mockResolvedValue(assignment);
      lecturesRepo.findById.mockResolvedValue({ id: 10, sectionId: 5 } as any);
      sectionsRepo.findById.mockResolvedValue({ id: 5, courseId: 3 } as any);
      coursesRepo.findById.mockResolvedValue({ id: 3, instructorId: 1 } as any);
      assignmentsRepo.update.mockResolvedValue({ ...assignment, title: 'Updated' });

      const result = await service.updateAssignment(1, 1, 'instructor', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should throw NotFoundException if assignment not found', async () => {
      assignmentsRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateAssignment(999, 1, 'instructor', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-instructor/admin', async () => {
      await expect(
        service.updateAssignment(1, 1, 'student', { title: 'Updated' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── deleteAssignment ──────────────────────────────────────────────────

  describe('deleteAssignment', () => {
    it('should delete assignment successfully', async () => {
      const assignment = createMockAssignment();
      assignmentsRepo.findById.mockResolvedValue(assignment);
      lecturesRepo.findById.mockResolvedValue({ id: 10, sectionId: 5 } as any);
      sectionsRepo.findById.mockResolvedValue({ id: 5, courseId: 3 } as any);
      coursesRepo.findById.mockResolvedValue({ id: 3, instructorId: 1 } as any);
      assignmentsRepo.delete.mockResolvedValue(true);

      await service.deleteAssignment(1, 1, 'instructor');
      expect(assignmentsRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if assignment not found', async () => {
      assignmentsRepo.findById.mockResolvedValue(null);

      await expect(service.deleteAssignment(999, 1, 'instructor')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── evaluateLateSubmission ────────────────────────────────────────────

  describe('evaluateLateSubmission', () => {
    it('should return on-time for submission before due date', () => {
      const assignment = createMockAssignment({ dueAt: new Date('2026-12-31T23:59:59Z') });
      const result = service.evaluateLateSubmission(assignment, new Date('2026-12-30T12:00:00Z'));

      expect(result.isLate).toBe(false);
      expect(result.isAccepted).toBe(true);
      expect(result.penaltyPercent).toBe(0);
    });

    it('should return on-time for submission exactly at due date', () => {
      const dueDate = new Date('2026-12-31T23:59:59Z');
      const assignment = createMockAssignment({ dueAt: dueDate });
      const result = service.evaluateLateSubmission(assignment, new Date(dueDate));

      expect(result.isLate).toBe(false);
      expect(result.isAccepted).toBe(true);
    });

    it('should return late but accepted within window', () => {
      const assignment = createMockAssignment({
        dueAt: new Date('2026-12-31T23:59:59Z'),
        lateWindowHours: 24,
        latePenaltyPercent: 20,
      });
      // Submit 12 hours late
      const result = service.evaluateLateSubmission(
        assignment,
        new Date('2027-01-01T11:59:59Z'),
      );

      expect(result.isLate).toBe(true);
      expect(result.isWithinWindow).toBe(true);
      expect(result.isAccepted).toBe(true);
      expect(result.penaltyPercent).toBe(20);
    });

    it('should return late and NOT accepted past window', () => {
      const assignment = createMockAssignment({
        dueAt: new Date('2026-12-31T23:59:59Z'),
        lateWindowHours: 24,
        latePenaltyPercent: 20,
      });
      // Submit 48 hours late
      const result = service.evaluateLateSubmission(
        assignment,
        new Date('2027-01-02T23:59:59Z'),
      );

      expect(result.isLate).toBe(true);
      expect(result.isWithinWindow).toBe(false);
      expect(result.isAccepted).toBe(false);
    });

    it('should return late NOT accepted when no late window configured', () => {
      const assignment = createMockAssignment({
        dueAt: new Date('2026-12-31T23:59:59Z'),
        lateWindowHours: null,
        latePenaltyPercent: 0,
      });
      const result = service.evaluateLateSubmission(
        assignment,
        new Date('2027-01-01T00:00:01Z'),
      );

      expect(result.isLate).toBe(true);
      expect(result.isAccepted).toBe(false);
    });
  });

  // ─── calculatePenalizedScore ───────────────────────────────────────────

  describe('calculatePenalizedScore', () => {
    it('should return raw score when no penalty', () => {
      expect(service.calculatePenalizedScore(80, 0)).toBe(80);
    });

    it('should apply 20% penalty', () => {
      expect(service.calculatePenalizedScore(100, 20)).toBe(80);
    });

    it('should apply 50% penalty', () => {
      expect(service.calculatePenalizedScore(80, 50)).toBe(40);
    });

    it('should not return negative score', () => {
      expect(service.calculatePenalizedScore(10, 100)).toBe(0);
    });
  });

  // ─── bulkCreateAssignments ─────────────────────────────────────────────

  describe('bulkCreateAssignments', () => {
    it('should create multiple assignments and report partial failures', async () => {
      const items = [
        {
          lectureId: 10,
          title: 'Quiz 1',
          type: 'mcq' as const,
          maxScore: 100,
          dueAt: '2026-12-31T23:59:59Z',
        },
        {
          lectureId: 999, // Non-existent
          title: 'Quiz 2',
          type: 'mcq' as const,
          maxScore: 100,
          dueAt: '2026-12-31T23:59:59Z',
        },
      ];

      // First call succeeds - set up all repos (called multiple times by createAssignment)
      lecturesRepo.findById.mockImplementation((id: number) => {
        return id === 10 ? Promise.resolve({ id: 10, sectionId: 5 } as any) : Promise.resolve(null);
      });
      sectionsRepo.findById.mockResolvedValue({ id: 5, courseId: 3 } as any);
      coursesRepo.findById.mockResolvedValue({ id: 3, instructorId: 1 } as any);
      assignmentsRepo.create.mockResolvedValue(createMockAssignment());

      const result = await service.bulkCreateAssignments(1, 'instructor', items);

      expect(result.created).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].index).toBe(1);
    });
  });
});
