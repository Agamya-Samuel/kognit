import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LiveKitService } from '../services/livekit.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('LiveKitService', () => {
  let service: LiveKitService;
  let configService: ConfigService;

  const mockRoomService = {
    createRoom: jest.fn(),
    listRooms: jest.fn(),
    deleteRoom: jest.fn(),
    listParticipants: jest.fn(),
    removeParticipant: jest.fn(),
  };

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    jest.spyOn(mockConfigService, 'get').mockImplementation((key: string) => {
      const config: Record<string, string> = {
        LIVEKIT_API_KEY: 'test_api_key',
        LIVEKIT_API_SECRET: 'test_api_secret',
        LIVEKIT_URL: 'wss://test.livekit.cloud',
      };
      return config[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiveKitService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LiveKitService>(LiveKitService);
    configService = module.get<ConfigService>(ConfigService);

    // Mock the roomService directly
    (service as any).roomService = mockRoomService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── isConfigured ──────────────────────────────────────────────────────────

  describe('isConfigured', () => {
    it('should return true when all LiveKit credentials are configured', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('should return false when LIVEKIT_API_KEY is missing', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'LIVEKIT_API_KEY') return undefined;
        return 'value';
      });
      expect(service.isConfigured()).toBe(false);
    });

    it('should return false when LIVEKIT_API_SECRET is missing', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'LIVEKIT_API_SECRET') return undefined;
        return 'value';
      });
      expect(service.isConfigured()).toBe(false);
    });

    it('should return false when LIVEKIT_URL is missing', () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'LIVEKIT_URL') return undefined;
        return 'value';
      });
      expect(service.isConfigured()).toBe(false);
    });
  });

  // ─── createRoom ────────────────────────────────────────────────────────────

  describe('createRoom', () => {
    it('should create a LiveKit room and return room info', async () => {
      const mockRoom = {
        name: 'class-123',
        sid: 'room_sid_123',
        numParticipants: 0,
        creationTimeMs: BigInt(1700000000000),
        creationTime: BigInt(1700000000),
      };

      mockRoomService.createRoom.mockResolvedValue(mockRoom);

      const result = await service.createRoom({
        roomName: 'class-123',
        maxParticipants: 50,
      });

      expect(result).toEqual({
        roomName: 'class-123',
        sid: 'room_sid_123',
        participants: 0,
        maxParticipants: 50,
        createdAt: '1700000000000',
        active: true,
      });

      expect(mockRoomService.createRoom).toHaveBeenCalledWith({
        name: 'class-123',
        maxParticipants: 50,
        emptyTimeout: 600,
        metadata: '{}',
      });
    });

    it('should use default values when optional params are not provided', async () => {
      const mockRoom = {
        name: 'class-default',
        sid: 'room_sid_default',
        numParticipants: 2,
        creationTimeMs: BigInt(1700000000000),
        creationTime: BigInt(1700000000),
      };

      mockRoomService.createRoom.mockResolvedValue(mockRoom);

      const result = await service.createRoom({ roomName: 'class-default' });

      expect(result.maxParticipants).toBe(100);
      expect(mockRoomService.createRoom).toHaveBeenCalledWith(
        expect.objectContaining({
          maxParticipants: 100,
          emptyTimeout: 600,
        }),
      );
    });

    it('should throw InternalServerErrorException when LiveKit is not configured', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      await expect(
        service.createRoom({ roomName: 'class-fail' }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when room creation fails', async () => {
      mockRoomService.createRoom.mockRejectedValue(new Error('Network error'));

      await expect(
        service.createRoom({ roomName: 'class-fail' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ─── getRoomInfo ───────────────────────────────────────────────────────────

  describe('getRoomInfo', () => {
    it('should return room info when room exists', async () => {
      const mockRooms = [
        {
          name: 'class-123',
          sid: 'room_sid_123',
          numParticipants: 5,
          maxParticipants: 100,
          creationTimeMs: BigInt(1700000000000),
          creationTime: BigInt(1700000000),
        },
      ];

      mockRoomService.listRooms.mockResolvedValue(mockRooms);

      const result = await service.getRoomInfo('class-123');

      expect(result).toEqual({
        roomName: 'class-123',
        sid: 'room_sid_123',
        participants: 5,
        maxParticipants: 100,
        createdAt: '1700000000000',
        active: true,
      });
    });

    it('should return null when room does not exist', async () => {
      mockRoomService.listRooms.mockResolvedValue([]);

      const result = await service.getRoomInfo('nonexistent-room');

      expect(result).toBeNull();
    });

    it('should return null when LiveKit is not configured', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      const result = await service.getRoomInfo('class-123');

      expect(result).toBeNull();
    });

    it('should return null and log error on failure', async () => {
      mockRoomService.listRooms.mockRejectedValue(new Error('Server error'));

      const result = await service.getRoomInfo('class-123');

      expect(result).toBeNull();
    });
  });

  // ─── deleteRoom ────────────────────────────────────────────────────────────

  describe('deleteRoom', () => {
    it('should delete a room successfully', async () => {
      mockRoomService.deleteRoom.mockResolvedValue(undefined);

      await service.deleteRoom('class-123');

      expect(mockRoomService.deleteRoom).toHaveBeenCalledWith('class-123');
    });

    it('should not throw when LiveKit is not configured', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      await expect(service.deleteRoom('class-123')).resolves.toBeUndefined();
    });

    it('should throw InternalServerErrorException when deletion fails', async () => {
      mockRoomService.deleteRoom.mockRejectedValue(new Error('Not found'));

      await expect(service.deleteRoom('class-123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // ─── listParticipants ──────────────────────────────────────────────────────

  describe('listParticipants', () => {
    it('should return list of participants', async () => {
      const mockParticipants = [
        { identity: 'instructor-1', name: 'John', state: 'ACTIVE' },
        { identity: 'student-2', name: 'Jane', state: 'DISCONNECTED' },
      ];

      mockRoomService.listParticipants.mockResolvedValue(mockParticipants);

      const result = await service.listParticipants('class-123');

      expect(result).toEqual([
        { identity: 'instructor-1', name: 'John', state: 'ACTIVE' },
        { identity: 'student-2', name: 'Jane', state: 'DISCONNECTED' },
      ]);
    });

    it('should return empty array when no participants', async () => {
      mockRoomService.listParticipants.mockResolvedValue([]);

      const result = await service.listParticipants('class-123');

      expect(result).toEqual([]);
    });

    it('should return empty array when LiveKit is not configured', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      const result = await service.listParticipants('class-123');

      expect(result).toEqual([]);
    });
  });

  // ─── removeParticipant ─────────────────────────────────────────────────────

  describe('removeParticipant', () => {
    it('should remove a participant successfully', async () => {
      mockRoomService.removeParticipant.mockResolvedValue(undefined);

      await service.removeParticipant('class-123', 'student-2');

      expect(mockRoomService.removeParticipant).toHaveBeenCalledWith(
        'class-123',
        'student-2',
      );
    });

    it('should throw InternalServerErrorException when removal fails', async () => {
      mockRoomService.removeParticipant.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(
        service.removeParticipant('class-123', 'student-999'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ─── generateInstructorToken ───────────────────────────────────────────────

  describe('generateInstructorToken', () => {
    it('should generate an instructor token with correct properties', async () => {
      const result = await service.generateInstructorToken({
        roomName: 'class-123',
        userId: 1,
        userName: 'instructor@test.com',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('identity', 'instructor-1');
      expect(result).toHaveProperty('roomName', 'class-123');
      expect(result).toHaveProperty('expiresIn', 3600);
    });

    it('should use custom expiresIn when provided', async () => {
      const result = await service.generateInstructorToken({
        roomName: 'class-123',
        userId: 1,
        userName: 'instructor@test.com',
        expiresIn: 7200,
      });

      expect(result.expiresIn).toBe(7200);
    });

    it('should throw InternalServerErrorException when LiveKit is not configured', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      await expect(
        service.generateInstructorToken({
          roomName: 'class-123',
          userId: 1,
          userName: 'test@test.com',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ─── generateStudentToken ──────────────────────────────────────────────────

  describe('generateStudentToken', () => {
    it('should generate a student token with correct properties', async () => {
      const result = await service.generateStudentToken({
        roomName: 'class-123',
        userId: 5,
        userName: 'student@test.com',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('identity', 'student-5');
      expect(result).toHaveProperty('roomName', 'class-123');
      expect(result).toHaveProperty('expiresIn', 3600);
    });

    it('should use custom expiresIn when provided', async () => {
      const result = await service.generateStudentToken({
        roomName: 'class-123',
        userId: 5,
        userName: 'student@test.com',
        expiresIn: 1800,
      });

      expect(result.expiresIn).toBe(1800);
    });
  });
});
