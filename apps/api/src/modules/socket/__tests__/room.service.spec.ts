import { Test, TestingModule } from '@nestjs/testing';
import { RoomService, RoomType, RoomInfo } from '../services/room.service';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import { LiveClassesRepository } from '../../../db/repositories/live-classes.repository';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../../db/repositories/sections.repository';

describe('RoomService', () => {
  let service: RoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        { provide: EnrollmentsRepository, useValue: {} },
        { provide: LiveClassesRepository, useValue: {} },
        { provide: LecturesRepository, useValue: {} },
        { provide: SectionsRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
  });

  describe('buildRoomName', () => {
    it('should build a course room name', () => {
      expect(service.buildRoomName('course', '42')).toBe('course:42');
    });

    it('should build a live room name', () => {
      expect(service.buildRoomName('live', 'abc-123')).toBe('live:abc-123');
    });

    it('should build a general room name', () => {
      expect(service.buildRoomName('general', 'announcements')).toBe('general:announcements');
    });
  });

  describe('parseRoomName', () => {
    it('should parse a valid course room', () => {
      const result = service.parseRoomName('course:42');
      expect(result).toEqual({ type: 'course', id: '42', fullName: 'course:42' });
    });

    it('should parse a valid live room', () => {
      const result = service.parseRoomName('live:abc-123');
      expect(result).toEqual({ type: 'live', id: 'abc-123', fullName: 'live:abc-123' });
    });

    it('should parse a valid general room', () => {
      const result = service.parseRoomName('general:announcements');
      expect(result).toEqual({ type: 'general', id: 'announcements', fullName: 'general:announcements' });
    });

    it('should return null for invalid room format (no colon)', () => {
      expect(service.parseRoomName('invalidroom')).toBeNull();
    });

    it('should return null for unknown room type', () => {
      expect(service.parseRoomName('unknown:42')).toBeNull();
    });

    it('should return null for empty id', () => {
      expect(service.parseRoomName('course:')).toBeNull();
    });

    it('should return null for whitespace-only id', () => {
      expect(service.parseRoomName('course:   ')).toBeNull();
    });

    it('should return null for room with too many colons', () => {
      // Actually "course:42:extra" splits to 3 parts, so it returns null
      expect(service.parseRoomName('course:42:extra')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(service.parseRoomName('')).toBeNull();
    });
  });

  describe('isValidRoom', () => {
    it('should return true for valid rooms', () => {
      expect(service.isValidRoom('course:1')).toBe(true);
      expect(service.isValidRoom('live:xyz')).toBe(true);
      expect(service.isValidRoom('general:main')).toBe(true);
    });

    it('should return false for invalid rooms', () => {
      expect(service.isValidRoom('')).toBe(false);
      expect(service.isValidRoom('invalid')).toBe(false);
      expect(service.isValidRoom('badtype:42')).toBe(false);
      expect(service.isValidRoom('course:')).toBe(false);
    });
  });

  describe('canJoinRoom', () => {
    it('should allow any authenticated user to join course rooms', async () => {
      const result = await service.canJoinRoom('course:42', 1, 'student');
      expect(result.allowed).toBe(true);
    });

    it('should allow any authenticated user to join general rooms', async () => {
      const result = await service.canJoinRoom('general:announcements', 1, 'student');
      expect(result.allowed).toBe(true);
    });

    it('should require valid live class id for student to join live rooms', async () => {
      const result = await service.canJoinRoom('live:class-1', 1, 'student');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Invalid live class ID');
    });

    it('should allow instructors to join live rooms', async () => {
      const result = await service.canJoinRoom('live:class-1', 1, 'instructor');
      expect(result.allowed).toBe(true);
    });

    it('should deny access for invalid room name', async () => {
      const result = await service.canJoinRoom('invalid:room', 1, 'student');
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('Invalid room name format');
    });

    it('should deny access for empty room', async () => {
      const result = await service.canJoinRoom('', 1, 'student');
      expect(result.allowed).toBe(false);
    });
  });
});
