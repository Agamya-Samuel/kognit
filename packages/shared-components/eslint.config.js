import tseslint from 'typescript-eslint';
import sharedConfig from '../../packages/config/eslint.config.js';

export default tseslint.config(
  ...sharedConfig,
  {
    ignores: ['node_modules', 'dist', 'coverage'],
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
);