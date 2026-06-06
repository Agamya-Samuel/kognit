import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/globals.css', 'src/tokens/index.css', 'src/tokens/tailwind.css'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'tailwindcss', 'libphonenumber-js', 'cmdk'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
