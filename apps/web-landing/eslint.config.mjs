import tseslint from "typescript-eslint";
import sharedConfig from "../../packages/config/eslint.config.js";

export default tseslint.config(...sharedConfig, {
  ignores: ["node_modules", ".next", "dist", "coverage"],
});
