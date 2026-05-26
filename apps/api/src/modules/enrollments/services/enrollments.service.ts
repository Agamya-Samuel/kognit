import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EnrollmentsRepository } from '../../db/repositories/enrollments.repository';
import type { Enrollment } from '../../db/schema/enrollments';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly enrollmentsRepository: EnrollmentsRepository) {}

  async getMyEnrollments(userId: number): Promise<Enrollment[]> {
    try {
      const result = await this.enrollmentsRepository.findByStudent(userId);
      return result.data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch enrollments');
    }
  }

  async getEnrollmentCount(userId: number): Promise<number> {
    try {
      return this.enrollmentsRepository.count({ studentId: userId });
    } catch (error) {
      throw new InternalServerErrorException('Failed to count enrollments');
    }
  }
}