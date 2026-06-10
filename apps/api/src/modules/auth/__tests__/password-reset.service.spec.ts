import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordResetService } from '../services/password-reset.service';
import { PasswordResetsRepository } from '../../../db/repositories/password-resets.repository';
import { UsersRepository } from '../../../db/repositories/users.repository';
import { PasswordService } from '../services/password.service';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let passwordResetsRepo: jest.Mocked<PasswordResetsRepository>;
  let usersRepo: jest.Mocked<UsersRepository>;
  let passwordService: jest.Mocked<PasswordService>;

  const mockUser = {
    id: 1,
    email: 'a@b.com',
    name: 'Test User',
  };

  const mockResetRecord = {
    id: 1,
    userId: 1,
    tokenHash: '',
    expiresAt: new Date(Date.now() + 3600000),
    used: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: PasswordResetsRepository,
          useValue: {
            create: jest.fn(),
            findActiveByUserId: jest.fn(),
            markAsUsed: jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashed_password'),
          },
        },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
    passwordResetsRepo = module.get(PasswordResetsRepository);
    usersRepo = module.get(UsersRepository);
    passwordService = module.get(PasswordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateResetToken', () => {
    it('should return placeholder for non-existent email (security)', async () => {
      usersRepo.findByEmail.mockResolvedValue(null);

      const result = await service.generateResetToken('unknown@b.com');
      expect(result).toBe('token-not-generated');
      expect(passwordResetsRepo.create).not.toHaveBeenCalled();
    });

    it('should generate token for existing user', async () => {
      usersRepo.findByEmail.mockResolvedValue(mockUser as any);
      passwordResetsRepo.findActiveByUserId.mockResolvedValue(null);
      passwordResetsRepo.create.mockResolvedValue(mockResetRecord as any);

      const token = await service.generateResetToken('a@b.com');
      expect(token).toMatch(/^[a-f0-9]{64}$/);
      expect(passwordResetsRepo.create).toHaveBeenCalled();
    });

    it('should invalidate previous active token', async () => {
      usersRepo.findByEmail.mockResolvedValue(mockUser as any);
      passwordResetsRepo.findActiveByUserId.mockResolvedValue(mockResetRecord as any);
      passwordResetsRepo.create.mockResolvedValue(mockResetRecord as any);

      await service.generateResetToken('a@b.com');
      expect(passwordResetsRepo.markAsUsed).toHaveBeenCalledWith(1);
    });
  });

  describe('resetPasswordWithEmail', () => {
    it('should throw BadRequestException when user not found', async () => {
      usersRepo.findByEmail.mockResolvedValue(null);

      await expect(
        service.resetPasswordWithEmail('a@b.com', 'token', 'newpass'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no active reset exists', async () => {
      usersRepo.findByEmail.mockResolvedValue(mockUser as any);
      passwordResetsRepo.findActiveByUserId.mockResolvedValue(null);

      await expect(
        service.resetPasswordWithEmail('a@b.com', 'token', 'newpass'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for expired token', async () => {
      usersRepo.findByEmail.mockResolvedValue(mockUser as any);
      passwordResetsRepo.findActiveByUserId.mockResolvedValue({
        ...mockResetRecord,
        expiresAt: new Date(Date.now() - 1000),
      } as any);

      await expect(
        service.resetPasswordWithEmail('a@b.com', 'token', 'newpass'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid token', async () => {
      usersRepo.findByEmail.mockResolvedValue(mockUser as any);
      const realHash = await bcrypt.hash('real_token', 10);
      passwordResetsRepo.findActiveByUserId.mockResolvedValue({
        ...mockResetRecord,
        tokenHash: realHash,
      } as any);

      await expect(
        service.resetPasswordWithEmail('a@b.com', 'wrong_token', 'newpass'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reset password and mark token as used on success', async () => {
      const realToken = 'valid_token_abc';
      const realHash = await bcrypt.hash(realToken, 10);
      usersRepo.findByEmail.mockResolvedValue(mockUser as any);
      passwordResetsRepo.findActiveByUserId.mockResolvedValue({
        ...mockResetRecord,
        tokenHash: realHash,
      } as any);

      const result = await service.resetPasswordWithEmail('a@b.com', realToken, 'newpass');
      expect(result).toBe(true);
      expect(usersRepo.update).toHaveBeenCalledWith(1, { passwordHash: 'hashed_password' });
      expect(passwordResetsRepo.markAsUsed).toHaveBeenCalledWith(1);
    });
  });
});
