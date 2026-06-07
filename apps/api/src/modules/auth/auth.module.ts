import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { UsersRepository } from '../../db/repositories/users.repository';
import { EmailVerificationsRepository } from '../../db/repositories/email-verifications.repository';
import { PasswordResetsRepository } from '../../db/repositories/password-resets.repository';
import { RefreshTokensRepository } from '../../db/repositories/refresh-tokens.repository';
import { UserAuthProvidersRepository } from '../../db/repositories/user-auth-providers.repository';
import { StudentProfilesRepository } from '../../db/repositories/student-profiles.repository';
import { InstructorProfilesRepository } from '../../db/repositories/instructor-profiles.repository';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleOAuthStrategy } from './strategies/google-oauth.strategy';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RolesGuard } from './guards/roles.guard';

// Services
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';
import { LockoutService } from './services/lockout.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { StudentActivationService } from './services/student-activation.service';
import { InstructorActivationService } from './services/instructor-activation.service';

// Controller & main service
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const repositories = [
  {
    provide: UsersRepository,
    useFactory: (db: any) => new UsersRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: EmailVerificationsRepository,
    useFactory: (db: any) => new EmailVerificationsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: PasswordResetsRepository,
    useFactory: (db: any) => new PasswordResetsRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: RefreshTokensRepository,
    useFactory: (db: any) => new RefreshTokensRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: UserAuthProvidersRepository,
    useFactory: (db: any) => new UserAuthProvidersRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: StudentProfilesRepository,
    useFactory: (db: any) => new StudentProfilesRepository(db),
    inject: [DRIZZLE_DB],
  },
  {
    provide: InstructorProfilesRepository,
    useFactory: (db: any) => new InstructorProfilesRepository(db),
    inject: [DRIZZLE_DB],
  },
];

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: (configService.get<string>('JWT_EXPIRY') || '15m') as any },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...repositories,
    // Strategies
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleOAuthStrategy,
    // Guards
    JwtAuthGuard,
    JwtRefreshGuard,
    RolesGuard,
    // Services
    PasswordService,
    TokenService,
    LockoutService,
    EmailVerificationService,
    PasswordResetService,
    StudentActivationService,
    InstructorActivationService,
    AuthService,
  ],
  exports: [
    AuthService,
    StudentActivationService,
    InstructorActivationService,
    JwtAuthGuard,
    JwtRefreshGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
