import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { StudentActivationService } from '../services/student-activation.service';
import { EmailVerificationsRepository } from '../../../db/repositories/email-verifications.repository';
import { UsersRepository } from '../../../db/repositories/users.repository';
import { StudentProfilesRepository } from '../../../db/repositories/student-profiles.repository';
import { PasswordService } from '../services/password.service';
import { TokenService } from '../services/token.service';

describe('StudentActivationService', () => {
  let service: StudentActivationService;
  let emailVerificationsRepo: jest.Mocked<EmailVerificationsRepository>;
  let usersRepo: jest.Mocked<UsersRepository>;
  let studentProfilesRepo: jest.Mocked<StudentProfilesRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let tokenService: jest.Mocked<TokenService>;

  const mockUser = {
    id: 1,
    email: 'student@test.com',
    name: 'New Student',
    role: 'student',
  };

  const mockTokenRecord = {
    id: 10,
    userId: 1,
    tokenHash: '',
    expiresAt: new Date(Date.now() + 100000000),
    verified: false,
    purpose: 'student_activation',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentActivationService,
        {
          provide: EmailVerificationsRepository,
          useValue: {
            create: jest.fn(),
            findByPurpose: jest.fn(),
            markAsVerified: jest.fn(),
          },
        },
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
        {
          provide: PasswordService,
          useValue: { hash: jest.fn().mockResolvedValue('hashed') },
        },
        {
          provide: TokenService,
          useValue: { generateTokenPair: jest.fn().mockResolvedValue({ access: 'a', refresh: 'r' }) },
        },
      ],
    }).compile();

    service = module.get<StudentActivationService>(StudentActivationService);
    emailVerificationsRepo = module.get(EmailVerificationsRepository);
    usersRepo = module.get(UsersRepository);
    studentProfilesRepo = module.get(StudentProfilesRepository);
    passwordService = module.get(PasswordService);
    tokenService = module.get(TokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateActivationToken', () => {
    it('should generate a token and store its hash', async () => {
      emailVerificationsRepo.create.mockResolvedValue(mockTokenRecord as any);

      const token = await service.generateActivationToken(1);
      expect(token).toMatch(/^[a-f0-9]{128}$/);
      expect(emailVerificationsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 1, purpose: 'student_activation' }),
      );
    });
  });

  describe('validateActivationToken', () => {
    it('should throw BadRequestException when no valid token is found', async () => {
      emailVerificationsRepo.findByPurpose.mockResolvedValue([]);

      await expect(service.validateActivationToken('bad_token')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired tokens', async () => {
      const expired = { ...mockTokenRecord, expiresAt: new Date(Date.now() - 1000) };
      emailVerificationsRepo.findByPurpose.mockResolvedValue([expired] as any);

      await expect(service.validateActivationToken('any')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for already verified tokens', async () => {
      const used = { ...mockTokenRecord, verified: true };
      emailVerificationsRepo.findByPurpose.mockResolvedValue([used] as any);

      await expect(service.validateActivationToken('any')).rejects.toThrow(BadRequestException);
    });

    it('should return user info for valid token', async () => {
      const realToken = 'valid_token_xyz';
      const realHash = await bcrypt.hash(realToken, 10);
      const record = { ...mockTokenRecord, tokenHash: realHash };
      emailVerificationsRepo.findByPurpose.mockResolvedValue([record] as any);
      usersRepo.findById.mockResolvedValue(mockUser as any);
      studentProfilesRepo.findByUserId.mockResolvedValue(null);

      const result = await service.validateActivationToken(realToken);
      expect(result.userId).toBe(1);
      expect(result.email).toBe('student@test.com');
    });
  });

  describe('completeActivation', () => {
    it('should create new profile when none exists', async () => {
      const realToken = 'valid_token_xyz';
      const realHash = await bcrypt.hash(realToken, 10);
      const record = { ...mockTokenRecord, tokenHash: realHash };
      emailVerificationsRepo.findByPurpose.mockResolvedValue([record] as any);
      usersRepo.findById.mockResolvedValue(mockUser as any);
      usersRepo.findById.mockResolvedValueOnce(mockUser as any);
      usersRepo.findById.mockResolvedValueOnce({ ...mockUser, isVerified: true } as any);
      studentProfilesRepo.findByUserId.mockResolvedValue(null);
      studentProfilesRepo.create.mockResolvedValue({ id: 1 } as any);

      const result = await service.completeActivation(
        realToken, 'Pass123!', 'Name', '9999999999',
        '123 St', 'City', 'State', '123456', 'India',
      );
      expect(studentProfilesRepo.create).toHaveBeenCalled();
      expect(result.tokens).toBeDefined();
    });

    it('should update existing profile when one exists', async () => {
      const realToken = 'valid_token_xyz';
      const realHash = await bcrypt.hash(realToken, 10);
      const record = { ...mockTokenRecord, tokenHash: realHash };
      emailVerificationsRepo.findByPurpose.mockResolvedValue([record] as any);
      usersRepo.findById.mockResolvedValue(mockUser as any);
      usersRepo.findById.mockResolvedValueOnce(mockUser as any);
      usersRepo.findById.mockResolvedValueOnce(mockUser as any);
      studentProfilesRepo.findByUserId.mockResolvedValue({ id: 5, userId: 1 } as any);

      await service.completeActivation(
        realToken, 'Pass123!', 'Name', '9999999999',
        '123 St', 'City', 'State', '123456', 'India',
      );
      expect(studentProfilesRepo.update).toHaveBeenCalledWith(5, expect.any(Object));
    });
  });
});
