import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DrizzleDB } from '../connection';

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class BaseRepository<T = any> {
  constructor(protected db: DrizzleDB, protected tableName: any) {}

  protected handleError(error: any, operation: string) {
    console.error(`Error in ${operation}:`, error);

    if (error.code === '23505') {
      // Unique violation
      throw new InternalServerErrorException('A record with this data already exists');
    }

    if (error.code === '23503') {
      // Foreign key violation
      throw new NotFoundException('Referenced record not found');
    }

    if (error.code === '23502') {
      // Not null violation
      throw new InternalServerErrorException('Required field is missing');
    }

    throw new InternalServerErrorException('An unexpected error occurred');
  }

  protected createLoadingState<T>(data: T | null, isLoading: boolean = false, error: string | null = null) {
    return {
      data,
      isLoading,
      error,
      timestamp: new Date().toISOString(),
    };
  }
}
