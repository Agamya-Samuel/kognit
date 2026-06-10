import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UsersRepository } from '../../../db/repositories/users.repository';
import { StudentProfilesRepository } from '../../../db/repositories/student-profiles.repository';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: jest.Mocked<UsersRepository>;
  let studentProfilesRepo: jest.Mocked<StudentProfilesRepository>;

  const mockStudent = {
    id: 1,
    email: 'student@test.com',
    name: 'Test Student',
    role: 'student',
    onboardingCompleted: true,
  };

  const mockInstructor = {
    id: 2,
    email: 'teacher@test.com',
    name: 'Test Instructor',
    role: 'instructor',
    onboardingCompleted: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: StudentProfilesRepository,
          useValue: {
            findByUserId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepo = module.get(UsersRepository);
    studentProfilesRepo = module.get(StudentProfilesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      usersRepo.findById.mockResolvedValue(mockStudent as any);

      const result = await service.getProfile(1);
      expect(result).toEqual(mockStudent);
    });

    it('should throw InternalServerErrorException when user not found', async () => {
      usersRepo.findById.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateProfile', () => {
    it('should throw InternalServerErrorException when user not found', async () => {
      usersRepo.findById.mockResolvedValue(null);

      await expect(service.updateProfile(999, { name: 'New' })).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw ForbiddenException when student tries to change name after onboarding', async () => {
      usersRepo.findById.mockResolvedValue(mockStudent as any);

      await expect(
        service.updateProfile(1, { name: 'New Name' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow student to keep same name', async () => {
      usersRepo.findById.mockResolvedValue(mockStudent as any);
      usersRepo.findById.mockResolvedValueOnce(mockStudent as any);
      usersRepo.findById.mockResolvedValueOnce(mockStudent as any);
      studentProfilesRepo.findByUserId.mockResolvedValue({ id: 1 } as any);

      await expect(
        service.updateProfile(1, { name: 'Test Student' }),
      ).resolves.toBeDefined();
    });

    it('should allow instructor to change name freely', async () => {
      usersRepo.findById.mockResolvedValue(mockInstructor as any);
      usersRepo.findById.mockResolvedValueOnce(mockInstructor as any);
      usersRepo.findById.mockResolvedValueOnce({ ...mockInstructor, name: 'New' } as any);

      const result = await service.updateProfile(2, { name: 'New' });
      expect(result.name).toBe('New');
    });

    it('should update student profile when fields provided', async () => {
      usersRepo.findById.mockResolvedValue(mockStudent as any);
      usersRepo.findById.mockResolvedValueOnce(mockStudent as any);
      usersRepo.findById.mockResolvedValueOnce(mockStudent as any);
      studentProfilesRepo.findByUserId.mockResolvedValue({ id: 5 } as any);

      await service.updateProfile(1, { mobile: '1234567890' });
      expect(studentProfilesRepo.update).toHaveBeenCalledWith(5, expect.objectContaining({ mobile: '1234567890' }));
    });

    it('should create new student profile on first onboarding', async () => {
      usersRepo.findById.mockResolvedValue({ ...mockStudent, onboardingCompleted: false } as any);
      usersRepo.findById.mockResolvedValueOnce({ ...mockStudent, onboardingCompleted: false } as any);
      usersRepo.findById.mockResolvedValueOnce({ ...mockStudent, onboardingCompleted: false } as any);
      studentProfilesRepo.findByUserId.mockResolvedValue(null);

      await service.updateProfile(1, { mobile: '123', name: 'Test Student' });
      expect(studentProfilesRepo.create).toHaveBeenCalled();
    });
  });
});
