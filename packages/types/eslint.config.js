import tseslint from 'typescript-eslint';
import sharedConfig from '../config/eslint.config.js';

export default tseslint.config(
  ...sharedConfig,
  {
    ignores: ['node_modules', 'dist', 'coverage'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', '../config/tsconfig.base.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Disable rules that require type information or are problematic for this types-only package
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },
  {
    files: ['eslint.config.js', 'package.json', 'tsup.config.ts'],
    languageOptions: {
      parserOptions: {
        project: [],
      },
    },
    rules: {
      // Turn off type-requiring rules for config files
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      // Turn off unused expressions rule for JSON files (package.json) and JS/TS config files
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  }
);