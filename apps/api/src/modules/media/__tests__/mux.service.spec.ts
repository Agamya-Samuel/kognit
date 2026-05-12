import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MuxService } from '../services/mux.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('MuxService', () => {
  let service: MuxService;
  let configService: ConfigService;

  const mockMuxClient = {
    video: {
      assets: {
        create: jest.fn(),
        retrieve: jest.fn(),
        delete: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    // Setup config mocks BEFORE creating the service
    jest.spyOn(mockConfigService, 'get').mockImplementation((key) => {
      const config: Record<string, string> = {
        'MUX_TOKEN_ID': 'test_token_id',
        'MUX_TOKEN_SECRET': 'test_token_secret',
        'MUX_SIGNING_KEY': 'test_signing_key',
      };
      return config[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MuxService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MuxService>(MuxService);
    configService = module.get<ConfigService>(ConfigService);

    // Mock Mux client
    (service as any).mux = mockMuxClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isConfigured', () => {
    it('should return true when Mux credentials are configured', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('should return false when Mux credentials are not configured', () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);
      expect(service.isConfigured()).toBe(false);
    });
  });

  describe('createAsset', () => {
    it('should create a Mux asset successfully', async () => {

      const mockAsset = {
        id: 'asset_123',
        status: 'preparing',
        duration: 120,
        created_at: '2024-01-01T00:00:00Z',
        playback_ids: [{ id: 'playback_123', policy: 'signed' }],
      };

      mockMuxClient.video.assets.create.mockResolvedValue(mockAsset);

      const result = await service.createAsset({
        input: 'https://example.com/video.mp4',
        playbackPolicy: 'signed',
        mp4Support: 'none',
        test: false,
      });

      expect(result).toEqual({
        assetId: 'asset_123',
        playbackId: 'playback_123',
        status: 'preparing',
        duration: 120,
        createdAt: expect.any(Date),
      });

      expect(mockMuxClient.video.assets.create).toHaveBeenCalledWith({
        inputs: [{ url: 'https://example.com/video.mp4' }],
        playback_policy: ['signed'],
        mp4_support: 'none',
        test: false,
      });
    });

    it('should throw InternalServerErrorException when Mux is not configured', async () => {
      (service as any).mux = {};

      await expect(
        service.createAsset({
          input: 'https://example.com/video.mp4',
        })
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when no playback ID is returned', async () => {
      const mockAsset = {
        id: 'asset_123',
        status: 'preparing',
        duration: 120,
        created_at: '2024-01-01T00:00:00Z',
        playback_ids: [], // No playback ID
      };

      mockMuxClient.video.assets.create.mockResolvedValue(mockAsset);

      await expect(
        service.createAsset({
          input: 'https://example.com/video.mp4',
        })
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getAsset', () => {
    it('should retrieve asset details successfully', async () => {
      const mockAsset = {
        id: 'asset_123',
        status: 'ready',
        duration: 120,
        created_at: '2024-01-01T00:00:00Z',
        playback_ids: [{ id: 'playback_123', policy: 'signed' }],
      };

      mockMuxClient.video.assets.retrieve.mockResolvedValue(mockAsset);

      const result = await service.getAsset('asset_123');

      expect(result).toEqual({
        assetId: 'asset_123',
        playbackId: 'playback_123',
        status: 'ready',
        duration: 120,
        createdAt: expect.any(Date),
      });

      expect(mockMuxClient.video.assets.retrieve).toHaveBeenCalledWith('asset_123');
    });

    it('should return null when Mux is not configured', async () => {
      (service as any).mux = {};

      const result = await service.getAsset('asset_123');
      expect(result).toBeNull();
    });

    it('should return null when asset retrieval fails', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key) => {
        const config: Record<string, string> = {
          'MUX_TOKEN_ID': 'test_token_id',
          'MUX_TOKEN_SECRET': 'test_token_secret',
        };
        return config[key];
      });

      mockMuxClient.video.assets.retrieve.mockRejectedValue(new Error('Not found'));

      const result = await service.getAsset('asset_123');
      expect(result).toBeNull();
    });
  });

  describe('deleteAsset', () => {
    it('should delete asset successfully', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key) => {
        const config: Record<string, string> = {
          'MUX_TOKEN_ID': 'test_token_id',
          'MUX_TOKEN_SECRET': 'test_token_secret',
        };
        return config[key];
      });

      (mockMuxClient.video.assets as any).delete.mockResolvedValue(undefined);

      await service.deleteAsset('asset_123');

      expect((mockMuxClient.video.assets as any).delete).toHaveBeenCalledWith('asset_123');
    });

    it('should do nothing when Mux is not configured', async () => {
      (service as any).mux = {};
      (service as any).signingKey = undefined;

      await expect(service.deleteAsset('asset_123')).resolves.not.toThrow();
      expect(mockMuxClient.video.assets.del).not.toHaveBeenCalled();
    });
  });

  describe('generateSignedPlaybackUrl', () => {
    it('should generate signed playback URL successfully', async () => {
      const result = await service.generateSignedPlaybackUrl({
        playbackId: 'playback_123',
        expiryMinutes: 60,
      });

      expect(result).toBe('https://stream.mux.com/playback_123.m3u8');
    });

    it('should throw InternalServerErrorException when Mux is not configured', async () => {
      (service as any).mux = {};
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      await expect(
        service.generateSignedPlaybackUrl({
          playbackId: 'playback_123',
        })
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when signing key is not configured', async () => {
      (service as any).signingKey = undefined;

      await expect(
        service.generateSignedPlaybackUrl({
          playbackId: 'playback_123',
        })
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('validateWebhookSignature', () => {
    it('should return true when webhook secret is not configured', () => {
      (service as any).webhookSecret = '';

      const result = service.validateWebhookSignature(
        {},
        '{}',
      );

      expect(result).toBe(true);
    });

    it('should return true for valid signature format', () => {
      (service as any).webhookSecret = 'test_secret';

      const headers = {
        'mux-signature': 't=1234567890,v1=abc123',
      };

      const result = service.validateWebhookSignature(
        headers,
        '{}',
      );

      expect(result).toBe(true);
    });

    it('should return false when signature header is missing', () => {
      (service as any).webhookSecret = 'test_secret';

      const headers = {};

      const result = service.validateWebhookSignature(
        headers,
        '{}',
      );

      expect(result).toBe(false);
    });

    it('should return false for invalid signature format', () => {
      (service as any).webhookSecret = 'test_secret';

      const headers = {
        'mux-signature': 'invalid_format',
      };

      const result = service.validateWebhookSignature(
        headers,
        '{}',
      );

      expect(result).toBe(false);
    });
  });

  describe('parseWebhookEvent', () => {
    it('should parse valid webhook event', () => {
      const webhookData = {
        id: 'evt_123',
        type: 'video.asset.ready',
        data: {
          object: {
            id: 'asset_123',
            status: 'ready',
            duration: 120,
            created_at: '2024-01-01T00:00:00Z',
          },
        },
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = service.parseWebhookEvent(webhookData);

      expect(result).toEqual(webhookData);
    });

    it('should return null for invalid event structure', () => {
      const webhookData = {
        invalid: 'data',
      };

      const result = service.parseWebhookEvent(webhookData);

      expect(result).toBeNull();
    });
  });

  describe('getPlaybackUrl', () => {
    it('should generate direct playback URL', () => {
      const result = service.getPlaybackUrl('playback_123');

      expect(result).toBe('https://stream.mux.com/playback_123.m3u8');
    });
  });
});
