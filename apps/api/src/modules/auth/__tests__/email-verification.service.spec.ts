import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailVerificationService } from '../services/email-verification.service';
import { EmailVerificationsRepository } from '../../../db/repositories/email-verifications.repository';
import { UsersRepository } from '../../../db/repositories/users.repository';

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;
  let emailVerificationsRepo: jest.Mocked<EmailVerificationsRepository>;
  let usersRepo: jest.Mocked<UsersRepository>;

  const mockVerification = {
    id: 1,
    userId: 1,
    tokenHash: '$2b$10$abcdefghijklmnopqrstuv',
    expiresAt: new Date(Date.now() + 600000),
    verified: false,
    purpose: 'email_verify',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
        {
          provide: EmailVerificationsRepository,
          useValue: {
            create: jest.fn(),
            findActiveByUserId: jest.fn(),
            markAsVerified: jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailVerificationService>(EmailVerificationService);
    emailVerificationsRepo = module.get(EmailVerificationsRepository);
    usersRepo = module.get(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCode', () => {
    it('should generate a 6-digit code and store it hashed', async () => {
      emailVerificationsRepo.findActiveByUserId.mockResolvedValue(null);
      emailVerificationsRepo.create.mockResolvedValue(mockVerification as any);

      const code = await service.generateCode(1);
      expect(code).toMatch(/^\d{6}$/);
      expect(emailVerificationsRepo.create).toHaveBeenCalled();
    });

    it('should invalidate previous active code when generating a new one', async () => {
      emailVerificationsRepo.findActiveByUserId.mockResolvedValue(mockVerification as any);
      emailVerificationsRepo.create.mockResolvedValue(mockVerification as any);

      await service.generateCode(1);
      expect(emailVerificationsRepo.markAsVerified).toHaveBeenCalledWith(1);
    });
  });

  describe('verifyCode', () => {
    it('should throw BadRequestException when no active verification exists', async () => {
      emailVerificationsRepo.findActiveByUserId.mockResolvedValue(null);

      await expect(service.verifyCode(1, '123456')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired code', async () => {
      const expired = { ...mockVerification, expiresAt: new Date(Date.now() - 1000) };
      emailVerificationsRepo.findActiveByUserId.mockResolvedValue(expired as any);

      await expect(service.verifyCode(1, '123456')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid code', async () => {
      emailVerificationsRepo.findActiveByUserId.mockResolvedValue(mockVerification as any);

      await expect(service.verifyCode(1, '999999')).rejects.toThrow(BadRequestException);
    });

    it('should mark user as verified on valid code', async () => {
      const validCode = '123456';
      const codeHash = await bcrypt.hash(validCode, 10);
      const verification = { ...mockVerification, tokenHash: codeHash };
      emailVerificationsRepo.findActiveByUserId.mockResolvedValue(verification as any);

      const result = await service.verifyCode(1, validCode);
      expect(result).toBe(true);
      expect(usersRepo.update).toHaveBeenCalledWith(1, { isVerified: true });
    });
  });

  describe('verifyCodeByEmail', () => {
    it('should throw BadRequestException when user not found', async () => {
      usersRepo.findByEmail.mockResolvedValue(null);

      await expect(service.verifyCodeByEmail('a@b.com', '123456')).rejects.toThrow(BadRequestException);
    });

    it('should return user id on successful verification', async () => {
      const validCode = '123456';
      const codeHash = await bcrypt.hash(validCode, 10);
      usersRepo.findByEmail.mockResolvedValue({ id: 5, email: 'a@b.com' } as any);
      emailVerificationsRepo.findActiveByUserId.mockResolvedValue({
        ...mockVerification,
        userId: 5,
        tokenHash: codeHash,
      } as any);

      const userId = await service.verifyCodeByEmail('a@b.com', validCode);
      expect(userId).toBe(5);
    });
  });
});
