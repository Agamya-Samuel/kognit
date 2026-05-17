import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/auth.decorators';
import type { JwtPayload } from './strategies';
import type { Request } from 'express';
import {
  LoginDto,
  RequestEmailVerificationDto,
  VerifyEmailCodeDto,
  CompleteRegistrationDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Email-First Registration ─────────────────────────────────────────

  @Public()
  @Post('register/request')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiOperation({ summary: 'Request email verification for registration' })
  async requestRegistration(@Body() dto: RequestEmailVerificationDto) {
    return this.authService.requestRegistrationVerification(dto.email);
  }

  @Public()
  @Post('register/verify')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Email code verified' })
  @ApiOperation({ summary: 'Verify email code for registration' })
  async verifyRegistrationCode(@Body() dto: VerifyEmailCodeDto) {
    return this.authService.verifyRegistrationCode(dto.email, dto.code);
  }

  @Public()
  @Post('register/complete')
  @ApiResponse({ status: 201, description: 'Registration completed' })
  @ApiOperation({ summary: 'Complete registration with name and password' })
  async completeRegistration(@Body() dto: CompleteRegistrationDto) {
    return this.authService.completeRegistration(dto.email, dto.code, dto.name, dto.password);
  }

  // ─── Login / Logout ──────────────────────────────────────────────────

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiOperation({ summary: 'Logout (revokes all refresh tokens)' })
  async logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub);
  }

  // ─── Token Refresh ───────────────────────────────────────────────────

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @UseGuards(JwtRefreshGuard)
  async refreshTokens(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    const rawRefreshToken = (req.body as any).refreshToken;
    return this.authService.refreshTokens(user.sub, rawRefreshToken);
  }

  // ─── Profile ─────────────────────────────────────────────────────────

  @Get('me')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }

  // ─── Password Management ─────────────────────────────────────────────

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiOperation({ summary: 'Change password (authenticated)' })
  async changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.sub, dto.currentPassword, dto.newPassword);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Reset email sent' })
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiOperation({ summary: 'Reset password with token and email' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPasswordWithEmail(dto.email, dto.token, dto.password);
  }

  // ─── Email Verification (existing users) ─────────────────────────────

  @Post('email-verification/request')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiOperation({ summary: 'Request email verification code' })
  async requestEmailVerification(@CurrentUser() user: JwtPayload) {
    return this.authService.requestEmailVerification(user.sub);
  }

  @Post('email-verification/verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiOperation({ summary: 'Verify email with code' })
  async verifyEmail(@CurrentUser() user: JwtPayload, @Body() dto: VerifyEmailCodeDto) {
    return this.authService.verifyEmail(user.sub, dto.code);
  }
}
