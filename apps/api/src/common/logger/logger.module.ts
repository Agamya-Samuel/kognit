import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RequestIdMiddleware } from './request-id.middleware';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>('NODE_ENV') !== 'production';
        const logLevel = config.get<string>('LOG_LEVEL') || (isDev ? 'debug' : 'info');

        return {
          pinoHttp: {
            level: logLevel,
            transport: isDev
              ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
              : undefined,
            redact: {
              paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'req.body.passwordHash'],
              censor: '[REDACTED]',
            },
            serializers: {
              req(req: any) {
                return {
                  method: req.method,
                  url: req.url,
                  id: req.id,
                };
              },
              res(res: any) {
                return { statusCode: res.statusCode };
              },
            },
            formatters: {
              level(label: string) {
                return { level: label };
              },
              bindings(bindings: any) {
                return { pid: bindings.pid, host: bindings.hostname };
              },
            },
            timestamp: () => `,"time":"${new Date().toISOString()}"`,
          },
        };
      },
    }),
  ],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
