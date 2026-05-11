// Test setup — runs before each test suite
// Extend Jest matchers and configure global test utilities

expect.extend({
  toBeValidISODate(received: string) {
    const pass = !isNaN(Date.parse(received));
    return {
      pass,
      message: () =>
        pass
          ? `Expected ${received} not to be a valid ISO date`
          : `Expected ${received} to be a valid ISO date`,
    };
  },
});

// Suppress console.error output during tests unless explicitly enabled
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
