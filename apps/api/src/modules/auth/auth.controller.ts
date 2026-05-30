import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { StudentActivationService } from './services/student-activation.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/auth.decorators';
import type { JwtPayload } from './strategies';
import type { Request, Response } from 'express';
import {
  LoginDto,
  RequestEmailVerificationDto,
  VerifyEmailCodeDto,
  CompleteRegistrationDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  ValidateActivationTokenDto,
  CompleteActivationDto,
} from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly studentActivationService: StudentActivationService,
    private readonly configService: ConfigService,
  ) {}

  // ─── OAuth ────────────────────────────────────────────────────────────────

  @Public()
  @Get('google')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Redirects to Google OAuth' })
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    const redirect = req.query.redirect as string;
    const intent = (req.query.intent as string) || 'student';
    // Encode state as base64 JSON containing redirect and intent
    const state = Buffer.from(JSON.stringify({ redirect, intent })).toString('base64');
    const passport = require('passport');
    passport.authenticate('google', {
      scope: ['email', 'profile'],
      state,
    })(req, res);
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiResponse({ status: 200, description: 'OAuth callback redirects to frontend' })
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    // Parse redirect and intent from the state parameter (base64 JSON)
    let redirect = '/auth/callback';
    let intent = 'student';
    try {
      const stateStr = Buffer.from(req.query.state as string, 'base64').toString('utf-8');
      const state = JSON.parse(stateStr);
      redirect = state.redirect || '/auth/callback';
      intent = state.intent || 'student';
    } catch {
      // If state parsing fails, use defaults
    }

    const { user, tokens, isNewUser } = req.user as {
      user: any;
      tokens: { accessToken: string; refreshToken: string };
      isNewUser: boolean;
    };

    // Build redirect URL with tokens and intent
    const defaultOrigin = this.configService.get<string>('CORS_ORIGINS')?.split(',')[0] || 'http://localhost:3002';
    const baseUrl = redirect.startsWith('http') ? redirect : `${defaultOrigin}${redirect}`;
    const separator = baseUrl.includes('?') ? '&' : '?';
    const callbackUrl = `${baseUrl}${separator}accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&isNewUser=${isNewUser}&intent=${intent}`;

    return res.redirect(callbackUrl);
  }

  // ─── Email-First Registration ─────────────────────────────────────────────

  // ─── Email-First Registration ─────────────────────────────────────────

  @Public()
  @Post('register/request')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiOperation({ summary: 'Request email verification for registration' })
  async requestRegistration(@Body() dto: RequestEmailVerificationDto) {
    return this.authService.requestRegistrationVerification(dto.email, dto.intent);
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
    return this.authService.completeRegistration(dto.email, dto.code, dto.name, dto.password, dto.intent);
  }

  // ─── Login / Logout ──────────────────────────────────────────────────

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password, dto.portal);
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

  // ─── Student Activation (Bulk Import) ───────────────────────────────────

  @Public()
  @Post('student-activation/validate')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Token validated successfully' })
  @ApiOperation({ summary: 'Validate a student activation token' })
  async validateActivationToken(@Body() dto: ValidateActivationTokenDto) {
    return this.studentActivationService.validateActivationToken(dto.token);
  }

  @Public()
  @Post('student-activation/complete')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Activation completed and logged in' })
  @ApiOperation({ summary: 'Complete student activation with password and profile' })
  async completeActivation(@Body() dto: CompleteActivationDto) {
    return this.studentActivationService.completeActivation(
      dto.token,
      dto.password,
      dto.name,
      dto.mobile,
      dto.address,
      dto.city,
      dto.state,
      dto.pinCode,
      dto.country,
    );
  }
}
