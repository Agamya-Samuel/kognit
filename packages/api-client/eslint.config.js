import tseslint from 'typescript-eslint';
import sharedConfig from '../config/eslint.config.js';

export default tseslint.config(
  ...sharedConfig,
  {
    ignores: ['node_modules', 'dist', 'coverage', '**/*.spec.ts', '**/*.test.ts'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['eslint.config.js', 'tsup.config.ts', 'vitest.config.ts', 'src/provider.tsx'],
    languageOptions: {
      parserOptions: {
        project: [],
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },
);