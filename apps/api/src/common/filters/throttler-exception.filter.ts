import {
  Injectable,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';

@Catch(ThrottlerException)
export class ThrottlerExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ThrottlerExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = HttpStatus.TOO_MANY_REQUESTS;
    const message =
      'Too many requests. Please slow down and try again in a moment.';

    this.logger.warn(
      `Rate limit exceeded: ${request.method} ${request.ip} ${request.url}`,
    );

    response.status(statusCode).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        statusCode,
      },
    });
  }
}
