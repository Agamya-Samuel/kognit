module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.mock.ts',
    '!src/main.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/auth/**/*.{js,ts}': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/payments/**/*.{js,ts}': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/enrollments/**/*.{js,ts}': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/certificates/**/*.{js,ts}': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '@edutech/(.*)': '<rootDir>/../$1/src',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  verbose: true,
};
