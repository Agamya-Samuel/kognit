import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CertificatesService } from '../certificates.service';
import { CertificatesRepository } from '../../../db/repositories/certificates.repository';
import { ProgressRepository } from '../../../db/repositories/progress.repository';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import { UsersRepository } from '../../../db/repositories/users.repository';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import type { Certificate } from '../../../db/schema';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createMockCertificate(overrides: Partial<Certificate> = {}): Certificate {
  return {
    id: 1,
    studentId: 10,
    courseId: 20,
    certificateUid: 'CERT-abc-123',
    issuedAt: new Date('2026-05-16T00:00:00Z'),
    pdfUrl: null,
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CertificatesService', () => {
  let service: CertificatesService;
  let certificatesRepo: jest.Mocked<CertificatesRepository>;
  let progressRepo: jest.Mocked<ProgressRepository>;
  let enrollmentsRepo: jest.Mocked<EnrollmentsRepository>;
  let usersRepo: jest.Mocked<UsersRepository>;
  let coursesRepo: jest.Mocked<CoursesRepository>;

  beforeEach(async () => {
    const mockCertificatesRepo = {
      findById: jest.fn(),
      findByUid: jest.fn(),
      findByStudentAndCourse: jest.fn(),
      findByStudent: jest.fn(),
      create: jest.fn(),
      createIfNotExists: jest.fn(),
      findMany: jest.fn(),
    };

    const mockProgressRepo = {
      getCourseProgressSummary: jest.fn(),
    };

    const mockEnrollmentsRepo = {
      findByStudentAndCourse: jest.fn(),
    };

    const mockUsersRepo = {
      findById: jest.fn(),
    };

    const mockCoursesRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificatesService,
        { provide: CertificatesRepository, useValue: mockCertificatesRepo },
        { provide: ProgressRepository, useValue: mockProgressRepo },
        { provide: EnrollmentsRepository, useValue: mockEnrollmentsRepo },
        { provide: UsersRepository, useValue: mockUsersRepo },
        { provide: CoursesRepository, useValue: mockCoursesRepo },
      ],
    }).compile();

    service = module.get<CertificatesService>(CertificatesService);
    certificatesRepo = module.get(CertificatesRepository);
    progressRepo = module.get(ProgressRepository);
    enrollmentsRepo = module.get(EnrollmentsRepository);
    usersRepo = module.get(UsersRepository);
    coursesRepo = module.get(CoursesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCertificateUid', () => {
    it('should generate a UID with CERT- prefix', () => {
      const uid = service.generateCertificateUid();
      expect(uid).toMatch(/^CERT-/);
    });

    it('should generate unique UIDs', () => {
      const uid1 = service.generateCertificateUid();
      const uid2 = service.generateCertificateUid();
      expect(uid1).not.toBe(uid2);
    });
  });

  describe('autoIssueCertificate', () => {
    it('should throw if student not enrolled', async () => {
      enrollmentsRepo.findByStudentAndCourse.mockResolvedValue(null as any);

      await expect(service.autoIssueCertificate(1, 2)).rejects.toThrow(BadRequestException);
    });

    it('should return existing certificate if already issued', async () => {
      const existing = createMockCertificate();
      enrollmentsRepo.findByStudentAndCourse.mockResolvedValue({ id: 1 } as any);
      progressRepo.getCourseProgressSummary.mockResolvedValue({
        courseId: 20,
        totalLectures: 10,
        completedLectures: 10,
        progressPercentage: 100,
      });
      // createIfNotExists returns the existing row (because ON CONFLICT was hit
      // in production; here we just mock that the repo returned the existing cert).
      certificatesRepo.createIfNotExists.mockResolvedValue(existing);

      const result = await service.autoIssueCertificate(10, 20);
      expect(result).toEqual(existing);
      expect(certificatesRepo.createIfNotExists).toHaveBeenCalled();
    });

    it('should return null if course not 100% complete', async () => {
      enrollmentsRepo.findByStudentAndCourse.mockResolvedValue({ id: 1 } as any);
      progressRepo.getCourseProgressSummary.mockResolvedValue({
        courseId: 20,
        totalLectures: 10,
        completedLectures: 8,
        progressPercentage: 80,
      });

      const result = await service.autoIssueCertificate(10, 20);
      expect(result).toBeNull();
      expect(certificatesRepo.createIfNotExists).not.toHaveBeenCalled();
    });

    it('should issue certificate when 100% complete', async () => {
      const newCert = createMockCertificate();
      enrollmentsRepo.findByStudentAndCourse.mockResolvedValue({ id: 1 } as any);
      progressRepo.getCourseProgressSummary.mockResolvedValue({
        courseId: 20,
        totalLectures: 10,
        completedLectures: 10,
        progressPercentage: 100,
      });
      certificatesRepo.createIfNotExists.mockResolvedValue(newCert);

      const result = await service.autoIssueCertificate(10, 20);
      expect(result).toEqual(newCert);
      expect(certificatesRepo.createIfNotExists).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: 10,
          courseId: 20,
          pdfUrl: null,
        }),
      );
    });
  });

  describe('verifyCertificate', () => {
    it('should return valid=true for existing certificate', async () => {
      const cert = createMockCertificate();
      certificatesRepo.findByUid.mockResolvedValue(cert);
      usersRepo.findById.mockResolvedValue({ id: 10, name: 'John' } as any);
      coursesRepo.findById.mockResolvedValue({ id: 20, title: 'Math 101', instructorId: 5 } as any);
      usersRepo.findById
        .mockResolvedValueOnce({ id: 10, name: 'John' } as any)
        .mockResolvedValueOnce({ id: 5, name: 'Prof Smith' } as any);

      const result = await service.verifyCertificate('CERT-abc-123');
      expect(result.valid).toBe(true);
      expect(result.certificate).toBeDefined();
      expect(result.certificate!.studentName).toBe('John');
    });

    it('should return valid=false for non-existent certificate', async () => {
      certificatesRepo.findByUid.mockResolvedValue(null);

      const result = await service.verifyCertificate('CERT-nonexistent');
      expect(result.valid).toBe(false);
      expect(result.certificate).toBeNull();
    });
  });

  describe('getCertificateByUid', () => {
    it('should throw NotFoundException for missing certificate', async () => {
      certificatesRepo.findByUid.mockResolvedValue(null);

      await expect(service.getCertificateByUid('CERT-xxx')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listStudentCertificates', () => {
    it('should delegate to repository', async () => {
      const mockResult = { data: [createMockCertificate()], total: 1, limit: 10, offset: 0 };
      certificatesRepo.findByStudent.mockResolvedValue(mockResult as any);

      const result = await service.listStudentCertificates(10, { limit: 10 });
      expect(result).toEqual(mockResult);
    });
  });
});
