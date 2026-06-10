import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test/smoke', '<rootDir>/test/integration'],
  testMatch: [
    '**/__tests__/**/*.spec.ts',
    '**/?(*.)+(spec).ts',
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.service.ts',
    'src/**/*.repository.ts',
    'src/**/*.strategy.ts',
    'src/**/*.guard.ts',
    'src/**/*.interceptor.ts',
    'src/**/*.filter.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.mock.ts',
    '!src/main.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/modules/auth/**/*.{ts}': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/modules/payments/**/*.{ts}': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/modules/enrollments/**/*.{ts}': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/modules/certificates/**/*.{ts}': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  verbose: true,
  testTimeout: 30000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

export default config;
