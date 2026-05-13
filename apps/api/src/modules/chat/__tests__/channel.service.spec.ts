import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ChannelService } from '../services/channel.service';
import { ChannelsRepository } from '../../../db/repositories/channels.repository';
import { ChannelMembersRepository } from '../../../db/repositories/channel-members.repository';
import type { Channel, ChannelMember } from '../../../db/schema';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ChannelService', () => {
  let service: ChannelService;
  let channelsRepo: jest.Mocked<ChannelsRepository>;
  let channelMembersRepo: jest.Mocked<ChannelMembersRepository>;

  const mockChannel: Channel = {
    id: 10,
    courseId: 1,
    type: 'course',
    name: 'General Chat',
    createdAt: new Date(),
  } as Channel;

  const mockMember: ChannelMember = {
    id: 1,
    channelId: 10,
    userId: 100,
    joinedAt: new Date(),
    lastReadAt: null,
  } as ChannelMember;

  beforeEach(async () => {
    const mockChannelsRepo = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findByCourse: jest.fn(),
    };

    const mockChannelMembersRepo = {
      findByChannelAndUser: jest.fn(),
      addMember: jest.fn(),
      removeMember: jest.fn(),
      findMembersByChannel: jest.fn(),
      findChannelsByUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        { provide: ChannelsRepository, useValue: mockChannelsRepo },
        { provide: ChannelMembersRepository, useValue: mockChannelMembersRepo },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
    channelsRepo = module.get(ChannelsRepository);
    channelMembersRepo = module.get(ChannelMembersRepository);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── createChannel ───────────────────────────────────────────────────────

  describe('createChannel', () => {
    it('should create a channel and auto-join the creator', async () => {
      channelsRepo.create.mockResolvedValue(mockChannel);
      channelMembersRepo.addMember.mockResolvedValue(mockMember);

      const result = await service.createChannel('General Chat', 'course', 100, 1);
      expect(result).toEqual(mockChannel);
      expect(channelsRepo.create).toHaveBeenCalledWith({
        name: 'General Chat',
        type: 'course',
        courseId: 1,
      });
      expect(channelMembersRepo.addMember).toHaveBeenCalledWith(10, 100);
    });

    it('should create a general channel without courseId', async () => {
      const generalChannel = { ...mockChannel, courseId: null, type: 'general' as const };
      channelsRepo.create.mockResolvedValue(generalChannel as Channel);
      channelMembersRepo.addMember.mockResolvedValue(mockMember);

      const result = await service.createChannel('Random', 'general', 100);
      expect(result.type).toBe('general');
      expect(channelsRepo.create).toHaveBeenCalledWith({
        name: 'Random',
        type: 'general',
        courseId: null,
      });
    });
  });

  // ─── getChannels ─────────────────────────────────────────────────────────

  describe('getChannels', () => {
    it('should return a list of channels', async () => {
      const paginated = { data: [mockChannel], total: 1, limit: 20, offset: 0 };
      channelsRepo.findMany.mockResolvedValue(paginated);

      const result = await service.getChannels(100, { courseId: 1 });
      expect(result.data).toHaveLength(1);
    });
  });

  // ─── getChannel ──────────────────────────────────────────────────────────

  describe('getChannel', () => {
    it('should return a channel by ID', async () => {
      channelsRepo.findById.mockResolvedValue(mockChannel);

      const result = await service.getChannel(10);
      expect(result).toEqual(mockChannel);
    });

    it('should throw NotFoundException for missing channel', async () => {
      channelsRepo.findById.mockResolvedValue(null);
      await expect(service.getChannel(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── updateChannel ───────────────────────────────────────────────────────

  describe('updateChannel', () => {
    it('should allow admin to update channel name', async () => {
      const updated = { ...mockChannel, name: 'Updated' };
      channelsRepo.findById.mockResolvedValue(mockChannel);
      channelsRepo.update.mockResolvedValue(updated);

      const result = await service.updateChannel(10, 'Updated', 300, 'admin');
      expect(result.name).toBe('Updated');
    });

    it('should allow instructor to update channel name', async () => {
      channelsRepo.findById.mockResolvedValue(mockChannel);
      channelsRepo.update.mockResolvedValue({ ...mockChannel, name: 'New Name' });

      const result = await service.updateChannel(10, 'New Name', 200, 'instructor');
      expect(result.name).toBe('New Name');
    });

    it('should reject student from updating channel', async () => {
      channelsRepo.findById.mockResolvedValue(mockChannel);
      await expect(service.updateChannel(10, 'Hack', 100, 'student'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if channel missing', async () => {
      channelsRepo.findById.mockResolvedValue(null);
      await expect(service.updateChannel(999, 'X', 300, 'admin'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ─── joinChannel ─────────────────────────────────────────────────────────

  describe('joinChannel', () => {
    it('should add a new member to a channel', async () => {
      channelsRepo.findById.mockResolvedValue(mockChannel);
      channelMembersRepo.findByChannelAndUser.mockResolvedValue(null);
      channelMembersRepo.addMember.mockResolvedValue(mockMember);

      const result = await service.joinChannel(10, 100);
      expect(result).toEqual(mockMember);
    });

    it('should reject if already a member', async () => {
      channelsRepo.findById.mockResolvedValue(mockChannel);
      channelMembersRepo.findByChannelAndUser.mockResolvedValue(mockMember);

      await expect(service.joinChannel(10, 100)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for missing channel', async () => {
      channelsRepo.findById.mockResolvedValue(null);
      await expect(service.joinChannel(999, 100)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── leaveChannel ────────────────────────────────────────────────────────

  describe('leaveChannel', () => {
    it('should remove member from channel', async () => {
      channelsRepo.findById.mockResolvedValue(mockChannel);
      channelMembersRepo.removeMember.mockResolvedValue(true);

      const result = await service.leaveChannel(10, 100);
      expect(result).toBe(true);
    });

    it('should throw NotFoundException for missing channel', async () => {
      channelsRepo.findById.mockResolvedValue(null);
      await expect(service.leaveChannel(999, 100)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── listMembers ─────────────────────────────────────────────────────────

  describe('listMembers', () => {
    it('should list members for a channel member', async () => {
      channelsRepo.findById.mockResolvedValue(mockChannel);
      channelMembersRepo.findByChannelAndUser.mockResolvedValue(mockMember);
      channelMembersRepo.findMembersByChannel.mockResolvedValue([mockMember]);

      const result = await service.listMembers(10, 100);
      expect(result).toHaveLength(1);
    });

    it('should reject non-member from listing members', async () => {
      channelsRepo.findById.mockResolvedValue(mockChannel);
      channelMembersRepo.findByChannelAndUser.mockResolvedValue(null);

      await expect(service.listMembers(10, 100)).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── getCourseChannels ───────────────────────────────────────────────────

  describe('getCourseChannels', () => {
    it('should return channels for a course', async () => {
      channelsRepo.findByCourse.mockResolvedValue({ data: [mockChannel], total: 1, limit: 20, offset: 0 });
      const result = await service.getCourseChannels(1);
      expect(result.data).toHaveLength(1);
    });
  });

  // ─── getUserChannels ─────────────────────────────────────────────────────

  describe('getUserChannels', () => {
    it('should return channels for a user', async () => {
      channelMembersRepo.findChannelsByUser.mockResolvedValue([mockMember]);
      const result = await service.getUserChannels(100);
      expect(result).toHaveLength(1);
    });
  });
});
