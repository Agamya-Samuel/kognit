import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW test server for Node.js environment (Vitest unit tests).
 * Call `server.listen()` before tests and `server.close()` after.
 *
 * Usage in test setup or individual test files:
 *   import { server } from '@/test/mocks/server';
 *   beforeAll(() => server.listen());
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 */
export const server = setupServer(...handlers);
