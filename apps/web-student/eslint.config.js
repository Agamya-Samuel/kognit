import tseslint from 'typescript-eslint';
import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
  { ignores: ['node_modules', '.next', 'dist', 'coverage', '**/*.spec.ts', '**/*.test.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'prefer-const': 'error',
      'no-console': 'warn',
    },
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {
      parserOptions: {
        project: [],
      },
    },
  },
);