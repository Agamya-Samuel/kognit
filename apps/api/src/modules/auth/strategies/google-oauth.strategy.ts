import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
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
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void,
  ): Promise<void> {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName || email?.split('@')[0] || 'Google User';
    const avatarUrl = profile.photos?.[0]?.value;

    if (!email) {
      return done(new Error('Email not provided by Google'), null);
    }

    try {
      const result = await this.authService.handleOAuthLogin({
        provider: 'google',
        providerId: googleId,
        email,
        name,
        avatarUrl,
      });
      done(null, result);
    } catch (error) {
      done(error, null);
    }
  }
}
