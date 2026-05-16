import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { CertificatesRepository } from '../../db/repositories/certificates.repository';
import { ProgressRepository } from '../../db/repositories/progress.repository';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import { UsersRepository } from '../../db/repositories/users.repository';
import { CoursesRepository } from '../../db/repositories/courses.repository';
import { randomUUID } from 'crypto';
import type { Certificate } from '../../db/schema';

export interface CertificateWithDetails extends Certificate {
  studentName: string;
  courseTitle: string;
  instructorName: string;
}

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(
    private readonly certificatesRepository: CertificatesRepository,
    private readonly progressRepository: ProgressRepository,
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly coursesRepository: CoursesRepository,
  ) {}

  /**
   * Generate a unique certificate UID
   */
  generateCertificateUid(): string {
    return `CERT-${randomUUID()}`;
  }

  /**
   * Auto-issue certificate if student has 100% course completion
   */
  async autoIssueCertificate(studentId: number, courseId: number): Promise<Certificate | null> {
    // Check enrollment exists
    const enrollment = await this.enrollmentsRepository.findByStudentAndCourse(studentId, courseId);
    if (!enrollment) {
      throw new BadRequestException('Student is not enrolled in this course');
    }

    // Check for existing certificate
    const existing = await this.certificatesRepository.findByStudentAndCourse(studentId, courseId);
    if (existing) {
      this.logger.log(`Certificate already exists for student ${studentId}, course ${courseId}`);
      return existing;
    }

    // Check 100% completion
    const progress = await this.progressRepository.getCourseProgressSummary(studentId, courseId);
    if (!progress || progress.progressPercentage < 100) {
      this.logger.log(`Course not yet complete for student ${studentId}, course ${courseId}: ${progress?.progressPercentage ?? 0}%`);
      return null;
    }

    // Issue certificate
    const certificateUid = this.generateCertificateUid();
    const certificate = await this.certificatesRepository.create({
      studentId,
      courseId,
      certificateUid,
      pdfUrl: null,
    });

    this.logger.log(`Certificate auto-issued: ${certificateUid} for student ${studentId}, course ${courseId}`);
    return certificate;
  }

  /**
   * Get certificate with student and course details
   */
  async getCertificateWithDetails(certificateId: number): Promise<CertificateWithDetails> {
    const cert = await this.certificatesRepository.findById(certificateId);
    if (!cert) {
      throw new NotFoundException('Certificate not found');
    }
    return this.enrichCertificate(cert);
  }

  /**
   * Get certificate by UID (for public verification)
   */
  async getCertificateByUid(uid: string): Promise<CertificateWithDetails> {
    const cert = await this.certificatesRepository.findByUid(uid);
    if (!cert) {
      throw new NotFoundException('Certificate not found');
    }
    return this.enrichCertificate(cert);
  }

  /**
   * List certificates for a student
   */
  async listStudentCertificates(
    studentId: number,
    options: { offset?: number; limit?: number } = {},
  ) {
    return this.certificatesRepository.findByStudent(studentId, options);
  }

  /**
   * Verify certificate by UID - returns verification info
   */
  async verifyCertificate(uid: string): Promise<{
    valid: boolean;
    certificate: CertificateWithDetails | null;
  }> {
    try {
      const cert = await this.getCertificateByUid(uid);
      return { valid: true, certificate: cert };
    } catch {
      return { valid: false, certificate: null };
    }
  }

  /**
   * Enrich certificate with student/course/instructor names
   */
  private async enrichCertificate(cert: Certificate): Promise<CertificateWithDetails> {
    const [student, course] = await Promise.all([
      this.usersRepository.findById(cert.studentId),
      this.coursesRepository.findById(cert.courseId),
    ]);

    let instructorName = '';
    if (course?.instructorId) {
      const instructor = await this.usersRepository.findById(course.instructorId);
      instructorName = instructor?.name ?? '';
    }

    return {
      ...cert,
      studentName: student?.name ?? 'Unknown Student',
      courseTitle: course?.title ?? 'Unknown Course',
      instructorName,
    };
  }
}
