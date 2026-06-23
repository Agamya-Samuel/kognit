import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleOAuthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      // Required so validate() receives the raw request — we need it to read
      // the OAuth `state` parameter which carries the portal intent.
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const emailVerified = profile.emails?.[0]?.verified === true;
    const name = profile.displayName || email?.split('@')[0] || 'Google User';
    const avatarUrl = profile.photos?.[0]?.value;

    if (!email) {
      return done(new Error('Email not provided by Google'), null);
    }

    // HIGH-01 fix: Google can return unverified emails in rare edge cases
    // (e.g. when a Google Workspace admin has relaxed verification).
    // Reject OAuth login if the email is not verified to prevent account
    // linking to an unverified (potentially attacker-controlled) address.
    if (!emailVerified) {
      return done(
        new Error('Google account email is not verified. Please verify your Google email and try again.'),
        null,
      );
    }

    try {
      // The auth.controller encodes `{ redirect, intent }` as base64 JSON in
      // the `state` parameter when initiating the flow. Read it back here so
      // instructors signing in via Google are created as instructors, not
      // students. Falls back to 'student' if state is missing or malformed.
      const intent = this.extractIntentFromState(req.query.state as string);

      const result = await this.authService.handleOAuthLogin({
        provider: 'google',
        providerId: googleId,
        email,
        name,
        avatarUrl,
        intent,
      });
      done(null, result);
    } catch (error) {
      done(error as Error, null);
    }
  }

  private extractIntentFromState(stateParam: string | undefined): 'student' | 'instructor' {
    if (!stateParam) return 'student';
    try {
      const decoded = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf-8'));
      return decoded?.intent === 'instructor' ? 'instructor' : 'student';
    } catch {
      return 'student';
    }
  }
}
