import { Test, TestingModule } from '@nestjs/testing';
import { PresenceService, PresenceEntry } from '../services/presence.service';
import { RedisService } from '../../../redis/redis.service';

// ─── Mock Factory ─────────────────────────────────────────────────────────────

function createMockRedisService() {
  const store: Map<string, string> = new Map();
  const sets: Map<string, Set<string>> = new Map();

  return {
    getClient: jest.fn().mockReturnValue({
      get: jest.fn((key: string) => Promise.resolve(store.get(key) || null)),
      setex: jest.fn((key: string, ttl: number, value: string) => {
        store.set(key, value);
        return Promise.resolve('OK');
      }),
      del: jest.fn((key: string) => {
        store.delete(key);
        return Promise.resolve(1);
      }),
      sadd: jest.fn((key: string, ...members: string[]) => {
        if (!sets.has(key)) sets.set(key, new Set());
        const set = sets.get(key)!;
        members.forEach((m) => set.add(m));
        return Promise.resolve(members.length);
      }),
      srem: jest.fn((key: string, ...members: string[]) => {
        if (sets.has(key)) {
          const set = sets.get(key)!;
          members.forEach((m) => set.delete(m));
        }
        return Promise.resolve(1);
      }),
      smembers: jest.fn((key: string) => {
        const set = sets.get(key);
        return Promise.resolve(set ? Array.from(set) : []);
      }),
      sismember: jest.fn((key: string, member: string) => {
        const set = sets.get(key);
        return Promise.resolve(set && set.has(member) ? 1 : 0);
      }),
    }),
    _store: store,
    _sets: sets,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('PresenceService', () => {
  let service: PresenceService;
  let redisService: ReturnType<typeof createMockRedisService>;

  beforeEach(async () => {
    redisService = createMockRedisService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PresenceService,
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get<PresenceService>(PresenceService);
  });

  describe('setUserOnline', () => {
    it('should store user presence data in Redis', async () => {
      await service.setUserOnline(1, 'user@test.com', 'student', 'socket-1');

      const entry = await service.getUserPresence(1);
      expect(entry).not.toBeNull();
      expect(entry!.userId).toBe(1);
      expect(entry!.email).toBe('user@test.com');
      expect(entry!.role).toBe('student');
      expect(entry!.socketId).toBe('socket-1');
      expect(entry!.rooms).toEqual([]);
    });

    it('should add user to the online set', async () => {
      await service.setUserOnline(1, 'user@test.com', 'student', 'socket-1');

      const online = await service.getOnlineUserIds();
      expect(online).toContain(1);
    });
  });

  describe('setUserOffline', () => {
    it('should remove user presence data', async () => {
      await service.setUserOnline(1, 'user@test.com', 'student', 'socket-1');
      await service.setUserOffline(1);

      const entry = await service.getUserPresence(1);
      expect(entry).toBeNull();
    });

    it('should remove user from the online set', async () => {
      await service.setUserOnline(1, 'user@test.com', 'student', 'socket-1');
      await service.setUserOffline(1);

      const online = await service.getOnlineUserIds();
      expect(online).not.toContain(1);
    });
  });

  describe('updateUserRooms', () => {
    it('should update the room list for a user', async () => {
      await service.setUserOnline(1, 'user@test.com', 'student', 'socket-1');
      await service.updateUserRooms(1, ['course:1', 'live:2']);

      const entry = await service.getUserPresence(1);
      expect(entry!.rooms).toEqual(['course:1', 'live:2']);
    });

    it('should do nothing if user is not online', async () => {
      // Should not throw
      await service.updateUserRooms(999, ['course:1']);
    });
  });

  describe('isUserOnline', () => {
    it('should return true for an online user', async () => {
      await service.setUserOnline(1, 'user@test.com', 'student', 'socket-1');

      const result = await service.isUserOnline(1);
      expect(result).toBe(true);
    });

    it('should return false for an offline user', async () => {
      const result = await service.isUserOnline(999);
      expect(result).toBe(false);
    });
  });

  describe('getOnlineUserIds', () => {
    it('should return all online user IDs', async () => {
      await service.setUserOnline(1, 'user1@test.com', 'student', 'socket-1');
      await service.setUserOnline(2, 'user2@test.com', 'instructor', 'socket-2');

      const ids = await service.getOnlineUserIds();
      expect(ids).toContain(1);
      expect(ids).toContain(2);
    });

    it('should return empty array when no users are online', async () => {
      const ids = await service.getOnlineUserIds();
      expect(ids).toEqual([]);
    });
  });

  describe('getUsersInRoom', () => {
    it('should return users in a specific room', async () => {
      await service.setUserOnline(1, 'user1@test.com', 'student', 'socket-1');
      await service.updateUserRooms(1, ['course:1']);

      await service.setUserOnline(2, 'user2@test.com', 'student', 'socket-2');
      // user 2 is not in course:1

      const users = await service.getUsersInRoom('course:1');
      expect(users.length).toBe(1);
      expect(users[0].userId).toBe(1);
    });

    it('should return empty array when no users are in the room', async () => {
      const users = await service.getUsersInRoom('course:999');
      expect(users).toEqual([]);
    });
  });
});
