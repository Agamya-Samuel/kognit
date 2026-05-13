import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface WsAuthenticatedUser {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const handshake = client.handshake || {};

    // Try to get token from auth header or query
    const token =
      handshake.auth?.token ||
      handshake.headers?.authorization?.replace('Bearer ', '') ||
      handshake.query?.token;

    if (!token) {
      return false;
    }

    try {
      const payload = this.jwtService.verify<WsAuthenticatedUser>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Attach the decoded user to the client for later use
      client.data = client.data || {};
      client.data.user = payload;

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate a token and return the decoded payload or null.
   * Used directly in the gateway's handleConnection.
   */
  validateToken(token: string): WsAuthenticatedUser | null {
    try {
      return this.jwtService.verify<WsAuthenticatedUser>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      return null;
    }
  }
}
