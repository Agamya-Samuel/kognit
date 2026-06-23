import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NEXT_PUBLIC_API_URL': JSON.stringify('http://localhost:3000/api/v1'),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    exclude: ['src/test/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        'src/main.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@edutech/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@edutech/types': path.resolve(__dirname, '../../packages/types/src'),
      '@edutech/validation': path.resolve(__dirname, '../../packages/validation/src'),
      '@edutech/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
      '@edutech/shared-components': path.resolve(__dirname, '../../packages/shared-components/src'),
    },
  },
});
