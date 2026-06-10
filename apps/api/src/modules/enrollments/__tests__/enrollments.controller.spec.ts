import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentsController } from '../controllers/enrollments.controller';
import { EnrollmentsService } from '../services/enrollments.service';

describe('EnrollmentsController', () => {
  let controller: EnrollmentsController;
  let enrollmentsService: jest.Mocked<EnrollmentsService>;

  const mockEnrollments = [
    { id: 1, studentId: 1, courseId: 1, accessType: 'free' },
    { id: 2, studentId: 1, courseId: 2, accessType: 'purchased' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnrollmentsController],
      providers: [
        {
          provide: EnrollmentsService,
          useValue: {
            getMyEnrollments: jest.fn(),
            getEnrollmentCount: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EnrollmentsController>(EnrollmentsController);
    enrollmentsService = module.get(EnrollmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyEnrollments', () => {
    it('should return success with enrollments data', async () => {
      enrollmentsService.getMyEnrollments.mockResolvedValue(mockEnrollments as any);

      const result = await controller.getMyEnrollments({ sub: 1 });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(enrollmentsService.getMyEnrollments).toHaveBeenCalledWith(1);
    });

    it('should return empty array for user with no enrollments', async () => {
      enrollmentsService.getMyEnrollments.mockResolvedValue([]);

      const result = await controller.getMyEnrollments({ sub: 99 });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('getMyEnrollmentCount', () => {
    it('should return count of user enrollments', async () => {
      enrollmentsService.getEnrollmentCount.mockResolvedValue(5);

      const result = await controller.getMyEnrollmentCount({ sub: 1 });
      expect(result.success).toBe(true);
      expect(result.data.count).toBe(5);
    });
  });
});
