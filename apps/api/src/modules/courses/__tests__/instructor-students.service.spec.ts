import { Test, TestingModule } from '@nestjs/testing';
import { InstructorStudentsService } from '../services/instructor-students.service';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import { ProgressRepository } from '../../../db/repositories/progress.repository';

describe('InstructorStudentsService', () => {
  let service: InstructorStudentsService;
  let coursesRepo: jest.Mocked<CoursesRepository>;
  let enrollmentsRepo: jest.Mocked<EnrollmentsRepository>;
  let progressRepo: jest.Mocked<ProgressRepository>;

  const mockCourses = [
    { id: 1, instructorId: 10, title: 'React 101' },
    { id: 2, instructorId: 10, title: 'Node.js' },
  ];

  const mockEnrollments = [
    {
      studentId: 1,
      studentName: 'Alice',
      studentEmail: 'alice@test.com',
      courseId: 1,
      courseTitle: 'React 101',
      enrolledAt: new Date('2024-01-15'),
    },
    {
      studentId: 2,
      studentName: 'Bob',
      studentEmail: 'bob@test.com',
      courseId: 2,
      courseTitle: 'Node.js',
      enrolledAt: new Date('2024-02-20'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstructorStudentsService,
        {
          provide: CoursesRepository,
          useValue: {
            findMany: jest.fn().mockResolvedValue({ data: mockCourses, total: 2 }),
          },
        },
        {
          provide: EnrollmentsRepository,
          useValue: {
            findByCoursesWithDetails: jest.fn().mockResolvedValue(mockEnrollments),
          },
        },
        {
          provide: ProgressRepository,
          useValue: {
            getCourseProgressSummary: jest.fn().mockResolvedValue({ progressPercentage: 50 }),
          },
        },
      ],
    }).compile();

    service = module.get<InstructorStudentsService>(InstructorStudentsService);
    coursesRepo = module.get(CoursesRepository);
    enrollmentsRepo = module.get(EnrollmentsRepository);
    progressRepo = module.get(ProgressRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all students for instructor courses', async () => {
    const result = await service.getStudents(10, {});
    expect(result.students).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('should filter by courseId when provided', async () => {
    const result = await service.getStudents(10, { courseId: '1' });
    expect(result.students).toHaveLength(2);
  });

  it('should filter by search term (student name)', async () => {
    const result = await service.getStudents(10, { search: 'alice' });
    expect(result.students).toHaveLength(1);
    expect(result.students[0].name).toBe('Alice');
  });

  it('should filter by search term (email)', async () => {
    const result = await service.getStudents(10, { search: 'bob@' });
    expect(result.students).toHaveLength(1);
    expect(result.students[0].email).toBe('bob@test.com');
  });

  it('should include progress percentage from progress repo', async () => {
    const result = await service.getStudents(10, {});
    expect(result.students[0].progressPercentage).toBe(50);
  });

  it('should default progress to 0 when no progress record', async () => {
    progressRepo.getCourseProgressSummary.mockResolvedValue(null);
    const result = await service.getStudents(10, {});
    expect(result.students[0].progressPercentage).toBe(0);
  });

  it('should convert enrolledAt Date to ISO string', async () => {
    const result = await service.getStudents(10, {});
    expect(result.students[0].enrolledAt).toBe('2024-01-15T00:00:00.000Z');
  });
});
