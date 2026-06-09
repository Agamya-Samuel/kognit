import tseslint from "typescript-eslint";
import sharedConfig from "../config/eslint.config.js";

export default tseslint.config(...sharedConfig, {
  ignores: ["node_modules", "dist", "coverage"],
});
