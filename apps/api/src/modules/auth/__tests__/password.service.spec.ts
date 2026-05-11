import { PasswordService } from '../services/password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  describe('hash', () => {
    it('should hash a password with bcrypt (12 rounds)', async () => {
      const hash = await service.hash('Password123');
      expect(hash).toBeDefined();
      expect(hash).not.toBe('Password123');
      expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt format
    });

    it('should produce different hashes for the same password', async () => {
      const hash1 = await service.hash('Password123');
      const hash2 = await service.hash('Password123');
      expect(hash1).not.toBe(hash2); // different salts
    });
  });

  describe('compare', () => {
    it('should return true for correct password', async () => {
      const hash = await service.hash('Password123');
      expect(await service.compare('Password123', hash)).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const hash = await service.hash('Password123');
      expect(await service.compare('WrongPassword', hash)).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hash = await service.hash('Password123');
      expect(await service.compare('', hash)).toBe(false);
    });
  });
});
