import tseslint from 'typescript-eslint';
import sharedConfig from '../config/eslint.config.js';

export default tseslint.config(
  ...sharedConfig,
  {
    ignores: ['node_modules', 'dist', 'coverage'],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', '../config/tsconfig.base.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Disable rules that require type information or are problematic for this validation package
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },
  {
    files: ['eslint.config.js', 'tsup.config.ts', 'tsup.config.bundled_*.mjs'],
    languageOptions: {
      parserOptions: {
        project: [],
      },
    },
    rules: {
      // Turn off type-requiring rules for config files
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    },
  }
);