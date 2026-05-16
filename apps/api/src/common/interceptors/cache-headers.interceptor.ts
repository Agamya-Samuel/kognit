import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class CacheHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse<Response>();

    // Only add cache headers for GET requests on public endpoints
    if (request.method === 'GET') {
      const url: string = request.url;

      // Static/semi-static resources: cache for 5 minutes
      if (url.includes('/api/v1/courses') && !url.includes('/progress')) {
        response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
      }
      // Health check: short cache
      else if (url.includes('/api/health') || url.includes('/api/v1/health')) {
        response.setHeader('Cache-Control', 'public, max-age=30');
      }
      // Default for other GET requests: no cache (private, revalidate)
      else {
        response.setHeader('Cache-Control', 'private, no-cache, max-age=0, must-revalidate');
      }
    }

    return next.handle().pipe(map((data) => data));
  }
}
