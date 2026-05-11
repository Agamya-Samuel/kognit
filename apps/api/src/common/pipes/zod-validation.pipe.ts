import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      const result = this.schema.parse(value);
      return result;
    } catch (error) {
      const formattedErrors = [];

      if (error && typeof error === 'object' && 'errors' in error) {
        const zodErrors = (error as any).errors;
        
        for (const zodError of zodErrors) {
          formattedErrors.push({
            field: zodError.path.join('.'),
            message: zodError.message,
            code: zodError.code,
          });
        }
      }

      throw new BadRequestException({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: formattedErrors,
        },
      });
    }
  }
}
