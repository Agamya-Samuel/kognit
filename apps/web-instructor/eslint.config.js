import tseslint from 'typescript-eslint';
import next from '@next/eslint-plugin-next';
import sharedConfig from '../../packages/config/eslint.config.js';

export default tseslint.config(
  ...sharedConfig,
  {
    ignores: ['node_modules', '.next', 'dist', 'coverage', 'src/test/**', 'src/app/dashboard/page.tsx'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@next/next': next,
    },
    rules: {
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
    },
  },
);