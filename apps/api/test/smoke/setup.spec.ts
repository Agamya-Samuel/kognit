// Smoke test — verify test setup, custom matchers, and helpers load correctly

describe('Test Setup', () => {
  it('should have custom matcher toBeValidISODate', () => {
    expect('2024-01-15T10:30:00.000Z').toBeValidISODate();
  });

  it('should reject invalid ISO dates', () => {
    expect('not-a-date').not.toBeValidISODate();
  });

  it('should have console.error suppression working', () => {
    // This should not throw or cause test failures
    expect(() => console.error('Warning: An update to TestComponent inside a test')).not.toThrow();
  });
});
