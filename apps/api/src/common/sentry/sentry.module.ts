import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

@Global()
@Module({})
export class SentryModule {
  static forRoot() {
    return {
      module: SentryModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: 'SENTRY_INITIALIZED',
          useFactory: (config: ConfigService) => {
            const dsn = config.get<string>('SENTRY_DSN');
            const environment = config.get<string>('NODE_ENV') || 'development';

            if (!dsn) {
              return false;
            }

            Sentry.init({
              dsn,
              environment,
              integrations: [nodeProfilingIntegration()],
              tracesSampleRate: environment === 'production' ? 0.2 : 1.0,
              profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
            });

            return true;
          },
          inject: [ConfigService],
        },
      ],
      exports: ['SENTRY_INITIALIZED'],
    };
  }
}
