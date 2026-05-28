const tseslint = require('typescript-eslint');
const sharedConfig = require('../../packages/config/eslint.config.js');

module.exports = [
  ...sharedConfig,
  {
    ignores: ['dist/**', 'node_modules/**', '**/__tests__/**', '**/*.spec.ts', 'test/**'],
  },
  {
    files: ['**/*.ts'],
    rules: {
      // Override shared config rules for API-specific needs
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];