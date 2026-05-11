// Custom Jest matchers for test infrastructure

declare namespace jest {
  interface Matchers<R = void, T = {}> {
    toBeValidISODate(): R;
  }
}
