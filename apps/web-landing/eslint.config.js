import tseslint from 'typescript-eslint';
import * as nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
  {
    ignores: ['node_modules', '.next', 'dist', 'coverage', 'src/test/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ['./tsconfig.json'],
      },
    },
    rules: {
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
);