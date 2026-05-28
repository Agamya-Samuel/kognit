import tseslint from 'typescript-eslint';
import sharedConfig from '../config/eslint.config.js';

export default tseslint.config(
  ...sharedConfig,
  {
    ignores: ['node_modules', 'dist', 'coverage'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ['./tsconfig.json'],
      },
    },
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
);