import { Test, type TestingModule } from '@nestjs/testing';
import type { ModuleMetadata } from '@nestjs/common';

/**
 * Creates a NestJS testing module with the given metadata.
 * Wraps Test.createTestingModule for consistent test module creation.
 */
export async function createTestingModule(
  metadata: ModuleMetadata,
): Promise<TestingModule> {
  return Test.createTestingModule(metadata).compile();
}

/**
 * Creates a mock object with all methods jest.fn().
 * Useful for mocking services and repositories.
 *
 * @example
 * const mockUserRepo = createMock<UsersRepository>({
 *   findById: jest.fn().mockResolvedValue(mockUser),
 *   findAll: jest.fn().mockResolvedValue([]),
 * });
 */
export function createMock<T extends object>(
  overrides: Partial<Record<keyof T, any>> = {},
): T {
  return new Proxy({} as T, {
    get: (_target, prop) => {
      if (prop in overrides) {
        return overrides[prop as keyof T];
      }
      if (typeof prop === 'string') {
        return jest.fn();
      }
      return undefined;
    },
  });
}
