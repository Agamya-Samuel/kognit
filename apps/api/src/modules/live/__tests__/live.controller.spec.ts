import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { LiveController } from '../live.controller';
import { LiveKitService } from '../services/livekit.service';
import { ScheduleService } from '../services/schedule.service';
import { RecordingService } from '../services/recording.service';
import { LiveNotificationService } from '../services/live-notification.service';
import { LiveClassesRepository } from '../../../db/repositories/live-classes.repository';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../../db/repositories/sections.repository';
import { ConfigService } from '@nestjs/config';

describe('LiveController', () => {
  let controller: LiveController;
  let livekitService: LiveKitService;
  let liveClassesRepo: LiveClassesRepository;

  const mockUser = { sub: 1, role: 'instructor', email: 'instructor@test.com' };
  const mockStudentUser = { sub: 5, role: 'student', email: 'student@test.com' };

  const mockLiveClass = {
    id: 10,
    lectureId: 20,
    instructorId: 1,
    scheduledAt: new Date(),
    durationMinutes: 60,
    livekitRoomName: 'class-10',
    recordingUrl: null,
    status: 'scheduled',
    createdAt: new Date(),
  };

  const mockLiveClassLive = { ...mockLiveClass, status: 'live' };

  const mockRoomInfo = {
    roomName: 'class-10',
    sid: 'RM_sid123',
    participants: 3,
    maxParticipants: 100,
    createdAt: '1700000000000',
    active: true,
  };

  const mockTokenResult = {
    token: 'jwt_token_string',
    identity: 'instructor-1',
    roomName: 'class-10',
    expiresIn: 3600,
  };

  const mockStudentTokenResult = {
    token: 'jwt_student_token',
    identity: 'student-5',
    roomName: 'class-10',
    expiresIn: 3600,
  };

  const mockLiveClassesRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockEnrollmentsRepo = {
    checkEnrollmentExists: jest.fn(),
  };

  const mockLecturesRepo = {
    findById: jest.fn(),
  };

  const mockSectionsRepo = {
    findById: jest.fn(),
  };

  const mockLiveKitService = {
    createRoom: jest.fn(),
    getRoomInfo: jest.fn(),
    deleteRoom: jest.fn(),
    listParticipants: jest.fn(),
    removeParticipant: jest.fn(),
    generateInstructorToken: jest.fn(),
    generateStudentToken: jest.fn(),
  };

  const mockScheduleService = {
    createSchedule: jest.fn(),
    getSchedule: jest.fn(),
    updateSchedule: jest.fn(),
    cancelSchedule: jest.fn(),
    getInstructorCalendar: jest.fn(),
    getStudentCalendar: jest.fn(),
    getUpcomingClasses: jest.fn(),
    getStudentUpcomingClasses: jest.fn(),
  };

  const mockRecordingService = {
    startRecording: jest.fn(),
    getRecordingInfo: jest.fn(),
    handleRecordingComplete: jest.fn(),
    runPostSessionWorkflow: jest.fn(),
    retryRecording: jest.fn(),
  };

  const mockNotificationService = {
    notifyClassScheduled: jest.fn(),
    notifyClassCancelled: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('wss://test.livekit.cloud'),
  };

  beforeEach(async () => {
    // Restore config mock after clearAllMocks from previous afterEach
    mockConfigService.get.mockReturnValue('wss://test.livekit.cloud');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiveController],
      providers: [
        { provide: LiveKitService, useValue: mockLiveKitService },
        { provide: ScheduleService, useValue: mockScheduleService },
        { provide: RecordingService, useValue: mockRecordingService },
        { provide: LiveNotificationService, useValue: mockNotificationService },
        { provide: LiveClassesRepository, useValue: mockLiveClassesRepo },
        { provide: EnrollmentsRepository, useValue: mockEnrollmentsRepo },
        { provide: LecturesRepository, useValue: mockLecturesRepo },
        { provide: SectionsRepository, useValue: mockSectionsRepo },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<LiveController>(LiveController);
    livekitService = module.get<LiveKitService>(LiveKitService);
    liveClassesRepo = module.get<LiveClassesRepository>(LiveClassesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── startLiveClass ────────────────────────────────────────────────────────

  describe('startLiveClass', () => {
    it('should start a live class and return an instructor token', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(mockLiveClass);
      mockLiveKitService.createRoom.mockResolvedValue(mockRoomInfo);
      mockLiveClassesRepo.update.mockResolvedValue({ ...mockLiveClass, status: 'live' });
      mockLiveKitService.generateInstructorToken.mockResolvedValue(mockTokenResult);

      const result = await controller.startLiveClass(mockUser, {
        liveClassId: 10,
      });

      expect(result.token).toBe('jwt_token_string');
      expect(result.identity).toBe('instructor-1');
      expect(result.roomName).toBe('class-10');
      expect(result.livekitUrl).toBe('wss://test.livekit.cloud');
      expect(mockLiveClassesRepo.update).toHaveBeenCalledWith(10, {
        status: 'live',
      });
    });

    it('should throw NotFoundException when class does not exist', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(null);

      await expect(
        controller.startLiveClass(mockUser, { liveClassId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the instructor', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(mockLiveClass);

      await expect(
        controller.startLiveClass(
          { sub: 99, role: 'instructor', email: 'other@test.com' },
          { liveClassId: 10 },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when class is not in scheduled status', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(mockLiveClassLive);

      await expect(
        controller.startLiveClass(mockUser, { liveClassId: 10 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── joinLiveClass ─────────────────────────────────────────────────────────

  describe('joinLiveClass', () => {
    it('should allow a student to join and return a subscriber token', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(mockLiveClassLive);
      mockLecturesRepo.findById.mockResolvedValue({ id: 20, sectionId: 30 });
      mockSectionsRepo.findById.mockResolvedValue({ id: 30, courseId: 100 });
      mockEnrollmentsRepo.checkEnrollmentExists.mockResolvedValue(true);
      mockLiveKitService.getRoomInfo.mockResolvedValue(mockRoomInfo);
      mockLiveKitService.generateStudentToken.mockResolvedValue(
        mockStudentTokenResult,
      );

      const result = await controller.joinLiveClass(mockStudentUser, {
        liveClassId: 10,
      });

      expect(result.token).toBe('jwt_student_token');
      expect(result.identity).toBe('student-5');
      expect(result.livekitUrl).toBe('wss://test.livekit.cloud');
    });

    it('should throw NotFoundException when class does not exist', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(null);

      await expect(
        controller.joinLiveClass(mockStudentUser, { liveClassId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when class is not live', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(mockLiveClass);

      await expect(
        controller.joinLiveClass(mockStudentUser, { liveClassId: 10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when student is not enrolled', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(mockLiveClassLive);
      mockLecturesRepo.findById.mockResolvedValue({ id: 20, sectionId: 30 });
      mockSectionsRepo.findById.mockResolvedValue({ id: 30, courseId: 100 });
      mockEnrollmentsRepo.checkEnrollmentExists.mockResolvedValue(false);

      await expect(
        controller.joinLiveClass(mockStudentUser, { liveClassId: 10 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when room is no longer active', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(mockLiveClassLive);
      mockLecturesRepo.findById.mockResolvedValue({ id: 20, sectionId: 30 });
      mockSectionsRepo.findById.mockResolvedValue({ id: 30, courseId: 100 });
      mockEnrollmentsRepo.checkEnrollmentExists.mockResolvedValue(true);
      mockLiveKitService.getRoomInfo.mockResolvedValue(null);

      await expect(
        controller.joinLiveClass(mockStudentUser, { liveClassId: 10 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── endLiveClass ──────────────────────────────────────────────────────────

  describe('endLiveClass', () => {
    it('should end a live class and delete the room', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(mockLiveClassLive);
      mockLiveKitService.deleteRoom.mockResolvedValue(undefined);
      mockLiveClassesRepo.update.mockResolvedValue({
        ...mockLiveClassLive,
        status: 'ended',
      });

      const result = await controller.endLiveClass(mockUser, {
        liveClassId: 10,
      });

      expect(result.message).toBe('Live class ended successfully');
      expect(mockLiveKitService.deleteRoom).toHaveBeenCalledWith('class-10');
      expect(mockLiveClassesRepo.update).toHaveBeenCalledWith(10, {
        status: 'ended',
      });
    });

    it('should save recording URL when provided', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(mockLiveClassLive);
      mockLiveKitService.deleteRoom.mockResolvedValue(undefined);
      mockLiveClassesRepo.update.mockResolvedValue({
        ...mockLiveClassLive,
        status: 'ended',
        recordingUrl: 'https://recording.example.com/video.mp4',
      });

      await controller.endLiveClass(mockUser, {
        liveClassId: 10,
        recordingUrl: 'https://recording.example.com/video.mp4',
      });

      expect(mockLiveClassesRepo.update).toHaveBeenCalledWith(10, {
        status: 'ended',
        recordingUrl: 'https://recording.example.com/video.mp4',
      });
    });

    it('should throw NotFoundException when class does not exist', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(null);

      await expect(
        controller.endLiveClass(mockUser, { liveClassId: 999 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the instructor', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(mockLiveClassLive);

      await expect(
        controller.endLiveClass(
          { sub: 99, role: 'instructor' },
          { liveClassId: 10 },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when class is not live', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(mockLiveClass);

      await expect(
        controller.endLiveClass(mockUser, { liveClassId: 10 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── getStatus ─────────────────────────────────────────────────────────────

  describe('getStatus', () => {
    it('should return class status with participant count when live', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(mockLiveClassLive);
      mockLiveKitService.getRoomInfo.mockResolvedValue(mockRoomInfo);

      const result = await controller.getStatus('10');

      expect(result).toEqual({
        liveClassId: 10,
        status: 'live',
        roomName: 'class-10',
        participantCount: 3,
        maxParticipants: 100,
        recordingUrl: undefined,
      });
    });

    it('should return class status without participant count when not live', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(mockLiveClass);

      const result = await controller.getStatus('10');

      expect(result.participantCount).toBeUndefined();
      expect(result.maxParticipants).toBeUndefined();
    });

    it('should throw NotFoundException when class does not exist', async () => {
      mockLiveClassesRepo.findById.mockResolvedValue(null);

      await expect(controller.getStatus('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── getRoomInfo ───────────────────────────────────────────────────────────

  describe('getRoomInfo', () => {
    it('should return room info for an active room', async () => {
      mockLiveKitService.getRoomInfo.mockResolvedValue(mockRoomInfo);

      const result = await controller.getRoomInfo('class-10');

      expect(result).toEqual(mockRoomInfo);
    });

    it('should throw NotFoundException when room does not exist', async () => {
      mockLiveKitService.getRoomInfo.mockResolvedValue(null);

      await expect(controller.getRoomInfo('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
