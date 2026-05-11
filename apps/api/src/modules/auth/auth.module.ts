import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DRIZZLE_DB } from '../../db/database.module';

// Repositories
import { UsersRepository } from '../../db/repositories/users.repository';
import { EmailVerificationsRepository } from '../../db/repositories/email-verifications.repository';
import { PasswordResetsRepository } from '../../db/repositories/password-resets.repository';
import { RefreshTokensRepository } from '../../db/repositories/refresh-tokens.repository';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

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
];

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    ...repositories,
    // Strategies
    JwtStrategy,
    JwtRefreshStrategy,
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
    AuthService,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    JwtRefreshGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
