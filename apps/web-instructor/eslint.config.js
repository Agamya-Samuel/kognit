import tseslint from "typescript-eslint";
import sharedConfig from "../../packages/config/eslint.config.js";

export default tseslint.config(
  ...sharedConfig,
  {
    ignores: ["node_modules", ".next", "dist", "coverage"],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
);
