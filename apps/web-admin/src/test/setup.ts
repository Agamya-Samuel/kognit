import '@testing-library/jest-dom/vitest';
import { initApiClient } from '@edutech/api-client';

// Initialize API client for tests
initApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
});
