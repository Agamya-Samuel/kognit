import tseslint from 'typescript-eslint';
import * as nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
  {
    ignores: ['node_modules', '.next', 'dist', 'coverage', 'src/app/dashboard/settings/page.tsx'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
    },
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
);