import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsJwtGuard, WsAuthenticatedUser } from '../guards/ws-jwt.guard';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createMockClient(handshake: any = {}) {
  return {
    handshake,
    data: {} as Record<string, any>,
    emit: jest.fn(),
    disconnect: jest.fn(),
  };
}

function createMockContext(client: any) {
  return {
    switchToWs: () => ({
      getClient: () => client,
    }),
  } as any;
}

function createValidPayload(): WsAuthenticatedUser {
  return { sub: 1, email: 'user@test.com', role: 'student' };
}

// ─── Mock Factories ───────────────────────────────────────────────────────────

function createMockJwtService(decoded: WsAuthenticatedUser | null = createValidPayload()) {
  return {
    verify: jest.fn().mockImplementation((token: string) => {
      if (token === 'valid-token') return decoded;
      if (token === 'expired-token') throw new Error('jwt expired');
      if (token === 'invalid-token') throw new Error('invalid token');
      throw new Error('jwt malformed');
    }),
    sign: jest.fn().mockReturnValue('signed-token'),
  };
}

function createMockConfigService() {
  return {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'test-jwt-secret';
      return null;
    }),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('WsJwtGuard', () => {
  let guard: WsJwtGuard;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsJwtGuard,
        { provide: JwtService, useFactory: createMockJwtService },
        { provide: ConfigService, useFactory: createMockConfigService },
      ],
    }).compile();

    guard = module.get<WsJwtGuard>(WsJwtGuard);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('canActivate', () => {
    it('should return true when valid token is in auth.token', () => {
      const client = createMockClient({ auth: { token: 'valid-token' }, headers: {}, query: {} });
      const context = createMockContext(client);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(client.data.user).toEqual(createValidPayload());
    });

    it('should return true when valid token is in Authorization header', () => {
      const client = createMockClient({
        auth: {},
        headers: { authorization: 'Bearer valid-token' },
        query: {},
      });
      const context = createMockContext(client);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(client.data.user).toEqual(createValidPayload());
    });

    it('should return true when valid token is in query parameter', () => {
      const client = createMockClient({ auth: {}, headers: {}, query: { token: 'valid-token' } });
      const context = createMockContext(client);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false when no token is provided', () => {
      const client = createMockClient({ auth: {}, headers: {}, query: {} });
      const context = createMockContext(client);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when token is expired', () => {
      const client = createMockClient({ auth: { token: 'expired-token' }, headers: {}, query: {} });
      const context = createMockContext(client);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when token is invalid', () => {
      const client = createMockClient({ auth: { token: 'invalid-token' }, headers: {}, query: {} });
      const context = createMockContext(client);

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });
  });

  describe('validateToken', () => {
    it('should return decoded payload for a valid token', () => {
      const result = guard.validateToken('valid-token');

      expect(result).toEqual(createValidPayload());
    });

    it('should return null for an expired token', () => {
      const result = guard.validateToken('expired-token');

      expect(result).toBeNull();
    });

    it('should return null for an invalid token', () => {
      const result = guard.validateToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for a completely malformed token', () => {
      const result = guard.validateToken('not-a-jwt');

      expect(result).toBeNull();
    });

    it('should return null when token is empty string', () => {
      const result = guard.validateToken('');

      expect(result).toBeNull();
    });
  });
});
