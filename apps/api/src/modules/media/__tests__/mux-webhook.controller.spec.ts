import { Test, TestingModule } from '@nestjs/testing';
import { MuxWebhookController } from '../mux-webhook.controller';
import { MuxService } from '../services/mux.service';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';

describe('MuxWebhookController', () => {
  let controller: MuxWebhookController;
  let muxService: MuxService;
  let lecturesRepository: LecturesRepository;

  const mockLecture = {
    id: 1,
    sectionId: 1,
    title: 'Test Lecture',
    description: 'Test Description',
    orderIndex: 1,
    type: 'video',
    uploadId: 1,
    muxAssetId: 'asset_123',
    muxPlaybackId: null,
    durationSeconds: 0,
    isFreePreview: false,
    isPublished: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockMuxService = {
      validateWebhookSignature: jest.fn(),
      parseWebhookEvent: jest.fn(),
    };

    const mockLecturesRepository = {
      findByMuxAssetId: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MuxWebhookController],
      providers: [
        {
          provide: MuxService,
          useValue: mockMuxService,
        },
        {
          provide: LecturesRepository,
          useValue: mockLecturesRepository,
        },
      ],
    }).compile();

    controller = module.get<MuxWebhookController>(MuxWebhookController);
    muxService = module.get<MuxService>(MuxService);
    lecturesRepository = module.get<LecturesRepository>(LecturesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleAssetStatus', () => {
    it('should handle asset ready event successfully', async () => {
      const webhookData = {
        id: 'evt_123',
        type: 'video.asset.ready',
        data: {
          object: {
            id: 'asset_123',
            status: 'ready',
            duration: 120,
            created_at: '2024-01-01T00:00:00Z',
            playback_ids: [{ id: 'playback_123', policy: 'signed' }],
          },
        },
        created_at: '2024-01-01T00:00:00Z',
      };

      const headers = {
        'mux-signature': 't=1234567890,v1=abc123',
      };

      jest.spyOn(muxService, 'validateWebhookSignature').mockReturnValue(true);
      jest.spyOn(muxService, 'parseWebhookEvent').mockReturnValue(webhookData as any);
      (lecturesRepository.findByMuxAssetId as jest.Mock).mockResolvedValue(mockLecture);
      (lecturesRepository.update as jest.Mock).mockResolvedValue(mockLecture);

      const result = await controller.handleAssetStatus(webhookData, headers);

      expect(result).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });

      expect(muxService.validateWebhookSignature).toHaveBeenCalledWith(
        headers,
        JSON.stringify(webhookData)
      );

      expect(muxService.parseWebhookEvent).toHaveBeenCalledWith(webhookData);

      expect(lecturesRepository.findByMuxAssetId).toHaveBeenCalledWith('asset_123');

      expect(lecturesRepository.update).toHaveBeenCalledWith(1, {
        muxPlaybackId: 'playback_123',
        durationSeconds: 120,
      });
    });

    it('should handle asset errored event', async () => {
      const webhookData = {
        id: 'evt_123',
        type: 'video.asset.errored',
        data: {
          object: {
            id: 'asset_123',
            status: 'errored',
            duration: 0,
            created_at: '2024-01-01T00:00:00Z',
            playback_ids: [],
            errors: [
              {
                type: 'video.invalid_file_format',
                messages: ['The video file format is invalid'],
              },
            ],
          },
        },
        created_at: '2024-01-01T00:00:00Z',
      };

      const headers = {
        'mux-signature': 't=1234567890,v1=abc123',
      };

      jest.spyOn(muxService, 'validateWebhookSignature').mockReturnValue(true);
      jest.spyOn(muxService, 'parseWebhookEvent').mockReturnValue(webhookData as any);
      (lecturesRepository.findByMuxAssetId as jest.Mock).mockResolvedValue(mockLecture);

      const result = await controller.handleAssetStatus(webhookData, headers);

      expect(result).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });

      expect(lecturesRepository.findByMuxAssetId).toHaveBeenCalledWith('asset_123');
    });

    it('should return error for invalid webhook signature', async () => {
      const webhookData = {
        id: 'evt_123',
        type: 'video.asset.ready',
        data: {},
        created_at: '2024-01-01T00:00:00Z',
      };

      const headers = {};

      jest.spyOn(muxService, 'validateWebhookSignature').mockReturnValue(false);

      const result = await controller.handleAssetStatus(webhookData, headers);

      expect(result).toEqual({
        success: false,
        message: 'Invalid webhook signature',
      });

      expect(muxService.parseWebhookEvent).not.toHaveBeenCalled();
    });

    it('should return error for invalid webhook event', async () => {
      const webhookData = {
        invalid: 'data',
      };

      const headers = {
        'mux-signature': 't=1234567890,v1=abc123',
      };

      jest.spyOn(muxService, 'validateWebhookSignature').mockReturnValue(true);
      jest.spyOn(muxService, 'parseWebhookEvent').mockReturnValue(null);

      const result = await controller.handleAssetStatus(webhookData, headers);

      expect(result).toEqual({
        success: false,
        message: 'Invalid webhook event',
      });
    });

    it('should return success message for unhandled event type', async () => {
      const webhookData = {
        id: 'evt_123',
        type: 'video.asset.other',
        data: {
          object: {
            id: 'asset_123',
            status: 'preparing',
            duration: 0,
            created_at: '2024-01-01T00:00:00Z',
          },
        },
        created_at: '2024-01-01T00:00:00Z',
      };

      const headers = {
        'mux-signature': 't=1234567890,v1=abc123',
      };

      jest.spyOn(muxService, 'validateWebhookSignature').mockReturnValue(true);
      jest.spyOn(muxService, 'parseWebhookEvent').mockReturnValue(webhookData as any);

      const result = await controller.handleAssetStatus(webhookData, headers);

      expect(result).toEqual({
        success: true,
        message: 'Event type not handled',
      });
    });

    it('should handle case where lecture is not found', async () => {
      const webhookData = {
        id: 'evt_123',
        type: 'video.asset.ready',
        data: {
          object: {
            id: 'asset_123',
            status: 'ready',
            duration: 120,
            created_at: '2024-01-01T00:00:00Z',
            playback_ids: [{ id: 'playback_123', policy: 'signed' }],
          },
        },
        created_at: '2024-01-01T00:00:00Z',
      };

      const headers = {
        'mux-signature': 't=1234567890,v1=abc123',
      };

      jest.spyOn(muxService, 'validateWebhookSignature').mockReturnValue(true);
      jest.spyOn(muxService, 'parseWebhookEvent').mockReturnValue(webhookData as any);
      (lecturesRepository.findByMuxAssetId as jest.Mock).mockResolvedValue(null);

      const result = await controller.handleAssetStatus(webhookData, headers);

      expect(result).toEqual({
        success: true,
        message: 'Webhook processed successfully',
      });

      expect(lecturesRepository.update).not.toHaveBeenCalled();
    });
  });
});
