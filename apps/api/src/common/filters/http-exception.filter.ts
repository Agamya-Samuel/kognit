import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errorCode: string;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorCode = this.getErrorCodeFromStatus(status);
      } else if (typeof exceptionResponse === 'object') {
        const responseObject = exceptionResponse as any;
        message =
          responseObject.message ||
          (Array.isArray(responseObject.message)
            ? responseObject.message.join(', ')
            : 'An error occurred');
        errorCode = responseObject.errorCode || this.getErrorCodeFromStatus(status);
        details = responseObject.details || (responseObject.message && Array.isArray(responseObject.message) ? responseObject.message : undefined);
      } else {
        message = 'An error occurred';
        errorCode = this.getErrorCodeFromStatus(status);
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errorCode = 'INTERNAL_SERVER_ERROR';
      details = process.env.NODE_ENV === 'development' ? exception : undefined;
    }

    // Log error details
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Error: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Construct error response
    const errorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        statusCode: status,
      },
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCodeFromStatus(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }
}
