import tseslint from 'typescript-eslint';
import js from '@eslint/js';

export default tseslint.config(
  { ignores: ['node_modules', 'dist', '.next', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        // Note: Individual packages should override this with their own tsconfig path
        // For now, we'll rely on the project root tsconfig or each package's own
        // This is a base config that packages will extend
        tsconfigRootDir: import.meta.dirname,
        project: ['./tsconfig.base.json'],
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',
    },
  }
);