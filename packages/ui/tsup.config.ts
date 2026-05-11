import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/globals.css'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'tailwindcss'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
