// Smoke test — verify test helpers work correctly

import { createMock } from '../helpers';

describe('Test Helpers', () => {
  describe('createMock', () => {
    it('creates a mock with all methods as jest.fn()', () => {
      interface TestService {
        findOne: (id: number) => Promise<any>;
        findAll: () => Promise<any[]>;
        create: (data: any) => Promise<any>;
      }

      const mock = createMock<TestService>();

      expect(mock.findOne).toBeDefined();
      expect(mock.findAll).toBeDefined();
      expect(mock.create).toBeDefined();
      expect(jest.isMockFunction(mock.findOne)).toBe(true);
      expect(jest.isMockFunction(mock.findAll)).toBe(true);
      expect(jest.isMockFunction(mock.create)).toBe(true);
    });

    it('allows overriding specific methods', () => {
      interface Repo {
        findById: (id: number) => Promise<any>;
        save: (data: any) => Promise<any>;
      }

      const mockData = { id: 1, name: 'Test' };
      const mock = createMock<Repo>({
        findById: jest.fn().mockResolvedValue(mockData),
      });

      expect(mock.findById(1)).resolves.toEqual(mockData);
      // save should still be a default jest.fn()
      expect(jest.isMockFunction(mock.save)).toBe(true);
      expect(mock.save).not.toHaveBeenCalled();
    });

    it('returns undefined for non-function properties', () => {
      interface Config {
        value: string;
        getValue: () => string;
      }

      const mock = createMock<Config>({ value: 'test' });
      expect(mock.value).toBe('test');
      expect(jest.isMockFunction(mock.getValue)).toBe(true);
    });
  });
});
