import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const SLOW_THRESHOLD_MS = 500;

@Injectable()
export class SlowQueryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SlowQueryInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        if (duration > SLOW_THRESHOLD_MS) {
          this.logger.warn(
            `Slow request: ${method} ${url} took ${duration}ms`,
          );
        }
      }),
    );
  }
}
