import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../services/notifications.service';
import { NotificationsRepository } from '../../../db/repositories/notifications.repository';
import { UserNotificationPreferencesRepository } from '../repositories/notifications-preferences.repository';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationsRepo: jest.Mocked<NotificationsRepository>;
  let preferencesRepo: jest.Mocked<UserNotificationPreferencesRepository>;

  const mockNotification = {
    id: 1,
    userId: 1,
    type: 'enrollment',
    title: 'Welcome',
    isRead: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationsRepository,
          useValue: {
            findMany: jest.fn(),
            findById: jest.fn(),
            count: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
          },
        },
        {
          provide: UserNotificationPreferencesRepository,
          useValue: {
            findByUserId: jest.fn(),
            upsert: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationsRepo = module.get(NotificationsRepository);
    preferencesRepo = module.get(UserNotificationPreferencesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should return notifications for a user', async () => {
      notificationsRepo.findMany.mockResolvedValue({ data: [mockNotification], total: 1 } as any);

      const result = await service.getNotifications(1);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      notificationsRepo.count.mockResolvedValue(3);

      const result = await service.getUnreadCount(1);
      expect(result).toBe(3);
    });
  });

  describe('markAsRead', () => {
    it('should return null when notification does not exist', async () => {
      notificationsRepo.findById.mockResolvedValue(null);

      const result = await service.markAsRead(1, 1);
      expect(result).toBeNull();
    });

    it('should return null when notification belongs to another user', async () => {
      notificationsRepo.findById.mockResolvedValue({ ...mockNotification, userId: 99 } as any);

      const result = await service.markAsRead(1, 1);
      expect(result).toBeNull();
    });

    it('should mark notification as read for owning user', async () => {
      notificationsRepo.findById.mockResolvedValue(mockNotification as any);
      notificationsRepo.markAsRead.mockResolvedValue({ ...mockNotification, isRead: true } as any);

      const result = await service.markAsRead(1, 1);
      expect(result?.isRead).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should delegate to repository', async () => {
      notificationsRepo.markAllAsRead.mockResolvedValue(5);

      const result = await service.markAllAsRead(1);
      expect(result).toBe(5);
    });
  });

  describe('deleteNotification', () => {
    it('should return false for non-owned notification', async () => {
      notificationsRepo.findById.mockResolvedValue({ ...mockNotification, userId: 99 } as any);

      const result = await service.deleteNotification(1, 1);
      expect(result).toBe(false);
    });

    it('should return true and mark as read for owned notification', async () => {
      notificationsRepo.findById.mockResolvedValue(mockNotification as any);

      const result = await service.deleteNotification(1, 1);
      expect(result).toBe(true);
    });
  });

  describe('getPreferences', () => {
    it('should return defaults when no preferences exist', async () => {
      preferencesRepo.findByUserId.mockResolvedValue(null);

      const result = await service.getPreferences(1);
      expect(result.emailEnrollments).toBe(true);
      expect(result.emailMarketing).toBe(false);
    });

    it('should return stored preferences when they exist', async () => {
      preferencesRepo.findByUserId.mockResolvedValue({
        emailEnrollments: false,
        emailMarketing: true,
      } as any);

      const result = await service.getPreferences(1);
      expect(result.emailEnrollments).toBe(false);
      expect(result.emailMarketing).toBe(true);
    });
  });

  describe('updatePreferences', () => {
    it('should merge with defaults and save', async () => {
      preferencesRepo.upsert.mockResolvedValue({} as any);
      preferencesRepo.findByUserId.mockResolvedValue({ emailEnrollments: false } as any);

      await service.updatePreferences(1, { emailEnrollments: false } as any);
      expect(preferencesRepo.upsert).toHaveBeenCalled();
    });
  });
});
